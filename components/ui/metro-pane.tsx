"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, MessageSquare, Users, Info, ChevronRight } from "lucide-react";

export interface MetroPaneTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface MetroPaneProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  tabs?: MetroPaneTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function MetroPane({
  open,
  onClose,
  title,
  subtitle,
  avatar,
  tabs,
  activeTab,
  onTabChange,
  children,
  footer,
  className,
}: MetroPaneProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[35] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Metro Pane */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-[40] flex flex-col",
          "w-full max-w-[560px] md:max-w-[640px]",
          "bg-white border-l border-gray-200 shadow-xl",
          "animate-in slide-in-from-right duration-300",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            {avatar && <div className="flex-shrink-0">{avatar}</div>}
            <div className="min-w-0">
              <h2 className="text-h3 font-semibold text-gray-900 truncate">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 min-h-[48px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

// ===== Discussion Component (inside MetroPane) =====
interface Message {
  id: string;
  sender: "agent" | "teammate" | "system";
  senderName: string;
  avatarInitials?: string;
  avatarColor?: string;
  content: string;
  timestamp: string;
}

interface DiscussionProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function Discussion({ messages, onSendMessage }: DiscussionProps) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageSquare size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">Start the discussion</p>
            <p className="text-xs text-gray-400 mt-1">Send a message to start collaborating</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                  msg.avatarColor || "bg-gray-100 text-gray-600"
                )}
              >
                {msg.avatarInitials || msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{msg.senderName}</span>
                  <span className="text-xs text-gray-400">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            className="flex-1 resize-none text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 min-h-[40px] max-h-[120px] overflow-y-auto"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Member Detail Component =====
interface MemberDetailProps {
  member: {
    name: string;
    email: string;
    role: string;
    status: string;
    lastActive: string;
    leads: number;
    phone?: string;
  };
}

export function MemberDetail({ member }: MemberDetailProps) {
  const statusColor = member.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600";
  const statusDot = member.status === "active" ? "bg-green-500" : "bg-gray-400";

  return (
    <div className="p-6 space-y-6">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {member.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-500">{member.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn("px-2 py-0.5 rounded-md text-xs font-medium", statusColor)}>
              {member.role}
            </div>
            <div className={cn("w-1.5 h-1.5 rounded-full", statusDot)} />
            <span className="text-xs text-gray-400 capitalize">{member.status}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Leads", value: member.leads },
          { label: "Last Active", value: member.lastActive },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="space-y-3">
        {[
          { label: "Email", value: member.email },
          { label: "Phone", value: member.phone || "Not provided" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-500">{item.label}</span>
            <span className="text-sm text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}