"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  image?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-12 h-12 text-base",
};

const gradients = [
  "from-blue-500 to-purple-500",
  "from-purple-500 to-pink-500",
  "from-pink-500 to-red-500",
  "from-green-500 to-teal-500",
  "from-teal-500 to-blue-500",
  "from-orange-500 to-yellow-500",
  "from-yellow-500 to-green-500",
  "from-indigo-500 to-purple-500",
];

export function Avatar({ name, size = "md", className, image }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradientIndex = name.charCodeAt(0) % gradients.length;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br flex-shrink-0",
        sizeClasses[size],
        gradients[gradientIndex],
        className
      )}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

// Avatar group (stacked avatars)
interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: "xs" | "sm" | "md";
}

export function AvatarGroup({ names, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const remaining = names.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((name, i) => (
        <Avatar key={i} name={name} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div className={cn("rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium ring-2 ring-white", sizeClasses[size])}>
          +{remaining}
        </div>
      )}
    </div>
  );
}