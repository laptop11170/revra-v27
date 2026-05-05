import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary" | "gradient";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-display font-medium transition-colors",
          {
            "bg-[hsl(var(--surface-container-high))] text-[hsl(var(--on-surface-variant))]": variant === "default",
            "bg-[hsl(var(--success)_/_0.15)] text-[hsl(var(--success))]": variant === "success",
            "bg-[hsl(var(--warning)_/_0.15)] text-[hsl(var(--warning))]": variant === "warning",
            "bg-[hsl(var(--danger)_/_0.15)] text-[hsl(var(--danger))]": variant === "danger",
            "bg-[hsl(var(--info)_/_0.15)] text-[hsl(var(--info))]": variant === "info",
            "bg-[hsl(var(--primary)_/_0.15)] text-[hsl(var(--primary))]": variant === "primary",
            "bg-gradient-primary text-white": variant === "gradient",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
