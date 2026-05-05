import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Browser client — safe to use in client components
// Uses anon key, respects RLS based on Clerk session
let supabaseBrowserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseBrowserClient;
}

// Clerk + Supabase Session Bridge
export async function getSessionUser() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { sessionClaims } = await auth();
    const clerkUserId = sessionClaims?.sub;
    if (!clerkUserId) return null;
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();
    return user;
  } catch {
    return null;
  }
}