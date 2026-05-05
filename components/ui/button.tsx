"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-display font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            // Primary: gradient purple→pink with glow
            "bg-gradient-primary text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-[hsl(var(--primary))]":
              variant === "primary",
            // Secondary: surface container background
            "bg-[hsl(var(--surface-container-high))] text-[hsl(var(--on-surface))] hover:bg-[hsl(var(--surface-container-highest))] focus:ring-[hsl(var(--primary))]":
              variant === "secondary",
            // Outline: transparent with border
            "border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] focus:ring-[hsl(var(--primary))]":
              variant === "outline",
            // Ghost: fully transparent, subtle hover
            "text-[hsl(var(--on-surface-variant))] hover:text-[hsl(var(--on-surface))] hover:bg-[hsl(var(--surface-container))] focus:ring-[hsl(var(--primary))]":
              variant === "ghost",
            // Danger: red, consistent across themes
            "bg-[hsl(var(--danger))] text-white hover:brightness-110 focus:ring-[hsl(var(--danger))]":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs gap-1.5": size === "sm",
            "px-4 py-2 text-sm gap-2": size === "md",
            "px-6 py-3 text-base gap-2": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 size={14} className="animate-spin shrink-0" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
