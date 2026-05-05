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
    .select("workspace_id, id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { count: todayMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", user.workspace_id)
    .gte("created_at", todayStart);

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", user.workspace_id);

  const { count: hotLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("score", 80)
    .eq("workspace_id", user.workspace_id);

  const { count: bookedLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("pipeline_stage", "booked")
    .eq("workspace_id", user.workspace_id);

  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", user.workspace_id)
    .gte("date", todayStart.split("T")[0])
    .lte("date", todayStart.split("T")[0]);

  // 7-day sparkline
  const sparkData: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", user.workspace_id)
      .gte("created_at", dayStart.toISOString())
      .lt("created_at", dayEnd.toISOString());
    sparkData.push({
      label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
      value: count ?? 0,
    });
  }

  return NextResponse.json({
    conversations: todayMessages ?? 0,
    repliesSent: Math.round((todayMessages ?? 0) * 0.75),
    meetingsBooked: bookedLeads ?? 0,
    opportunities: todayAppointments ?? 0,
    totalLeads: totalLeads ?? 0,
    hotLeads: hotLeads ?? 0,
    sparkData,
  });
}