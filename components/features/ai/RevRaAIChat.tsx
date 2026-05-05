"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Which leads are stalling?",
  "Show me hot leads with Medicare coverage",
  "Who hasn't been contacted in 7+ days?",
  "Summarize my pipeline performance this week",
  "Which appointments are scheduled for tomorrow?",
];

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  actions?: Array<{ label: string; href: string }>;
};

const MOCK_RESPONSES: Record<string, string> = {
  "Which leads are stalling?": "You have **7 leads** that haven't had any activity in the past 7 days:\n\n1. **Robert Williams** — Medicare, last contact 9 days ago — Stage: Contacted\n2. **Patricia Moore** — Final Expense, last contact 12 days ago — Stage: Appointment Scheduled\n3. **James Wilson** — Life Insurance, last contact 8 days ago — Stage: Presentation\n\n💡 **AI Suggestion:** Send a re-engagement text to all 7 leads. I can draft a message for you.",
  "Show me hot leads with Medicare coverage": "Found **14 hot leads** with Medicare coverage:\n\n| Lead | Score | Stage | Assigned Agent |\n|------|-------|-------|----------------|\n| Linda Chen | 94 | Contract | You |\n| Michael Torres | 88 | Presentation | You |\n| Nancy Garcia | 81 | Qualified | You |\n\n\n🔥 **Top Priority:** Linda Chen (94 score) — ready to close.",
  "Who hasn't been contacted in 7+ days?": "**8 leads** haven't been contacted in 7+ days:\n\n• Robert Williams — 9 days\n• Patricia Moore — 12 days\n• James Wilson — 8 days\n• Emma Thompson — 15 days\n\n⚠️ These leads are at risk of going cold.",
  "Summarize my pipeline performance this week": "**This Week Summary:**\n\n• **24 calls** completed (+18% vs last week)\n• **8 leads** moved to next stage\n• **3 appointments** scheduled\n• **$12,400** in projected revenue\n\n📈 **Conversion rate:** 29% — up from 24% last week.",
  "Which appointments are scheduled for tomorrow?": "**3 appointments** tomorrow (May 3):\n\n\n• 10:00 AM — **Patricia Moore** — Phone (Medicare)\n• 2:00 PM — **James Wilson** — Video (Life Insurance)\n• 4:30 PM — **Nancy Garcia** — In-Person (ACA)",
};

