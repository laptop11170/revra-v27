"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: "underline" | "pill";
  size?: "sm" | "md";
}

export function Tabs({ tabs, activeTab, onChange, variant = "pill", size = "md" }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1",
        variant === "underline" ? "border-b border-gray-200" : ""
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "font-medium transition-colors relative",
            size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2",
            variant === "pill" && "rounded-lg",
            variant === "underline" && "rounded-none border-b-2",
            activeTab === tab.key
              ? variant === "pill"
                ? "bg-blue-100 text-blue-700"
                : "text-blue-600 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-gray-400">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Tab Panel — use with Tabs
interface TabPanelProps {
  activeTab: string;
  tabKey: string;
  children: React.ReactNode;
}

export function TabPanel({ activeTab, tabKey, children }: TabPanelProps) {
  if (activeTab !== tabKey) return null;
  return <div>{children}</div>;
}