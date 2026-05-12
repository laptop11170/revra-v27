// app/api/campaigns/[id]/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendBulkSMS, SendilloAPIError } from "@/lib/sendillo/client";

// POST /api/campaigns/[id]/send — execute a campaign send

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("id, workspace_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const { id } = await params;

  // Fetch campaign
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", user.workspace_id)
    .single();

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (campaign.status !== "draft" && campaign.status !== "scheduled") {
    return NextResponse.json({ error: "Campaign must be draft or scheduled to send" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { lead_ids } = body ?? {};

  // Fetch leads to send to
  const { data: leads } = await supabase
    .from("leads")
    .select("id, phone, first_name, last_name, opted_out")
    .eq("workspace_id", user.workspace_id)
    .eq("opted_out", false)
    .not("phone", "is", null);

  if (!leads || leads.length === 0) {
    return NextResponse.json({ error: "No valid leads to send to" }, { status: 400 });
  }

  // Get sender number
  const { data: senderPhone } = await supabase
    .from("sendillo_phone_numbers")
    .select("phone_number")
    .eq("id", campaign.sender_phone_id)
    .eq("is_active", true)
    .single();

  if (!senderPhone) {
    return NextResponse.json({ error: "Sender phone not found or inactive" }, { status: 400 });
  }

  // Build bulk message list — use message UUID as clientRef for webhook matching
  const messageIds = leads.map(() => crypto.randomUUID());
  const messages = leads.map((lead, i) => ({
    from: senderPhone.phone_number,
    to: lead.phone,
    body: campaign.message_body ?? "",
    clientRef: messageIds[i],
  }));

  // Send via Sendillo
  let sendilloResult: { total: number; successful: number; failed: number; results?: Array<{ clientRef: string; success: boolean; error?: string }> } | null = null;

  try {
    sendilloResult = await sendBulkSMS(messages);
  } catch (err) {
    if (err instanceof SendilloAPIError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    throw err;
  }

  // Insert outbound messages into DB (one per lead) using known UUIDs
  const messageRows = leads.map((lead, i) => ({
    id: messageIds[i],
    workspace_id: user.workspace_id,
    lead_id: lead.id,
    agent_id: campaign.created_by ?? null,
    campaign_id: campaign.id,
    channel: "sms",
    direction: "outbound",
    body: campaign.message_body ?? "",
    external_id: senderPhone.phone_number,
    external_status: "pending",
    sent_at: new Date().toISOString(),
  }));

  await supabase.from("messages").insert(messageRows);

  // Update per-message status from Sendillo results (matched by clientRef = lead.id)
  if (sendilloResult?.results) {
    for (const result of sendilloResult.results) {
      if (result.success) {
        await supabase
          .from("messages")
          .update({ external_status: "pending" })
          .eq("id", result.clientRef);
      } else {
        await supabase
          .from("messages")
          .update({ external_status: "failed" })
          .eq("id", result.clientRef);
      }
    }
  }

  // Update campaign
  await supabase
    .from("campaigns")
    .update({
      status: "active",
      sent: messages.length,
    })
    .eq("id", campaign.id);

  return NextResponse.json({
    campaign_id: campaign.id,
    queued: sendilloResult?.successful ?? messages.length,
    failed: sendilloResult?.failed ?? 0,
    results: sendilloResult?.results ?? [],
  });
}