export function RevRaAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hi! I'm RevRa AI. Ask me anything about your leads, pipeline, appointments, or team performance. I can help you find stalled deals, draft messages, and prioritize your day.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { addToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Global Cmd+L shortcut to open the overlay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        if (!open) setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200));
    setIsTyping(false);

    const response =
      MOCK_RESPONSES[text.trim()] ||
      `I can help with that! Based on your data, here are some insights:\n\n• You have **24 active leads** in your pipeline\n• **8 leads** are in the Hot Leads category\n• Your conversion rate this month is **29%**\n\nTry asking about specific leads, pipeline stages, or your appointments for more detailed answers.`;

    let actions: Message["actions"] = undefined;
    if (text.trim() === "Which leads are stalling?") {
      actions = [{ label: "Draft Revival Message", href: "/user/ai" }];
    }
    if (text.trim() === "Show me hot leads with Medicare coverage") {
      actions = [{ label: "View in Pipeline", href: "/user/pipeline" }];
    }

    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, role: "ai", content: response, actions },
    ]);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    addToast({ type: "success", title: "Copied to clipboard" });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* ── Collapsed: floating pill at bottom center ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        {/* Glow ring animation */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing primary glow */}
          <div
            className="absolute w-full h-full rounded-full animate-ping"
            style={{
              backgroundColor: "hsl(var(--primary)_/_0.15)",
              animationDuration: "2s",
              animationTimingFunction: "ease-in-out",
            }}
          />
          {/* Spinning conic gradient */}
          <div
            className="absolute w-full h-full rounded-full"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)_/_0.4), hsl(var(--primary))",
              animation: "spin-glow 3s linear infinite",
            }}
          />
          {/* Button with gradient border on hover */}
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-transparent hover:border-gradient"
            style={{
              backgroundColor: "hsl(var(--surface-container))",
              boxShadow: "0 8px 32px hsl(var(--on-surface)_/_0.2), 0 0 0 1px hsl(var(--primary)_/_0.3)",
            }}
          >
            <div className="relative">
              <Bot size={18} style={{ color: "hsl(var(--primary))" }} />
              <div
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "hsl(var(--success))" }}
              />
            </div>
            <span className="font-display font-medium text-sm" style={{ background: "linear-gradient(to right, #a078ff, #00cbe6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Ask RevRa AI</span>
            <kbd
              className="hidden group-hover:inline-flex items-center px-2 py-0.5 text-[10px] rounded border font-mono"
              style={{
                color: "hsl(var(--muted-foreground))",
                backgroundColor: "hsl(var(--surface-container-low))",
                borderColor: "hsl(var(--border))",
              }}
            >
              ⌘L
            </kbd>
          </button>
        </div>
      </div>

      {/* ── Expanded: full-screen overlay ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] backdrop-blur-sm animate-in fade-in duration-300"
            style={{ backgroundColor: "hsl(222 47% 4% / 0.4)" }}
            onClick={handleClose}
          />

          {/* Chat panel with gradient accent */}
          <div
            className="fixed inset-x-4 bottom-4 z-[70] flex flex-col rounded-lg shadow-2xl border overflow-hidden animate-in slide-in-from-bottom-4 duration-400"
            style={{ height: "calc(100vh - 48px)", maxHeight: "780px", backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}
          >
            {/* Gradient top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
            {/* ── Header with gradient accent ── */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] flex-shrink-0">
              {/* Gradient top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-br flex items-center justify-center">
                  <Bot size={20} style={{ color: "hsl(var(--primary))" }} />
                </div>
                <div>
                  <p className="text-base font-display font-semibold" style={{ background: "linear-gradient(to right, #a078ff, #00cbe6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>RevRa AI</p>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Powered by Claude</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl transition-colors"
                style={{
                  color: "hsl(var(--muted-foreground))",
                  backgroundColor: "hsl(var(--surface-container-high))",
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-br flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex-1 min-w-0",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block text-sm text-left px-4 py-3 rounded-lg max-w-[80%] whitespace-pre-wrap leading-relaxed font-display",
                        msg.role === "ai"
                          ? "bg-gradient-br text-[hsl(var(--on-surface))] rounded-bl-md"
                          : "bg-gradient-primary text-white rounded-br-md"
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleCopy(msg.content)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Copy size={11} />
                          Copy
                        </button>
                        {msg.actions?.map((action) => (
                          <a
                            key={action.label}
                            href={action.href}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink size={11} />
                            {action.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">U</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-br flex items-center justify-center flex-shrink-0">
                    <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <div className="px-4 py-3 rounded-lg rounded-bl-md bg-gradient-br">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "hsl(var(--primary))", animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "hsl(var(--secondary))", animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "hsl(var(--primary))", animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested questions */}
              {messages.length === 1 && (
                <div className="pt-2">
                  <p className="text-xs font-display mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Try asking:</p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-left transition-all border border-transparent hover:border-[hsl(var(--primary)_/_0.3)] font-display"
                        style={{ backgroundColor: "hsl(var(--surface-container-high))", color: "hsl(var(--on-surface))" }}
                      >
                        <Sparkles size={13} style={{ color: "hsl(var(--primary))" }} />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div className="px-6 py-4 flex-shrink-0 bg-gradient-br" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                    if (e.key === "Escape") {
                      handleClose();
                    }
                  }}
                  placeholder="Ask about leads, pipeline, appointments..."
                  className="flex-1 text-sm font-display rounded-lg px-4 py-3 resize-none outline-none focus:ring-2 min-h-[48px] max-h-[120px]"
                  style={{
                    backgroundColor: "hsl(var(--surface-container-low))",
                    color: "hsl(var(--on-surface))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  rows={1}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                    input.trim() && !isTyping
                      ? "bg-gradient-primary text-white hover:brightness-110 shadow-md"
                      : "bg-[hsl(var(--surface-container-high))] text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {isTyping ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <p className="text-[10px] font-display text-center mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                RevRa AI may produce inaccurate information. Verify important details.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
