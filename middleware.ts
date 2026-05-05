import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/select-workspace",
  "/api/webhooks/clerk(.*)",
  "/api/health(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();

  const pathname = req.nextUrl.pathname;

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const { createServiceSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.next();
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, workspace_id, role")
    .eq("clerk_user_id", userId)
    .single();

  const hasWorkspace = !!user?.workspace_id;
  const role = user?.role || "agent";

  // Redirect /select-workspace to dashboard if user already has a workspace
  if (pathname === "/select-workspace" && hasWorkspace) {
    const redirectTo = role === "superadmin" ? "/superadmin" : role === "admin" ? "/admin" : "/user";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // No workspace — redirect to select-workspace
  if (!hasWorkspace && pathname !== "/select-workspace") {
    return NextResponse.redirect(new URL("/select-workspace", req.url));
  }

  // Role-based route protection
  const isSuperAdmin = role === "superadmin";
  const isAdmin = role === "admin" || isSuperAdmin;

  if (pathname.startsWith("/superadmin") && !isSuperAdmin) {
    return NextResponse.redirect(new URL("/user", req.url));
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/user", req.url));
  }

  return NextResponse.next();
});

export const config = {
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/select-workspace", "/api/webhooks/clerk(.*)", "/api/health(.*)"],
  ignoredRoutes: ["/api/webhooks/clerk(.*)", "/api/trpc/(.*)"],
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};