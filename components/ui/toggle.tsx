"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, label, description, disabled = false, size = "md" }: ToggleProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          size === "sm" ? "h-5 w-9" : "h-6 w-11",
          checked ? "bg-blue-600" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow transform transition-transform",
            size === "sm" ? "h-4 w-4 mt-0.5" : "h-5 w-5",
            checked ? (size === "sm" ? "translate-x-4" : "translate-x-5") : "translate-x-0.5"
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-900">{label}</p>}
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      )}
    </label>
  );
}