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

  const { data, error } = await supabase
    .from("appointments")
    .select("*, lead:leads(id, first_name, last_name, phone, email)")
    .eq("workspace_id", user.workspace_id)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = data ?? [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split("T")[0];
  const upcomingCount = items.filter((a) => a.date >= todayStart && a.status !== "cancelled").length;

  return NextResponse.json({
    appointments: items,
    upcoming_count: upcomingCount,
  });
}

export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const { lead_id, title, date, time, duration, type, meeting_link } = body;

  if (!title || !date || !time) {
    return NextResponse.json({ error: "title, date, and time are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      workspace_id: user.workspace_id,
      lead_id: lead_id ?? null,
      title,
      date,
      time,
      duration: duration ?? 30,
      type: type ?? "Phone",
      status: "pending",
      agent_id: user.id,
      meeting_link: meeting_link ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ appointment: data }, { status: 201 });
}