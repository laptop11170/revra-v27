// app/api/webhooks/sendillo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// POST /api/webhooks/sendillo
// Handles all Sendillo webhook events:
//   inbound.received, message.delivered, message.sent, message.failed

export async function POST(req: NextRequest) {
  // Respond fast — processing is fire-and-forget
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
  const supabase = createServiceSupabaseClient();
  const { from, to, body: messageBody } = payload;

  // 1. Find lead by phone (strip non-digits for matching)
  const cleanPhone = from.replace(/\D/g, "");
  const { data: lead } = await supabase
    .from("leads")
    .select("id, opted_out, workspace_id, first_name, last_name")
    .ilike("phone", `%${cleanPhone}`)
    .maybeSingle();

  if (!lead) {
    console.log(`[SendilloWebhook] No lead found for phone: ${from}`);
    return;
  }

  // 2. Find active campaign where this lead received an SMS (via messages.campaign_id)
  //    We look for the most recent outbound message from this sender to this lead
  const { data: outboundMsg } = await supabase
    .from("messages")
    .select("id, campaign_id, workspace_id")
    .eq("lead_id", lead.id)
    .eq("direction", "outbound")
    .eq("external_id", to)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let campaignId: string | null = null;
  let positiveKeywords: string[] = [];
  let optoutKeywords: string[] = ["STOP", "UNSUBSCRIBE", "CANCEL"];
  let emmaSynced = 0;

  if (outboundMsg?.campaign_id) {
    campaignId = outboundMsg.campaign_id;
    // Fetch campaign keyword config
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("positive_keywords, optout_keywords")
      .eq("id", campaignId)
      .maybeSingle();

    if (campaign) {
      positiveKeywords = campaign.positive_keywords || [];
      optoutKeywords = campaign.optout_keywords || ["STOP", "UNSUBSCRIBE", "CANCEL"];
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
    emmaSynced = 1;
    await pushLeadToEmma(lead, messageBody).catch((e) =>
      console.error("[SendilloWebhook] Emma push failed:", e)
    );

    if (campaignId) {
      await supabase.rpc("increment_campaign_emma_synced", { campaign_id: campaignId });
    }
  }

  // 5. Store inbound SMS message
  await upsertInboundMessage(supabase, {
    leadId: lead.id,
    workspaceId: lead.workspace_id,
    campaignId,
    senderPhone: from,
    body: messageBody,
    direction: "inbound",
  });

  // 6. Upsert conversation + increment unread
  await upsertConversation(supabase, lead.workspace_id, lead.id, "sms", messageBody);

  // 7. Update campaign replied count
  if (campaignId) {
    await supabase.rpc("increment_campaign_replied", { campaign_id: campaignId });
  }

  // 8. Log webhook
  await logWebhook(supabase, lead.workspace_id, "sendillo", "inbound.received", payload);
}

async function handleDelivered(payload: DeliveredPayload) {
  const supabase = createServiceSupabaseClient();
  const { to, clientRef } = payload;

  const { data: msg } = await supabase
    .from("messages")
    .select("id, campaign_id, workspace_id")
    .eq("id", clientRef)
    .maybeSingle();

  if (!msg) return;

  await supabase
    .from("messages")
    .update({ external_status: "delivered" })
    .eq("id", msg.id);

  if (msg.campaign_id) {
    await supabase.rpc("increment_campaign_delivered", { campaign_id: msg.campaign_id });
  }

  await logWebhook(supabase, msg.workspace_id, "sendillo", "message.delivered", payload);
}

async function handleSent(payload: SentPayload) {
  const supabase = createServiceSupabaseClient();
  const { clientRef } = payload;

  const { data: msg } = await supabase
    .from("messages")
    .select("id")
    .eq("id", clientRef)
    .maybeSingle();

  if (!msg) return;

  await supabase
    .from("messages")
    .update({ external_status: "sent" })
    .eq("id", msg.id);
}

async function handleFailed(payload: FailedPayload) {
  const supabase = createServiceSupabaseClient();
  const { clientRef, error } = payload;

  const { data: msg } = await supabase
    .from("messages")
    .select("id, campaign_id, workspace_id")
    .eq("id", clientRef)
    .maybeSingle();

  if (!msg) return;

  await supabase
    .from("messages")
    .update({ external_status: "failed" })
    .eq("id", msg.id);

  if (msg.campaign_id) {
    await supabase.rpc("increment_campaign_failed", { campaign_id: msg.campaign_id });
  }

  await logWebhook(supabase, msg.workspace_id, "sendillo", "message.failed", { ...payload, error });
}

// ── Emma push ─────────────────────────────────────────────────────────────────

async function pushLeadToEmma(
  lead: { id: string; first_name: string; last_name: string | null; phone: string },
  inboundMessage: string
): Promise<void> {
  const emma = getEmmaClient();
  // Push lead to Emma so Emma can initiate the conversation
  await emma.createLead({
    first_name: lead.first_name,
    last_name: lead.last_name ?? undefined,
    phone: lead.phone,
    status: "contacted",
    tags: ["sms-campaign", "warm-lead"],
  });
}

// ── Conversation helpers ──────────────────────────────────────────────────────

async function upsertConversation(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  workspaceId: string,
  leadId: string,
  channel: string,
  lastMessage: string
) {
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .eq("channel", channel)
    .maybeSingle();

  if (conv) {
    await supabase
      .from("conversations")
      .update({
        last_message: lastMessage,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conv.id);
  } else {
    await supabase.from("conversations").insert({
      workspace_id: workspaceId,
      lead_id: leadId,
      channel,
      last_message: lastMessage,
      last_message_at: new Date().toISOString(),
      unread_count: 1,
    });
    return;
  }

  // Increment unread count
  await supabase.rpc("increment_conversation_unread", { conv_id: conv.id });
}

// ── Message helpers ───────────────────────────────────────────────────────────

async function upsertInboundMessage(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  params: {
    leadId: string;
    workspaceId: string;
    campaignId: string | null;
    senderPhone: string;
    body: string;
    direction: "inbound" | "outbound";
  }
) {
  await supabase.from("messages").insert({
    workspace_id: params.workspaceId,
    lead_id: params.leadId,
    channel: "sms",
    direction: params.direction,
    body: params.body,
    external_id: params.senderPhone,
    external_status: "received",
    campaign_id: params.campaignId,
    sent_at: new Date().toISOString(),
  });
}

// ── Webhook logging ────────────────────────────────────────────────────────────

async function logWebhook(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  workspaceId: string | null,
  provider: string,
  eventType: string,
  payload: unknown
) {
  if (!workspaceId) return;
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
