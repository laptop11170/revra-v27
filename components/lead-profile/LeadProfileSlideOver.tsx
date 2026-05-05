"use client";

import { X, Phone, MessageSquare, Mail, Star, ChevronDown, Calendar, Clock, User, Tag, MoreHorizontal, ExternalLink, Edit3, Trash2, Activity, ArrowUpRight, MessageCircle, Mail as MailIcon } from "lucide-react";
import { useLeadProfile, LeadData } from "@/context/lead-profile-context";
import { useState } from "react";

const stageColors: Record<string, { bg: string; color: string }> = {
  "New":          { bg: "rgba(99,102,241,0.15)",   color: "var(--indi-400)" },
  "Qualified":    { bg: "rgba(6,182,212,0.15)",    color: "var(--cyan)" },
  "Booked":       { bg: "rgba(16,185,129,0.15)",   color: "var(--mint)" },
  "Demo Scheduled": { bg: "rgba(139,92,246,0.15)", color: "var(--viol-400)" },
  "Follow-up":    { bg: "rgba(245,158,11,0.15)",   color: "var(--amber)" },
  "Nurture":      { bg: "rgba(245,158,11,0.12)",   color: "var(--amber)" },
  "Proposal":     { bg: "rgba(16,185,129,0.12)",   color: "var(--mint)" },
  "Negotiation":  { bg: "rgba(245,158,11,0.15)",   color: "var(--amber)" },
};

const activities = [
  { type: "call", icon: Phone, label: "Called by Emma AI", detail: "Duration: 4m 12s · No answer, voicemail left", time: "Today, 2:30 PM", color: "var(--indi-400)" },
  { type: "sms", icon: MessageSquare, label: "SMS sent via Twilio", detail: "\"Hey there! Check out our latest offer...\"", time: "Today, 12:15 PM", color: "var(--cyan)" },
  { type: "email", icon: MailIcon, label: "Email opened", detail: "Subject: Quick question for you", time: "Yesterday, 4:00 PM", color: "var(--mint)" },
  { type: "stage", icon: Activity, label: "Stage changed to Qualified", detail: "Auto-updated by Emma", time: "Yesterday, 3:45 PM", color: "var(--viol-400)" },
  { type: "note", icon: MessageCircle, label: "Note added", detail: "High intent — asked about enterprise pricing", time: "May 21, 11:30 AM", color: "var(--ink-mute)" },
  { type: "email", icon: MailIcon, label: "Email sent", detail: "Intro Email sequence started", time: "May 20, 9:00 AM", color: "var(--mint)" },
];

const conversations = [
  { name: "Jordan Lee", preview: "Yes, that would be helpful. What's the next step?", time: "9:09 PM", unread: 0 },
  { name: "Jordan Lee", preview: "Revra connects seamlessly with your CRM, email...", time: "May 22", unread: 2 },
];

const tabs = ["Overview", "Activity", "Conversations", "Campaigns"];

