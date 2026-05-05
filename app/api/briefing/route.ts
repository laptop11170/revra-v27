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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Today's metrics
  const { count: todayMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", user.workspace_id)
    .gte("created_at", todayStart);

  const { count: todayLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart)
    .eq("workspace_id", user.workspace_id);

  const { count: hotLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("score", 80)
    .eq("workspace_id", user.workspace_id);

  // Appointments today
  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", user.workspace_id)
    .gte("date", todayStart.split("T")[0])
    .lte("date", todayStart.split("T")[0]);

  // Stage distribution for funnel
  const { data: stageData } = await supabase
    .from("leads")
    .select("pipeline_stage")
    .eq("workspace_id", user.workspace_id);

  const stageCounts: Record<string, number> = {};
  for (const lead of (stageData ?? [])) {
    const stage = lead.pipeline_stage ?? "unknown";
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
  }

  // Recent leads
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("id, first_name, last_name, score, pipeline_stage, created_at, last_message_at")
    .eq("workspace_id", user.workspace_id)
    .order("score", { ascending: false })
    .limit(10);

  // Recent activity
  const { data: recentMessages } = await supabase
    .from("messages")
    .select("id, body, direction, created_at, lead_id")
    .eq("workspace_id", user.workspace_id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Week sparkline (7 days)
  const sparkData: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", user.workspace_id)
      .gte("created_at", dayStart.toISOString())
      .lt("created_at", dayEnd.toISOString());
    sparkData.push({ date: dayStart.toISOString().slice(0, 10), count: count ?? 0 });
  }

  return NextResponse.json({
    todayMessages: todayMessages ?? 0,
    todayLeads: todayLeads ?? 0,
    hotLeads: hotLeads ?? 0,
    todayAppointments: todayAppointments ?? 0,
    stageCounts,
    totalStageLeads: stageData?.length ?? 0,
    recentLeads: recentLeads ?? [],
    recentMessages: recentMessages ?? [],
    sparkData,
  });
}