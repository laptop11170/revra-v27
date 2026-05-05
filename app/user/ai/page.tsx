"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import {
  Sparkles,
  Phone,
  Play,
  Pause,
  Plus,
  Settings,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Bot,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  target: string;
  stages: string[];
  agents: number;
  queue_size: number;
  completed: number;
  failed: number;
  status: "active" | "paused";
}

interface QueueItem {
  id: string;
  name: string;
  phone: string;
  type: string;
  campaign_name: string;
  status: string;
  added_at: string;
}

interface QueueStats {
  queued: number;
  completed_today: number;
  failed_today: number;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: "Active",     color: "var(--mint)",  bg: "rgba(16,185,129,0.15)" },
  paused:     { label: "Paused",     color: "var(--amber)", bg: "rgba(245,158,11,0.15)" },
  pending:    { label: "Pending",    color: "var(--ink-mute)", bg: "var(--surface-3)" },
  in_progress:{ label: "In Progress", color: "var(--indi-400)", bg: "rgba(99,102,241,0.15)" },
};

export default function EmmaAIPage() {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignsRes, queueRes] = await Promise.all([
        fetch("/api/emma-campaigns"),
        fetch("/api/emma-queue"),
      ]);

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaignList(campaignsData.emma_campaigns || []);
      }

      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setQueueItems(queueData.queue || []);
        setQueueStats(queueData.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCampaign = async (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/emma-campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCampaignList((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (error) {
      console.error("Failed to toggle campaign:", error);
    }
  };

  return (
    <Shell role="user">
      <div style={{ padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
              Emma AI
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
              AI-powered voice agent campaigns
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
              <Plus size={13} style={{ marginRight: 6 }} />
              New Campaign
            </button>
            <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
              <Bot size={13} style={{ marginRight: 6 }} />
              Add to Queue
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Queued Calls", value: queueStats?.queued != null ? String(queueStats.queued) : "—", color: "var(--indi-400)" },
            { label: "Completed Today", value: queueStats?.completed_today != null ? String(queueStats.completed_today) : "—", color: "var(--mint)" },
            { label: "Avg Duration", value: "—", color: "var(--ink-mute)" },
            { label: "Success Rate", value: "—", color: "var(--ink-mute)" },
          ].map((k) => (
            <div key={k.label} className="kpi-card">
              <div className="label">{k.label}</div>
              <div className="value" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Active Campaigns</h3>
          {loading && campaignList.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", color: "var(--ink-mute)" }}>
              <Loader2 size={20} className="animate-spin" style={{ marginRight: 8 }} />
              Loading campaigns...
            </div>
          ) : (
            campaignList.map((c) => {
              const st = statusConfig[c.status] || statusConfig.paused;
              return (
                <div
                  key={c.id}
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--line)",
                    background: "rgba(19,24,38,0.5)",
                    padding: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "var(--radius-lg)",
                          background: "rgba(99,102,241,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Phone size={18} style={{ color: "var(--indi-400)" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                          {c.target} · {c.stages.join(", ")}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 10px",
                          borderRadius: "var(--radius-md)",
                          background: st.bg,
                          color: st.color,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        <span
                          className="pulse-dot"
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 999,
                            background: st.color,
                            display: c.status === "active" ? "inline-block" : "none",
                          }}
                        />
                        {st.label}
                      </span>
                      <button
                        className="btn-icon p-2"
                        onClick={() => toggleCampaign(c)}
                        title={c.status === "active" ? "Pause" : "Resume"}
                      >
                        {c.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button className="btn-icon p-2">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {[
                      { label: "Queued", value: c.queue_size, color: "var(--ink)" },
                      { label: "Completed", value: c.completed, color: "var(--mint)" },
                      { label: "Failed", value: c.failed, color: "var(--rose)" },
                      { label: "Agents", value: c.agents, color: "var(--ink)" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        style={{
                          padding: "12px",
                          borderRadius: "var(--radius-lg)",
                          background: "rgba(22,27,44,0.5)",
                          textAlign: "center",
                          border: "1px solid var(--line)",
                        }}
                      >
                        <div style={{ fontSize: 20, fontWeight: 600, color: m.color, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                          {m.value}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Call Queue */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Call Queue</h3>
            <span
              className="badge"
              style={{ background: "var(--surface-3)", border: "1px solid var(--line)", padding: "4px 10px", borderRadius: "var(--radius-md)", fontSize: 11.5, color: "var(--ink-mute)" }}
            >
              {queueItems.length} pending
            </span>
          </div>

          {loading && queueItems.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", color: "var(--ink-mute)" }}>
              <Loader2 size={20} className="animate-spin" style={{ marginRight: 8 }} />
              Loading queue...
            </div>
          ) : queueItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--ink-mute)" }}>
              No items in queue
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map((item) => {
                  const st = statusConfig[item.status] || statusConfig.pending;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            className="avatar"
                            style={{
                              width: 32,
                              height: 32,
                              background: "linear-gradient(135deg, var(--indi-500), var(--viol-500))",
                              color: "white",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(item.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{item.name}</div>
                            <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>{item.phone} · {item.type}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--ink-mute)" }}>{item.campaign_name}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 8px",
                            borderRadius: "var(--radius-md)",
                            background: st.bg,
                            color: st.color,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {item.status === "in_progress" && (
                            <RefreshCw size={10} className="animate-spin" style={{ animationDuration: "1s" }} />
                          )}
                          {st.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--ink-dim)" }}>{formatRelativeTime(item.added_at)}</td>
                      <td>
                        <button className="btn-icon p-2">
                          <XCircle size={14} style={{ color: "var(--ink-mute)" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Shell>
  );
}