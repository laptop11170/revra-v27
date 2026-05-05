"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import {
  Plus,
  Phone,
  Paperclip,
  Smile,
  Send,
  Check,
  Calendar,
  Clock,
  Video,
  User,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Loader2,
} from "lucide-react";

type ApiLead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  score: number;
  pipeline_stage: string;
  lead_type: string | null;
  source: string | null;
  last_message_at: string | null;
  created_at: string;
};

type Message = {
  id: string;
  lead_id: string;
  channel: string;
  direction: "inbound" | "outbound";
  body: string;
  sent_at: string;
  created_at: string;
};

type ConvTab = "all" | "unread" | "ai" | "team";

const convTabs: ConvTab[] = ["all", "unread", "ai", "team"];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ConversationsPage() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [errorLeads, setErrorLeads] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const [tab, setTab] = useState<ConvTab>("all");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    setErrorLeads(null);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setLeads(data.leads || []);
      if (data.leads?.length > 0 && !activeId) {
        setActiveId(data.leads[0].id);
      }
    } catch (err: any) {
      setErrorLeads(err.message ?? "Failed to load conversations");
    } finally {
      setLoadingLeads(false);
    }
  }, [activeId]);

  const fetchMessages = useCallback(async (leadId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/messages?limit=50`);
      if (!res.ok) throw new Error(`Failed to fetch messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);
    }
  }, [activeId, fetchMessages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/leads/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "sms", body: draft }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setDraft("");
      }
    } catch {
      // silent fail - keep draft
    } finally {
      setSending(false);
    }
  };

  const convs = leads.map((l) => {
    const initials = `${l.first_name?.[0] ?? ""}${l.last_name?.[0] ?? ""}`.toUpperCase();
    return {
      id: l.id,
      name: `${l.first_name} ${l.last_name || ""}`.trim(),
      initials,
      org: `${l.lead_type ?? "Lead"} · ${l.source ?? "Inbound"}`,
      preview: l.email ?? l.phone,
      time: timeAgo(l.last_message_at),
      tags: [l.pipeline_stage ?? "—"].filter(Boolean),
      unread: 0,
    };
  });

  const filteredConvs = convs.filter((c) => {
    if (tab === "unread") return c.unread > 0;
    return true;
  });

  const currentLead = leads.find((l) => l.id === activeId);
  const currentConv = convs.find((c) => c.id === activeId) ?? convs[0];

  return (
    <Shell role="user">
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {/* Conversation list */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderRight: "1px solid rgba(37,43,63,0.7)",
            display: "flex",
            flexDirection: "column",
            background: "rgba(19,24,38,0.95)",
          }}
        >
          {/* List header */}
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid rgba(37,43,63,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Conversations</h3>
            <button className="btn-icon p-2">
              <Plus size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "8px 12px",
              borderBottom: "1px solid rgba(37,43,63,0.5)",
            }}
          >
            {convTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  textTransform: "capitalize",
                  background: tab === t ? "var(--surface-2)" : "transparent",
                  color: tab === t ? "var(--ink)" : "var(--ink-mute)",
                  boxShadow: tab === t ? "inset 0 0 0 1px var(--line-2)" : "none",
                  transition: "all 0.12s",
                }}
              >
                {t === "all" ? "All" : t === "unread" ? "Unread" : t === "ai" ? "AI" : "Team"}
              </button>
            ))}
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loadingLeads ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 40, color: "var(--ink-mute)" }}>
                <Loader2 size={14} className="animate-spin" />
                <span style={{ fontSize: 12 }}>Loading...</span>
              </div>
            ) : errorLeads ? (
              <div style={{ padding: 20, color: "var(--rose)", fontSize: 12 }}>
                {errorLeads}
                <button className="btn-ghost" style={{ marginTop: 8, padding: "4px 8px", fontSize: 11 }} onClick={fetchLeads}>Retry</button>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ padding: 20, color: "var(--ink-mute)", fontSize: 12, textAlign: "center" }}>No conversations</div>
            ) : (
              filteredConvs.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className="conv-item"
                  style={c.id === activeId ? { background: "var(--surface-2)" } : {}}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--surface-3)",
                      color: "var(--ink)",
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {c.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-faint)", flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.preview}
                    </div>
                    {c.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {c.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            style={{
                              padding: "2px 7px",
                              borderRadius: "var(--radius-md)",
                              fontSize: 10,
                              background: "rgba(139,92,246,0.15)",
                              color: "var(--viol-400)",
                              fontWeight: 500,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {c.unread > 0 && (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        background: "var(--indi-500)",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Chat header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(37,43,63,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {currentConv && (
                <>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--surface-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink)",
                    }}
                  >
                    {currentConv.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{currentConv.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{currentConv.org}</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
              <span
                className="badge"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  color: "var(--mint)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 999, background: "var(--mint)", display: "inline-block" }} />
                Real-time
              </span>
              <button className="btn-icon p-2" title="Start call">
                <Phone size={14} style={{ color: "var(--ink-mute)" }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}
          >
            {loadingMsgs ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ink-mute)", padding: 40 }}>
                <Loader2 size={14} className="animate-spin" />
                <span style={{ fontSize: 12 }}>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ color: "var(--ink-mute)", fontSize: 13, textAlign: "center", padding: 40 }}>
                No messages yet. Send one to start the conversation.
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`conv-message ${m.direction === "outbound" ? "out" : "in"}`}>
                  <div className={`conv-bubble ${m.direction === "outbound" ? "out" : "in"}`}>{m.body}</div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-faint)",
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {timeAgo(m.sent_at)}
                    {m.direction === "outbound" && <Check size={11} />}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(37,43,63,0.7)",
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--surface-4)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-xl)",
                padding: "10px 14px",
              }}
            >
              <Paperclip size={15} style={{ color: "var(--ink-mute)", cursor: "pointer" }} />
              <Smile size={15} style={{ color: "var(--ink-mute)", cursor: "pointer" }} />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "var(--ink)",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !draft.trim()}
                className="btn-primary"
                style={{ borderRadius: "var(--radius-lg)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderLeft: "1px solid rgba(37,43,63,0.7)",
            padding: "20px 16px",
            overflowY: "auto",
            background: "rgba(19,24,38,0.95)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {currentLead && (
            <>
              {/* Lead summary */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 10 }}>
                  Lead Info
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{`${currentLead.first_name} ${currentLead.last_name || ""}`.trim()}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{currentLead.phone}</div>
                  {currentLead.email && <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{currentLead.email}</div>}
                </div>
              </div>

              {/* Stage */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 10 }}>
                  Stage
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(139,92,246,0.15)",
                    color: "var(--viol-400)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {currentLead.pipeline_stage ?? "—"}
                </span>
              </div>
            </>
          )}

          {/* Meeting booked banner */}
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              background: "rgba(19,24,38,0.5)",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "rgba(16,185,129,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <CheckCircle2 size={22} style={{ color: "var(--mint)" }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>AI-Powered</h3>
            <p style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.5 }}>
              Emma is managing this conversation automatically.
            </p>
          </div>

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}>
            View Lead Profile
          </button>
        </div>
      </div>
    </Shell>
  );
}