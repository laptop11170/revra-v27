"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  className?: string;
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const heightClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function Progress({ value, max = 100, label, showValue = false, size = "md", color = "blue", className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-gray-500">{label}</span>}
          {showValue && <span className="text-xs font-medium text-gray-700">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-gray-200 overflow-hidden", heightClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClasses[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Pipeline stage progress bar (stacked)
interface StageProgressProps {
  stages: { name: string; count: number; color: string }[];
  className?: string;
}

export function StageProgress({ stages, className }: StageProgressProps) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  return (
    <div className={cn("flex h-2 rounded-full overflow-hidden gap-0.5", className)}>
      {stages.map((stage, i) => (
        <div
          key={i}
          className={cn("transition-all", stage.color)}
          style={{ width: `${(stage.count / total) * 100}%` }}
          title={`${stage.name}: ${stage.count}`}
        />
      ))}
    </div>
  );
}

// Goal progress (e.g., 24/30 calls)
interface GoalProgressProps {
  current: number;
  goal: number;
  label?: string;
  color?: "blue" | "green" | "purple";
}

export function GoalProgress({ current, goal, label, color = "blue" }: GoalProgressProps) {
  const pct = Math.min(100, (current / goal) * 100);
  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-gray-500">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-500", colorClasses[color])} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
          {current}/{goal}
        </span>
      </div>
    </div>
  );
}