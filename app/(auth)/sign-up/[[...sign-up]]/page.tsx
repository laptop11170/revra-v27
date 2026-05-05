"use client";

import { SignUp } from "@clerk/nextjs";
import { useTheme } from "@/context/theme-provider";

export default function SignUpPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "hsl(var(--background))" : "#09090b",
      }}
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/select-workspace"
        appearance={{
          variables: {
            colorBackground: isDark ? "hsl(var(--surface))" : "#ffffff",
            colorInputBackground: isDark ? "hsl(var(--surface-container))" : "#ffffff",
            colorText: isDark ? "hsl(var(--on-surface))" : "#18181b",
            colorTextSecondary: isDark ? "hsl(var(--muted-foreground))" : "#71717a",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
}