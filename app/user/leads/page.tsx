"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import { useLeadProfile, LeadData } from "@/context/lead-profile-context";
import {
  Search,
  Filter,
  Plus,
  MessageSquare,
  MoreHorizontal,
  Star,
  Users,
  ChevronDown,
  X,
  Send,
  Paperclip,
  Smile,
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
  assigned_agent_id: string | null;
  last_message_at: string | null;
  created_at: string;
  tags: string[];
  opted_out: boolean;
};

const stages = ["All Leads", "Hot", "Warm", "New", "Booked", "Nurture", "Cold"];

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

function getHotLevel(score: number): "hot" | "warm" | null {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  return null;
}

export default function LeadsPage() {
  const { openLead } = useLeadProfile();
  const [activeFilter, setActiveFilter] = useState("All Leads");
  const [search, setSearch] = useState("");
  const [showBulkSMS, setShowBulkSMS] = useState(false);
  const [smsDraft, setSmsDraft] = useState("Hey there! Check out our latest offer just for you.\nLimited time only. Act now!\nReply STOP to opt out.");
  const [phones, setPhones] = useState<Array<{ id: string; phone_number: string; label: string | null }>>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Load Sendillo phones when bulk SMS modal opens
  useEffect(() => {
    if (showBulkSMS) {
      fetch("/api/sendillo/numbers?type=registered")
        .then((r) => r.json())
        .then((d) => {
          setPhones(d.numbers ?? []);
          if (d.numbers?.[0]?.id) setSelectedPhoneId(d.numbers[0].id);
        })
        .catch(() => {});
    }
  }, [showBulkSMS]);

  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error(`Failed to fetch leads: ${res.status}`);
      const data = await res.json();
      setLeads((data.leads || []).map((l: ApiLead) => ({ ...l, opted_out: false })));
    } catch (err: any) {
      setError(err.message ?? "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter((l) => {
    const hot = getHotLevel(l.score);
    const filterLower = activeFilter.toLowerCase();
    if (activeFilter !== "All Leads" && hot !== filterLower && l.pipeline_stage?.toLowerCase() !== filterLower) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !(`${l.first_name} ${l.last_name}`.toLowerCase().includes(q)) &&
        !(l.email?.toLowerCase().includes(q)) &&
        !l.phone.includes(q)
      ) return false;
    }
    return true;
  });

  const totalContacts = leads.length;
  const hotLeads = leads.filter((l) => getHotLevel(l.score) === "hot").length;
  const warmLeads = leads.filter((l) => getHotLevel(l.score) === "warm").length;
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0;

  return (
    <Shell role="user">
      <div style={{ padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
              Leads
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
              All inbound and Emma-sourced leads.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setShowBulkSMS(true)}>
              <MessageSquare size={13} style={{ marginRight: 6 }} />
              Send Bulk SMS
            </button>
            <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
              <Plus size={13} style={{ marginRight: 6 }} />
              Add Lead
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Contacts", value: totalContacts.toLocaleString(), color: "var(--ink)" },
            { label: "Hot Leads", value: hotLeads.toLocaleString(), delta: "+12%", color: "var(--mint)" },
            { label: "Warm Leads", value: warmLeads.toLocaleString(), delta: "+4", color: "var(--amber)" },
            { label: "Avg. Lead Score", value: String(avgScore), delta: "+4", color: "var(--ink)" },
          ].map((k) => (
            <div key={k.label} className="kpi-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="label">{k.label}</div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--surface-4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={15} style={{ color: "var(--ink-dim)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 4 }}>
                <div className="value" style={{ color: k.color }}>{k.value}</div>
                {k.delta && <div className="delta">{k.delta}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filters-bar" style={{ marginBottom: 16 }}>
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`filter-btn ${activeFilter === s ? "active" : ""}`}
            >
              {s}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button className="filter-btn">
            <Filter size={12} /> More filters
          </button>
          <button className="filter-btn">
            Sort: Last activity <ChevronDown size={12} />
          </button>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 34, paddingLeft: 18 }}>
                  <span className="check-box" />
                </th>
                <th>Lead</th>
                <th>Organization</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Last activity</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--ink-mute)" }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span style={{ fontSize: 13 }}>Loading leads...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ color: "var(--rose)", fontSize: 13 }}>{error}</div>
                  <button className="btn-ghost" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }} onClick={fetchLeads}>Retry</button>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-mute)", fontSize: 13 }}>
                  No leads found
                </td>
              </tr>
            ) : (
              filteredLeads.map((l) => {
                const hot = getHotLevel(l.score);
                const fullName = `${l.first_name} ${l.last_name || ""}`.trim();
                const leadData: LeadData = {
                  id: l.id,
                  name: fullName,
                  email: l.email ?? "",
                  org: l.lead_type ?? "—",
                  role: l.source ?? "",
                  score: l.score,
                  stage: l.pipeline_stage ?? "—",
                  hot,
                  source: l.source ?? "Inbound",
                  phone: l.phone,
                  assignedTo: "—",
                  lastActivity: timeAgo(l.last_message_at),
                  createdAt: timeAgo(l.created_at),
                  tags: l.tags ?? [],
                };
                return (
                <tr
                  key={l.id}
                  onClick={() => openLead(leadData)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ paddingLeft: 18 }}>
                    <span className="check-box" />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar"
                        style={{
                          width: 32,
                          height: 32,
                          background: hot === "hot"
                            ? "rgba(16,185,129,0.2)"
                            : hot === "warm"
                            ? "rgba(245,158,11,0.2)"
                            : "var(--surface-3)",
                          color: hot === "hot" ? "var(--mint)" : hot === "warm" ? "var(--amber)" : "var(--ink-mute)",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {fullName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{fullName}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{l.email ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>{l.lead_type ?? "—"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{l.source ?? "—"}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(139,92,246,0.15)",
                        color: "var(--viol-400)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {l.pipeline_stage ?? "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`lead-score ${hot ?? "cold"}`}
                    >
                      <Star size={11} style={{ fill: "currentColor" }} />
                      {l.score}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-dim)" }}>{timeAgo(l.last_message_at)}</td>
                  <td>
                    <button className="btn-icon p-2">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk SMS Modal */}
      {showBulkSMS && (
        <div
          className="backdrop"
          style={{ position: "fixed", inset: 0, zIndex: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 110 }}
          onClick={() => setShowBulkSMS(false)}
        >
          <div
            className="modal-container"
            style={{ width: "100%", maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px 16px",
                borderBottom: "1px solid rgba(37,43,63,0.5)",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>Send Bulk SMS</h3>
              <button className="btn-icon p-2" onClick={() => setShowBulkSMS(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Recipients */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-mute)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Select Recipients
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(19,24,38,0.5)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={20} style={{ color: "var(--ink-mute)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{filteredLeads.filter((l) => !l.opted_out).length} Leads</div>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>From list: {activeFilter}</div>
                  </div>
                  <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>Change</button>
                </div>
              </div>

              {/* Message */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-mute)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Message
                </div>
                <textarea
                  value={smsDraft}
                  onChange={(e) => setSmsDraft(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 90,
                    resize: "vertical",
                    background: "var(--surface-4)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-lg)",
                    padding: "11px 14px",
                    color: "var(--ink)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, fontSize: 11.5, color: "var(--ink-mute)" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Smile size={14} />
                    <Paperclip size={14} />
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{`{ }`}</code>
                  </div>
                  <span>{smsDraft.length}/160</span>
                </div>
              </div>

              {/* Sender ID */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-mute)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Sender ID
                </div>
                <select
                  className="input"
                  style={{ appearance: "none" }}
                  value={selectedPhoneId}
                  onChange={(e) => setSelectedPhoneId(e.target.value)}
                >
                  {phones.length === 0 && <option>No Sendillo numbers available</option>}
                  {phones.map((p) => (
                    <option key={p.id} value={p.id}>{p.phone_number}{p.label ? ` — ${p.label}` : ""}</option>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  padding: 14,
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                {[
                  { label: "Total Recipients", value: String(filteredLeads.filter((l) => !l.opted_out).length) },
                  { label: "SMS Segments", value: `${Math.ceil(smsDraft.length / 160) || 1} part` },
                  { label: "Opted Out", value: String(filteredLeads.filter((l) => l.opted_out).length) },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {sendError && (
                <div style={{ color: "hsl(var(--destructive))", fontSize: 13, padding: "8px 12px", borderRadius: 8, background: "hsl(var(--destructive)/0.1)" }}>
                  {sendError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderTop: "1px solid rgba(37,43,63,0.5)",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-mute)", cursor: "pointer" }}>
                <span className="check-box" />
                Schedule for later
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setShowBulkSMS(false)}>
                  Cancel
                </button>
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                  onClick={async () => {
                    const validLeads = filteredLeads.filter((l) => !l.opted_out);
                    if (validLeads.length === 0) { setSendError("No valid leads to send to."); return; }
                    if (!selectedPhoneId) { setSendError("Select a sender number first."); return; }
                    setSending(true);
                    setSendError("");
                    try {
                      const res = await fetch("/api/campaigns", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: `Quick SMS from Leads — ${new Date().toLocaleDateString()}`,
                          sender_phone_id: selectedPhoneId,
                          message_body: smsDraft,
                          positive_keywords: ["interested", "yes", "more info"],
                          optout_keywords: ["STOP", "UNSUBSCRIBE", "CANCEL"],
                          lead_ids: validLeads.map((l) => l.id),
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setShowBulkSMS(false);
                        setSmsDraft("Hey there! Check out our latest offer just for you.\nLimited time only. Act now!\nReply STOP to opt out.");
                        // Immediately launch it
                        await fetch(`/api/campaigns/${data.campaign.id}/send`, { method: "POST" });
                      } else {
                        const err = await res.json();
                        setSendError(err.error ?? "Failed to create campaign");
                      }
                    } catch { setSendError("Network error"); }
                    finally { setSending(false); }
                  }}
                  disabled={sending}
                >
                  {sending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
                  Send SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}