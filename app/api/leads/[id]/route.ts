import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("id, workspace_id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select(`
      *,
      assigned_agent:users!assigned_agent_id(id, full_name, email, avatar_url),
      calls:calls(id, status, direction, started_at, duration_seconds, ai_summary, ai_disposition),
      messages:messages(id, channel, direction, body, created_at)
    `)
    .eq("id", id)
    .eq("workspace_id", user.workspace_id)
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("id, workspace_id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const body = await req.json();
  const allowedFields = [
    "first_name", "last_name", "email", "phone", "lead_type",
    "score", "pipeline_stage", "assigned_agent_id", "notes", "tags",
  ];
  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updateData[field] = body[field];
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)
    .eq("workspace_id", user.workspace_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync stage change to Emma AI (fire-and-forget)
  const { pipeline_stage } = body;
  if (pipeline_stage) {
    syncStageToEmma(supabase, id, data).catch(() => {});
  }

  return NextResponse.json({ lead: data });
}

const STAGE_MAP: Record<string, string> = {
  new_lead: "new",
  contacted: "contacted",
  qualified: "qualified",
  booked: "booked",
  converted: "converted",
  lost: "lost",
  dnc: "dnc",
};

async function syncStageToEmma(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  leadId: string,
  lead: Record<string, unknown>
): Promise<void> {
  try {
    const enrichment = (lead.enrichment_data as Record<string, unknown>) || {};
    const emmaLeadId = enrichment.emma_lead_id as string | undefined;
    if (!emmaLeadId) return;

    const emma = getEmmaClient();
    await emma.updateLead(emmaLeadId, {
      status: STAGE_MAP[String(lead.pipeline_stage)] ?? String(lead.pipeline_stage),
    });
  } catch {
    // Non-blocking
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("workspace_id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  if (user.role === "agent") {
    return NextResponse.json({ error: "Agents cannot delete leads" }, { status: 403 });
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("workspace_id", user.workspace_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}