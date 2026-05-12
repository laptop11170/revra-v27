import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// POST /api/emma/leads — push a RevRa lead to Emma AI
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("id, workspace_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const body = await req.json();
  const { lead_id } = body;

  if (!lead_id) {
    return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
  }

  // Fetch the lead from local DB
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", lead_id)
    .eq("workspace_id", user.workspace_id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  try {
    const emma = getEmmaClient();

    const emmaLead = await emma.createLead({
      first_name: lead.first_name,
      last_name: lead.last_name || undefined,
      email: lead.email || undefined,
      phone: lead.phone,
      status: mapStageToEmma(lead.pipeline_stage),
      tags: lead.tags || [],
    });

    // Store the Emma lead ID in enrichment_data
    await supabase
      .from("leads")
      .update({
        enrichment_data: {
          ...(lead.enrichment_data || {}),
          emma_lead_id: emmaLead.id,
        },
      })
      .eq("id", lead_id);

    return NextResponse.json({ emma_lead_id: emmaLead.id, success: true });
  } catch (err: unknown) {
    const emmaErr = err as { message?: string; code?: string };
    return NextResponse.json(
      { error: emmaErr.message ?? "Failed to push lead to Emma" },
      { status: 500 }
    );
  }
}

// Map RevRa pipeline stage to Emma lead status
function mapStageToEmma(stage: string): string {
  const map: Record<string, string> = {
    new_lead: "new",
    contacted: "contacted",
    qualified: "qualified",
    booked: "booked",
    converted: "converted",
    lost: "lost",
    dnc: "dnc",
  };
  return map[stage] ?? "new";
}
