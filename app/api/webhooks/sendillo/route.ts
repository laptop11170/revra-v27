// app/api/webhooks/sendillo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// POST /api/webhooks/sendillo
// Handles all Sendillo webhook events:
//   inbound.received, message.delivered, message.sent, message.failed

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { event } = body;

  switch (event) {
    case "inbound.received":
      await handleInbound(body).catch((e) => console.error("[SendilloWebhook] inbound error:", e));
      break;
    case "message.delivered":
      await handleDelivered(body).catch((e) => console.error("[SendilloWebhook] delivered error:", e));
      break;
    case "message.sent":
      await handleSent(body).catch((e) => console.error("[SendilloWebhook] sent error:", e));
      break;
    case "message.failed":
      await handleFailed(body).catch((e) => console.error("[SendilloWebhook] failed error:", e));
      break;
    default:
      console.warn(`[SendilloWebhook] Unknown event: ${event}`);
  }

  return NextResponse.json({ ok: true });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeKeyword(text: string): string {
  return text.trim().toUpperCase();
}

function matchKeyword(body: string, keywords: string[]): boolean {
  const normalized = normalizeKeyword(body);
  return keywords.some((kw) => {
    const pattern = new RegExp(`\\b${normalizeKeyword(kw)}\\b`, "i");
    return pattern.test(normalized);
  });
}

