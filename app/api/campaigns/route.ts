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
    .from("campaigns")
    .select("*")
    .eq("workspace_id", user.workspace_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ campaigns: data ?? [] });
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
  const { name, channel, status, start_date } = body;

  if (!name || !channel) {
    return NextResponse.json({ error: "name and channel are required" }, { status: 400 });
  }

  const validChannels = ["sms", "email", "multi"];
  if (!validChannels.includes(channel)) {
    return NextResponse.json({ error: "channel must be sms, email, or multi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: user.workspace_id,
      name,
      channel,
      status: status ?? "draft",
      sent: 0,
      delivered: 0,
      clicked: 0,
      replied: 0,
      leads: 0,
      start_date: start_date ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ campaign: data }, { status: 201 });
}