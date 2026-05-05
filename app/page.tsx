import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has a workspace
  const supabase = createServiceSupabaseClient();
  if (supabase) {
    const { data: user } = await supabase
      .from("users")
      .select("workspace_id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (user?.workspace_id) {
      // User already has workspace — go directly to dashboard
      redirect("/user");
    }
    // No workspace — this shouldn't happen since webhook auto-creates,
    // but redirect to sign-in just in case
  }

  redirect("/sign-in");
}