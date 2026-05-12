import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// GET /api/emma/clients — list Emma clients for this workspace
// POST /api/emma/clients — create an Emma client for the current user
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const emma = getEmmaClient();
    const { searchParams } = new URL(req.url);
    const clients = await emma.listClients({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "25"),
    });
    return NextResponse.json(clients);
  } catch (err: unknown) {
    const emmaErr = err as { message?: string };
    return NextResponse.json({ error: emmaErr.message ?? "Emma error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, workspace_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check if user already has an Emma client
  if (user.full_name) {
    try {
      const emma = getEmmaClient();
      const result = await emma.createClient({ name: user.full_name });

      // Store emma_client_id on the user
      await supabase
        .from("users")
        .update({ emma_client_id: result.id })
        .eq("clerk_user_id", userId);

      return NextResponse.json(result, { status: 201 });
    } catch (err: unknown) {
      const emmaErr = err as { message?: string };
      return NextResponse.json({ error: emmaErr.message ?? "Failed to create Emma client" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "User has no full_name set" }, { status: 400 });
}