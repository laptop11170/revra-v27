import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getEmmaClient } from "@/lib/emma/client";

// POST /api/emma/messaging/connect-link
// Mint an OAuth connect link for Instagram, WhatsApp, FB Messenger, or Telegram
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
  const { platform, redirect_url, expires_in_seconds } = body;

  const validPlatforms = ["instagram", "whatsapp", "facebook_messenger", "telegram"];
  if (!platform || !validPlatforms.includes(platform)) {
    return NextResponse.json(
      {
        error: `platform must be one of: ${validPlatforms.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Get the workspace's default Emma client ID
  // For now: use the default workspace client. When multi-client is supported,
  // this would come from user.emma_client_id
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("emma_client_id")
    .eq("id", user.workspace_id)
    .single();

  const clientId = workspace?.emma_client_id;
  if (!clientId) {
    return NextResponse.json(
      { error: "No Emma client configured for this workspace" },
      { status: 400 }
    );
  }

  try {
    const emma = getEmmaClient();
    const result = await emma.mintMessagingConnectLink({
      client_id: clientId,
      platform,
      redirect_url: redirect_url || undefined,
      expires_in_seconds: expires_in_seconds || undefined,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const emmaErr = err as { message?: string };
    return NextResponse.json(
      { error: emmaErr.message ?? "Failed to mint connect link" },
      { status: 500 }
    );
  }
}