export function LeadProfileSlideOver() {
  const { activeLead, closeLead } = useLeadProfile();
  const [tab, setTab] = useState("Overview");
  const [score, setScore] = useState(activeLead?.score ?? 0);

  if (!activeLead) return null;

  const stageStyle = stageColors[activeLead.stage] || stageColors["New"];
  const initials = activeLead.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeLead}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(5,7,15,0.62)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 40,
        }}
      />

      {/* Slide-over panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 520,
          background: "var(--surface)",
          borderLeft: "1px solid var(--line)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
          animation: "slideInRight 0.18s cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid rgba(37,43,63,0.5)",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div
            className="avatar"
            style={{
              width: 48,
              height: 48,
              background: activeLead.hot === "hot"
                ? "rgba(16,185,129,0.2)"
                : activeLead.hot === "warm"
                ? "rgba(245,158,11,0.2)"
                : "var(--surface-3)",
              color: activeLead.hot === "hot" ? "var(--mint)" : activeLead.hot === "warm" ? "var(--amber)" : "var(--ink)",
              fontSize: 15,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
                {activeLead.name}
              </h2>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "var(--radius-md)",
                  background: stageStyle.bg,
                  color: stageStyle.color,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {activeLead.stage}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-mute)", marginTop: 2 }}>
              {activeLead.role} · {activeLead.org}
            </div>
          </div>
          <button
            onClick={closeLead}
            className="btn-icon p-2"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "14px 20px",
            borderBottom: "1px solid rgba(37,43,63,0.4)",
          }}
        >
          <button
            className="btn-primary"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", fontSize: 13 }}
          >
            <Phone size={13} />
            Call
          </button>
          <button
            className="btn-ghost"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", fontSize: 13 }}
          >
            <MessageSquare size={13} />
            SMS
          </button>
          <button
            className="btn-ghost"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", fontSize: 13 }}
          >
            <Mail size={13} />
            Email
          </button>
          <button className="btn-icon p-2">
            <MoreHorizontal size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: "10px 20px 0",
            borderBottom: "1px solid rgba(37,43,63,0.4)",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: tab === t ? "var(--surface-2)" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--ink-mute)",
                boxShadow: tab === t ? "inset 0 0 0 1px var(--line-2)" : "none",
                transition: "all 0.12s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* ── OVERVIEW ── */}
          {tab === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Score & Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Lead Score */}
                <div
                  style={{
                    borderRadius: "var(--radius-xl)",
                    background: "rgba(19,24,38,0.5)",
                    border: "1px solid var(--line)",
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 10 }}>
                    Lead Score
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative", width: 52, height: 52 }}>
                      {/* SVG gauge */}
                      <svg viewBox="0 0 36 36" style={{ width: 52, height: 52, transform: "rotate(-90deg)" }}>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none"
                          stroke={score >= 80 ? "var(--mint)" : score >= 50 ? "var(--amber)" : "var(--ink-faint)"}
                          strokeWidth="3"
                          strokeDasharray={`${score * 0.942} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                          {score}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>Health</div>
                      <div style={{ fontSize: 11.5, color: score >= 80 ? "var(--mint)" : score >= 50 ? "var(--amber)" : "var(--ink-mute)", marginTop: 2 }}>
                        {score >= 80 ? "Hot" : score >= 50 ? "Warm" : "Cold"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source */}
                <div
                  style={{
                    borderRadius: "var(--radius-xl)",
                    background: "rgba(19,24,38,0.5)",
                    border: "1px solid var(--line)",
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 10 }}>
                    Source
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{activeLead.source}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 4 }}>
                    Created {activeLead.createdAt}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div
                style={{
                  borderRadius: "var(--radius-xl)",
                  background: "rgba(19,24,38,0.5)",
                  border: "1px solid var(--line)",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 12 }}>
                  Contact Information
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Email", value: activeLead.email, icon: Mail },
                    { label: "Phone", value: activeLead.phone, icon: Phone },
                    { label: "Organization", value: activeLead.org, icon: User },
                    { label: "Role", value: activeLead.role, icon: Tag },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <item.icon size={14} style={{ color: "var(--ink-faint)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--ink-faint)", width: 90, flexShrink: 0 }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Agent */}
              <div
                style={{
                  borderRadius: "var(--radius-xl)",
                  background: "rgba(19,24,38,0.5)",
                  border: "1px solid var(--line)",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 12 }}>
                  Assigned Agent
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="avatar"
                    style={{ width: 32, height: 32, background: "rgba(99,102,241,0.2)", color: "var(--indi-300)", fontSize: 11, fontWeight: 600 }}
                  >
                    {activeLead.assignedTo.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{activeLead.assignedTo}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>Last activity: {activeLead.lastActivity}</div>
                  </div>
                  <button className="btn-ghost" style={{ marginLeft: "auto", padding: "5px 10px", fontSize: 12 }}>
                    <Edit3 size={12} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div
                style={{
                  borderRadius: "var(--radius-xl)",
                  background: "rgba(19,24,38,0.5)",
                  border: "1px solid var(--line)",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginBottom: 10 }}>
                  Tags
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {activeLead.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "var(--radius-md)",
                        fontSize: 11.5,
                        fontWeight: 500,
                        background: "rgba(99,102,241,0.12)",
                        color: "var(--indi-400)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    style={{
                      padding: "4px 10px",
                      borderRadius: "var(--radius-md)",
                      fontSize: 11.5,
                      fontWeight: 500,
                      border: "1px dashed var(--line)",
                      background: "transparent",
                      color: "var(--ink-mute)",
                      cursor: "pointer",
                    }}
                  >
                    + Add tag
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {tab === "Activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {activities.map((act, i) => {
                const Icon = act.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "14px 0",
                      borderBottom: i < activities.length - 1 ? "1px solid rgba(37,43,63,0.35)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-md)",
                        background: `${act.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} style={{ color: act.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{act.label}</span>
                        <span style={{ fontSize: 11, color: "var(--ink-faint)", flexShrink: 0 }}>{act.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2, lineHeight: 1.4 }}>{act.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── CONVERSATIONS ── */}
          {tab === "Conversations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {conversations.map((c, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(19,24,38,0.5)",
                    border: "1px solid var(--line)",
                    padding: "14px 16px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar"
                        style={{ width: 32, height: 32, background: "var(--surface-3)", color: "var(--ink)", fontSize: 11, fontWeight: 600 }}
                      >
                        {activeLead.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{c.preview}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
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
                          }}
                        >
                          {c.unread}
                        </span>
                      )}
                      <ExternalLink size={12} style={{ color: "var(--ink-faint)" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 8 }}>{c.time}</div>
                </div>
              ))}
              <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}>
                <MessageSquare size={13} style={{ marginRight: 6 }} />
                View All Conversations
              </button>
            </div>
          )}

          {/* ── CAMPAIGNS ── */}
          {tab === "Campaigns" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Medicare Follow-Up", status: "Active", enrolled: "May 20, 2026" },
                { name: "Q4 Nurture Campaign", status: "Completed", enrolled: "May 18, 2026" },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(19,24,38,0.5)",
                    border: "1px solid var(--line)",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 2 }}>
                      Enrolled: {c.enrolled}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "var(--radius-md)",
                      fontSize: 11,
                      fontWeight: 500,
                      background: c.status === "Active" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                      color: c.status === "Active" ? "var(--mint)" : "var(--indi-400)",
                    }}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
              <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}>
                Enroll in Campaign
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(37,43,63,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>
            Last updated: {activeLead.lastActivity}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Edit3 size={12} /> Edit
            </button>
            <button
              style={{
                padding: "7px 14px",
                fontSize: 12,
                border: "none",
                background: "transparent",
                color: "var(--rose)",
                cursor: "pointer",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 500,
              }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}