async function handleInbound(payload: InboundPayload) {
  const supabase = createServiceSupabaseClient()!;
  const { from, body: messageBody } = payload;

  // 1. Find lead by phone
  const cleanPhone = from.replace(/\D/g, "");
  const { data: lead } = await supabase
    .from("leads")
    .select("id, opted_out, workspace_id, first_name, last_name, phone")
    .ilike("phone", `%${cleanPhone}`)
    .maybeSingle();

  if (!lead) return;

  // 2. Find most recent outbound SMS from this sender to this lead
  const { data: outboundMsg } = await supabase
    .from("messages")
    .select("id, campaign_id, workspace_id")
    .eq("lead_id", lead.id)
    .eq("direction", "outbound")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let campaignId: string | null = null;
  let positiveKeywords: string[] = [];
  let optoutKeywords: string[] = ["STOP", "UNSUBSCRIBE", "CANCEL"];

  if (outboundMsg?.campaign_id) {
    campaignId = outboundMsg.campaign_id;
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("positive_keywords, optout_keywords")
      .eq("id", campaignId)
      .maybeSingle();

    if (campaign) {
      positiveKeywords = campaign.positive_keywords ?? [];
      optoutKeywords = campaign.optout_keywords ?? ["STOP", "UNSUBSCRIBE", "CANCEL"];
    }
  }

  // 3. Opt-out check
  if (matchKeyword(messageBody, optoutKeywords)) {
    await supabase
      .from("leads")
      .update({ opted_out: true, opted_out_at: new Date().toISOString() })
      .eq("id", lead.id);

    if (campaignId) {
      await supabase.rpc("increment_campaign_optout", { campaign_id: campaignId });
    }
    await logWebhook(supabase, lead.workspace_id, "sendillo", "optout", payload);
    return;
  }

  // 4. Positive keyword → push to Emma AI
  if (matchKeyword(messageBody, positiveKeywords)) {
    await pushLeadToEmma(lead).catch((e) =>
      console.error("[SendilloWebhook] Emma push failed:", e)
    );
    if (campaignId) {
      await supabase.rpc("increment_campaign_emma_synced", { campaign_id: campaignId });
    }
  }

  // 5. Upsert conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("workspace_id", lead.workspace_id)
    .eq("lead_id", lead.id)
    .eq("channel", "sms")
    .maybeSingle();

  if (conv) {
    await supabase
      .from("conversations")
      .update({
        last_message: messageBody,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conv.id);
    await supabase.rpc("increment_conversation_unread", { conv_id: conv.id });
  } else {
    await supabase.from("conversations").insert({
      workspace_id: lead.workspace_id,
      lead_id: lead.id,
      channel: "sms",
      last_message: messageBody,
      last_message_at: new Date().toISOString(),
      unread_count: 1,
    });
  }

  // 6. Store inbound SMS message
  await supabase.from("messages").insert({
    workspace_id: lead.workspace_id,
    lead_id: lead.id,
    channel: "sms",
    direction: "inbound",
    body: messageBody,
    external_id: from,
    external_status: "received",
    campaign_id: campaignId,
    sent_at: new Date().toISOString(),
  });

  // 7. Update campaign replied count
  if (campaignId) {
    await supabase.rpc("increment_campaign_replied", { campaign_id: campaignId });
  }

  // 8. Log webhook
  await logWebhook(supabase, lead.workspace_id, "sendillo", "inbound.received", payload);
}

async function handleDelivered(payload: DeliveredPayload) {
  const supabase = createServiceSupabaseClient()!;
  const { clientRef } = payload;

  const { data: msg } = await supabase
    .from("messages")
    .select("id, campaign_id, workspace_id")
    .eq("id", clientRef)
    .maybeSingle();

  if (!msg) return;

  await supabase.from("messages").update({ external_status: "delivered" }).eq("id", msg.id);

  if (msg.campaign_id) {
    await supabase.rpc("increment_campaign_delivered", { campaign_id: msg.campaign_id });
  }

  await logWebhook(supabase, msg.workspace_id, "sendillo", "message.delivered", payload);
}

async function handleSent(payload: SentPayload) {
  const supabase = createServiceSupabaseClient()!;
  const { clientRef } = payload;

  const { data: msg } = await supabase
    .from("messages")
    .select("id")
    .eq("id", clientRef)
    .maybeSingle();

  if (!msg) return;
  await supabase.from("messages").update({ external_status: "sent" }).eq("id", msg.id);
}

async function handleFailed(payload: FailedPayload) {
  const supabase = createServiceSupabaseClient()!;
  const { clientRef, error } = payload;

  const { data: msg } = await supabase
    .from("messages")
    .select("id, campaign_id, workspace_id")
    .eq("id", clientRef)
    .maybeSingle();

  if (!msg) return;

  await supabase.from("messages").update({ external_status: "failed" }).eq("id", msg.id);

  if (msg.campaign_id) {
    await supabase.rpc("increment_campaign_failed", { campaign_id: msg.campaign_id });
  }

  await logWebhook(supabase, msg.workspace_id, "sendillo", "message.failed", { ...payload, error });
}

// ── Emma push ─────────────────────────────────────────────────────────────────

async function pushLeadToEmma(
  lead: { id: string; first_name: string; last_name: string | null; phone: string }
): Promise<void> {
  const emma = getEmmaClient();
  await emma.createLead({
    first_name: lead.first_name,
    last_name: lead.last_name ?? undefined,
    phone: lead.phone,
    status: "contacted",
    tags: ["sms-campaign", "warm-lead"],
  });
}

// ── Webhook logging ────────────────────────────────────────────────────────────

async function logWebhook(
  supabase: ReturnType<typeof createServiceSupabaseClient> | null,
  workspaceId: string | null,
  provider: string,
  eventType: string,
  payload: unknown
) {
  if (!supabase || !workspaceId) return;
  await supabase.from("webhooks_log").insert({
    workspace_id: workspaceId,
    provider,
    event_type: eventType,
    payload: payload as Record<string, unknown>,
    processed: true,
    processed_at: new Date().toISOString(),
  });
}

// ── Payload types ─────────────────────────────────────────────────────────────

interface InboundPayload {
  event: "inbound.received";
  from: string;
  to: string;
  body: string;
  timestamp: string;
}

interface DeliveredPayload {
  event: "message.delivered";
  to: string;
  clientRef: string;
  timestamp: string;
}

interface SentPayload {
  event: "message.sent";
  to: string;
  clientRef: string;
  timestamp: string;
}

interface FailedPayload {
  event: "message.failed";
  to: string;
  clientRef: string;
  error: string;
  timestamp: string;
}