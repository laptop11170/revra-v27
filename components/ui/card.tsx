"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-provider";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 transition-all duration-300 group relative overflow-hidden",
          isDark
            ? "bg-[hsl(var(--surface-container))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
            : "bg-white border border-[hsl(var(--border))] shadow-sm hover:shadow-lg",
          className
        )}
        {...props}
      >
        {/* Gradient accent on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-br rounded-xl" />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { theme } = useTheme();
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-tight", className)}
        style={{ color: "hsl(var(--on-surface))" }}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm", className)}
      style={{ color: "hsl(var(--muted-foreground))" }}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      style={{ borderTop: "1px solid hsl(var(--border))" }}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
