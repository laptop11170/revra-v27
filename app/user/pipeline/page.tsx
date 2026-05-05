"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Building, Calendar, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLeadProfile, LeadData } from "@/context/lead-profile-context";

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

type StageKey = "new_lead" | "qualifying" | "booked" | "in_progress" | "closed_won";

const colMeta: Record<StageKey, { title: string; color: string }> = {
  new_lead:     { title: "New Leads",     color: "var(--indi-500)" },
  qualifying:   { title: "Qualified",    color: "var(--cyan)" },
  booked:       { title: "Booked",        color: "var(--mint)" },
  in_progress:  { title: "In Progress",   color: "var(--amber)" },
  closed_won:   { title: "Closed Won",    color: "var(--mint)" },
};

const stageOrder: StageKey[] = ["new_lead", "qualifying", "booked", "in_progress", "closed_won"];

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

function SparklineSVG({ positive }: { positive: boolean }) {
  const d = positive
    ? "M0 22 Q15 6 30 14 T60 10 T80 4"
    : "M0 22 Q15 10 30 14 T60 8 T80 12";
  return (
    <svg viewBox="0 0 80 30" style={{ width: 80, height: 28 }}>
      <path d={d} stroke="#7c6cff" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function PipelinePage() {
  const { openLead } = useLeadProfile();
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
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const grouped = stageOrder.reduce<Record<StageKey, ApiLead[]>>((acc, key) => {
    acc[key] = leads.filter((l) => l.pipeline_stage === key);
    return acc;
  }, {} as Record<StageKey, ApiLead[]>);

  const totalPipeline = leads.filter((l) => l.pipeline_stage !== "closed_won").length;
  const hotCount = leads.filter((l) => getHotLevel(l.score) === "hot").length;
  const wonCount = leads.filter((l) => l.pipeline_stage === "closed_won").length;

  return (
    <Shell role="user">
      <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
              Pipeline
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
              Live opportunities across stages.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="filter-btn">
              <Filter size={12} /> Filters
            </button>
            <button className="filter-btn">
              Stage <ChevronDown size={12} />
            </button>
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
              <Plus size={13} style={{ marginRight: 6 }} />
              Add Opportunity
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Leads", value: totalPipeline.toString(), delta: null },
            { label: "Hot Leads", value: hotCount.toString(), delta: "+33%" },
            { label: "Qualified", value: (grouped.qualifying?.length ?? 0).toString(), delta: null },
            { label: "Booked", value: (grouped.booked?.length ?? 0).toString(), delta: null },
            { label: "Won", value: wonCount.toString(), delta: null },
          ].map((k) => (
            <div key={k.label} className="kpi-card">
              <div className="label">{k.label}</div>
              <div className="value">{k.value}</div>
              {k.delta && <div className="delta">↑ {k.delta}</div>}
              <SparklineSVG positive />
            </div>
          ))}
        </div>

        {/* Kanban board */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-mute)" }}>
              <Loader2 size={18} className="animate-spin" />
              <span style={{ fontSize: 13 }}>Loading pipeline...</span>
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--rose)" }}>
            <div style={{ fontSize: 13 }}>{error}</div>
            <button className="btn-ghost" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }} onClick={fetchLeads}>Retry</button>
          </div>
        ) : (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {stageOrder.map((key) => {
            const meta = colMeta[key];
            const stageLeads = grouped[key] ?? [];
            return (
              <div key={key} style={{ minWidth: 260, maxWidth: 300, flex: 1 }}>
                {/* Column header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                    background: "rgba(19,24,38,0.8)",
                    border: "1px solid var(--line)",
                    borderBottom: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color, display: "inline-block" }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{meta.title}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--ink-mute)", fontVariantNumeric: "tabular-nums" }}>
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column body */}
                <div
                  style={{
                    padding: 10,
                    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                    background: "rgba(19,24,38,0.4)",
                    border: "1px solid var(--line)",
                    borderTop: "none",
                    minHeight: 200,
                  }}
                >
                  {stageLeads.map((lead) => {
                    const hot = getHotLevel(lead.score);
                    const fullName = `${lead.first_name} ${lead.last_name || ""}`.trim();
                    const leadData: LeadData = {
                      id: lead.id,
                      name: fullName,
                      email: lead.email ?? "",
                      org: lead.lead_type ?? "—",
                      role: lead.source ?? "",
                      score: lead.score,
                      stage: lead.pipeline_stage ?? "—",
                      hot,
                      source: lead.source ?? "Inbound",
                      phone: lead.phone,
                      assignedTo: "—",
                      lastActivity: timeAgo(lead.last_message_at),
                      createdAt: timeAgo(lead.created_at),
                      tags: [],
                    };
                    return (
                    <div
                      key={lead.id}
                      onClick={() => openLead(leadData)}
                      className={cn("kanban-card", hot === "hot" && "live", lead.pipeline_stage === "closed_won" && "won")}
                      style={{ marginBottom: 8 }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "var(--radius-md)",
                            background: hot === "hot" ? "rgba(16,185,129,0.2)" : "var(--surface-3)",
                            color: hot === "hot" ? "var(--mint)" : "var(--ink-mute)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {fullName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {fullName}
                          </div>
                          {lead.lead_type && (
                            <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{lead.lead_type}</div>
                          )}
                          {lead.pipeline_stage === "closed_won" && (
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--mint)", marginTop: 4 }}>
                              Score: {lead.score}
                            </div>
                          )}
                        </div>
                        {hot === "hot" && (
                          <Sparkles size={13} style={{ color: "var(--viol-500)", flexShrink: 0, marginTop: 2 }} />
                        )}
                      </div>

                      {lead.source && (
                        <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 6 }}>
                          {lead.source} · {timeAgo(lead.last_message_at)}
                        </div>
                      )}
                      {lead.score > 0 && lead.pipeline_stage !== "closed_won" && (
                        <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 6 }}>
                          Score: {lead.score} · {timeAgo(lead.last_message_at)}
                        </div>
                      )}
                      {lead.pipeline_stage === "closed_won" && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "4px 10px",
                            borderRadius: "var(--radius-md)",
                            background: "rgba(16,185,129,0.15)",
                            color: "var(--mint)",
                            fontSize: 11,
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          Won
                        </div>
                      )}
                    </div>
                    );
                  })}

                  {/* Add opportunity */}
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      border: "1px dashed var(--line)",
                      background: "transparent",
                      color: "var(--ink-dim)",
                      fontSize: 12,
                      cursor: "pointer",
                      marginTop: 4,
                      transition: "border-color 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line-2)";
                      (e.currentTarget as HTMLElement).style.color = "var(--ink-mute)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                      (e.currentTarget as HTMLElement).style.color = "var(--ink-dim)";
                    }}
                  >
                    + Add Lead
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Emma toast */}
        <div
          style={{
            marginTop: 24,
            padding: "14px 18px",
            borderRadius: "var(--radius-xl)",
            background: "rgba(19,24,38,0.5)",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(180deg, var(--indi-500), var(--indi-600))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              <Sparkles size={16} style={{ color: "white" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                Emma is finding and qualifying the right opportunities for you.
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                24 new opportunities added to your pipeline this week.
              </div>
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            View Opportunities
          </button>
        </div>
      </div>
    </Shell>
  );
}