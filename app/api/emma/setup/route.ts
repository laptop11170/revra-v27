import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// GET /api/emma/setup — check if Emma AI is configured
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.EMMA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ configured: false, reason: "EMMA_API_KEY not set" });
  }

  try {
    const emma = getEmmaClient();
    await emma.listClients({ limit: 1 });
    return NextResponse.json({ configured: true });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    return NextResponse.json({
      configured: false,
      reason: e.message ?? "Invalid API key",
      code: e.code,
    });
  }
}

// POST /api/emma/setup — verify an Emma API key (admin only)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  // Check user is superadmin
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("clerk_user_id", userId)
    .single();

  if (user?.role !== "superadmin") {
    return NextResponse.json({ error: "Superadmin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { api_key } = body;

  if (!api_key) {
    return NextResponse.json({ error: "api_key is required" }, { status: 400 });
  }

  // Verify the key by calling Emma
  const tempKey = api_key;
  const { EmmaClient } = await import("@/lib/emma/client");
  const tempClient = new EmmaClient(tempKey);

  try {
    await tempClient.listClients({ limit: 1 });
    return NextResponse.json({ valid: true });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    return NextResponse.json(
      { valid: false, error: e.message ?? "Invalid API key", code: e.code },
      { status: 400 }
    );
  }
}
