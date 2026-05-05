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
    .select("id, workspace_id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!user?.workspace_id) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage") || undefined;
  const agentId = searchParams.get("agent_id") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("workspace_id", user.workspace_id)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (stage) query = query.eq("pipeline_stage", stage);
  if (user.role === "agent") {
    query = query.eq("assigned_agent_id", user.id);
  } else if (agentId) {
    query = query.eq("assigned_agent_id", agentId);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ leads: data, total: count });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Agents cannot create leads" }, { status: 403 });
  }

  const body = await req.json();
  const { first_name, last_name, phone, email, lead_type, source, assigned_agent_id } = body;

  if (!first_name || !phone) {
    return NextResponse.json({ error: "first_name and phone are required" }, { status: 400 });
  }

  const { data: agentUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: user.workspace_id,
      first_name,
      last_name: last_name || null,
      phone,
      email: email || null,
      lead_type: lead_type || null,
      source: source || null,
      assigned_agent_id: assigned_agent_id || agentUser?.id || null,
      pipeline_stage: "new_lead",
      score: 0,
      tags: [],
      previous_stages: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ lead: data }, { status: 201 });
}