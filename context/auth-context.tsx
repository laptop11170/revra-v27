"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

// ─── Auth Context ─────────────────────────────────────────────────────────────
export function AuthContext({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ─── Redirect wrapper for client components ──────────────────────────────────
// Use this inside pages that need auth
export function ProtectedRoute({
  children,
  allowedRoles = ["superadmin", "admin", "agent"],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  // Clerk's <SignedIn> and <SignedOut> components handle auth in ClerkProvider
  // For fine-grained role checks, use server components + auth()
  return <>{children}</>;
}