"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ variant = "rectangular", width, height, className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        variant === "text" && "h-4 rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

// Skeleton for table rows
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} variant="text" className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton for cards
export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-gray-200 space-y-3">
      <Skeleton variant="rectangular" height={20} className="w-1/2" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}

// Skeleton for stats
export function StatSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-gray-200 space-y-2">
      <Skeleton variant="text" height={32} className="w-16" />
      <Skeleton variant="text" className="w-24" />
    </div>
  );
}