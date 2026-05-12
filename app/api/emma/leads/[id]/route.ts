import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// PATCH /api/emma/leads/[id] — update Emma lead status from RevRa
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await req.json();
  const { emma_lead_id, status } = body;

  if (!emma_lead_id) {
    return NextResponse.json({ error: "emma_lead_id is required" }, { status: 400 });
  }

  try {
    const emma = getEmmaClient();
    await emma.updateLead(emma_lead_id, { status });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const emmaErr = err as { message?: string; code?: string };
    return NextResponse.json(
      { error: emmaErr.message ?? "Failed to update Emma lead" },
      { status: 500 }
    );
  }
}
