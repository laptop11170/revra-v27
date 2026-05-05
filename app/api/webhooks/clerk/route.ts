import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// Default workspace ID — matches the demo workspace in seed data
const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

// ─── Clerk Webhook Handler ───────────────────────────────────────────────────
// POST /api/webhooks/clerk
// Handles: user.created, user.updated, user.deleted from Clerk
// Auto-assigns new users to the default workspace as "agent"

export async function POST(req: Request) {
  const body = await req.text();
  const headers = req.headers;

  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
  }

  // Verify webhook signature (add svix verification in production)
  let event: {
    type: string;
    data: {
      id?: string;
      email_addresses?: Array<{ email_address?: string }>;
      first_name?: string;
      last_name?: string;
      image_url?: string;
      public_metadata?: Record<string, unknown>;
    };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { createServiceSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  switch (event.type) {
    case "user.created": {
      const { id: clerk_user_id, email_addresses, first_name, last_name, image_url, public_metadata } = event.data;
      const primaryEmail = email_addresses?.[0]?.email_address ?? "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
      const role = (public_metadata?.role as string) || null;

      // Auto-assign to default workspace if no specific role in metadata
      const assignedRole = role || "agent";

      const { error } = await supabase.from("users").upsert({
        clerk_user_id,
        workspace_id: DEFAULT_WORKSPACE_ID,
        email: primaryEmail,
        full_name: fullName,
        avatar_url: image_url || null,
        role: assignedRole,
      });

      if (error) {
        console.error("clerk webhook: user.created error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;
    }

    case "user.updated": {
      const { id: clerk_user_id, email_addresses, first_name, last_name, image_url, public_metadata } = event.data;
      const primaryEmail = email_addresses?.[0]?.email_address ?? "";

      const { error } = await supabase
        .from("users")
        .update({
          email: primaryEmail,
          full_name: [first_name, last_name].filter(Boolean).join(" ") || null,
          avatar_url: image_url || null,
          role: (public_metadata?.role as string) || "agent",
        })
        .eq("clerk_user_id", clerk_user_id);

      if (error) {
        console.error("clerk webhook: user.updated error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;
    }

    case "user.deleted": {
      const { id: clerk_user_id } = event.data;
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("clerk_user_id", clerk_user_id);

      if (error) {
        console.error("clerk webhook: user.deleted error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;
    }

    default:
      return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}