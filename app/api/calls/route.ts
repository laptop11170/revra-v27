import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("lead_id") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("calls")
    .select(`
      *,
      lead:leads!calls_lead_id_fkey(id, first_name, last_name, phone)
    `, { count: "exact" })
    .eq("workspace_id", user.workspace_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (leadId) query = query.eq("lead_id", leadId);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute stats
  const allCalls = data || [];
  const totalCalls = count ?? allCalls.length;
  const contactedCount = allCalls.filter(c => c.outcome === "Contacted").length;
  const voicemailCount = allCalls.filter(c => c.outcome === "Voicemail").length;
  const noAnswerCount = allCalls.filter(c => c.outcome === "No Answer").length;

  // Add lead_name to each call
  const callsWithLeadName = allCalls.map(call => ({
    ...call,
    lead_name: call.lead ? `${call.lead.first_name || ""} ${call.lead.last_name || ""}`.trim() : null,
  }));

  return NextResponse.json({
    calls: callsWithLeadName,
    total: totalCalls,
    stats: {
      total: totalCalls,
      contacted: contactedCount,
      voicemail: voicemailCount,
      no_answer: noAnswerCount,
    },
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const body = await req.json();
  const { lead_id, duration, direction, outcome, summary, is_ai, has_recording } = body;

  if (!lead_id || !direction) {
    return NextResponse.json({ error: "lead_id and direction are required" }, { status: 400 });
  }

  const validDirections = ["outbound", "inbound", "emma_ai"];
  if (!validDirections.includes(direction)) {
    return NextResponse.json({ error: "direction must be outbound, inbound, or emma_ai" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("calls")
    .insert({
      workspace_id: user.workspace_id,
      lead_id,
      duration: duration || null,
      direction,
      outcome: outcome || null,
      summary: summary || null,
      is_ai: is_ai || false,
      has_recording: has_recording || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ call: data }, { status: 201 });
}
