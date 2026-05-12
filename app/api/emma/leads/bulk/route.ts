import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// POST /api/emma/leads/bulk — push multiple RevRa leads to Emma AI
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
  const { lead_ids } = body;

  if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
    return NextResponse.json(
      { error: "lead_ids (array) is required" },
      { status: 400 }
    );
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .in("id", lead_ids)
    .eq("workspace_id", user.workspace_id);

  if (leadsError) {
    return NextResponse.json({ error: leadsError.message }, { status: 500 });
  }

  const emma = getEmmaClient();
  const results: { id: string; success: boolean; emma_id?: string; error?: string }[] = [];
  const stageMap: Record<string, string> = {
    new_lead: "new",
    contacted: "contacted",
    qualified: "qualified",
    booked: "booked",
    converted: "converted",
    lost: "lost",
    dnc: "dnc",
  };

  for (const lead of leads ?? []) {
    try {
      const emmaLead = await emma.createLead({
        first_name: lead.first_name,
        last_name: lead.last_name || undefined,
        email: lead.email || undefined,
        phone: lead.phone,
        status: stageMap[lead.pipeline_stage] ?? "new",
        tags: lead.tags || [],
      });

      await supabase
        .from("leads")
        .update({
          enrichment_data: {
            ...(lead.enrichment_data || {}),
            emma_lead_id: emmaLead.id,
          },
        })
        .eq("id", lead.id);

      results.push({ id: lead.id, success: true, emma_id: emmaLead.id });
    } catch (err: unknown) {
      const e = err as { message?: string };
      results.push({ id: lead.id, success: false, error: e.message });
    }
  }

  const processed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({ processed, failed, results });
}
