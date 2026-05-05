"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import {
  Send,
  Users,
  Clock,
  BarChart3,
  Plus,
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  MessageSquare,
  Mail,
  Phone,
  Play,
  Pause,
  Edit2,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  Calendar,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface ApiCampaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  sent: number;
  delivered: number;
  clicked: number;
  replied: number;
  leads: number;
  start_date: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "var(--mint)",  bg: "rgba(16,185,129,0.15)" },
  paused:    { label: "Paused",    color: "var(--amber)", bg: "rgba(245,158,11,0.15)" },
  draft:     { label: "Draft",     color: "var(--ink-mute)", bg: "var(--surface-3)" },
  completed: { label: "Completed", color: "var(--indi-400)", bg: "rgba(99,102,241,0.15)" },
};

const defaultStatus = { label: "Unknown", color: "var(--ink-mute)", bg: "var(--surface-3)" };

const typeConfig: Record<string, { icon: React.FC<{ size?: number; style?: React.CSSProperties }>; color: string }> = {
  SMS:   { icon: MessageSquare, color: "var(--cyan)" },
  Email: { icon: Mail,          color: "var(--indi-400)" },
  Multi: { icon: Phone,         color: "var(--viol-400)" },
  Voice: { icon: Phone,         color: "var(--viol-400)" },
};

type TabType = "all" | "active" | "paused" | "draft" | "completed";
const tabs: TabType[] = ["all", "active", "paused", "draft", "completed"];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("SMS");
  const [showSendModal, setShowSendModal] = useState<string | null>(null);
  const [smsDraft, setSmsDraft] = useState("");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filtered = campaigns.filter((c) => activeTab === "all" || c.status === activeTab);

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0);
  const avgRate = totalDelivered > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "0";
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0";

  return (
    <Shell role="user">
      <div style={{ padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
              Campaigns
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
              Bulk SMS, email, and multi-channel outreach campaigns.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }} onClick={fetchCampaigns} title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setShowNewModal(true)}>
              <Plus size={13} style={{ marginRight: 6 }} />
              New Campaign
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={24} style={{ color: "var(--ink-mute)", animation: "spin 1s linear infinite" }} />
            <span style={{ marginLeft: 12, color: "var(--ink-mute)", fontSize: 14 }}>Loading campaigns...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 16 }}>
            <div style={{ color: "var(--error)", fontSize: 14 }}>{error}</div>
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={fetchCampaigns}>
              <RefreshCw size={13} style={{ marginRight: 6 }} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (<>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Sent", value: totalSent.toLocaleString(), color: "var(--ink)" },
            { label: "Delivered Rate", value: `${avgRate}%`, color: "var(--mint)" },
            { label: "Total Replies", value: totalReplied.toLocaleString(), color: "var(--cyan)" },
            { label: "Reply Rate", value: `${replyRate}%`, color: "var(--viol-400)" },
          ].map((k) => (
            <div key={k.label} className="kpi-card">
              <div className="label">{k.label}</div>
              <div className="value" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                textTransform: "capitalize",
                background: activeTab === t ? "var(--surface-2)" : "transparent",
                color: activeTab === t ? "var(--ink)" : "var(--ink-mute)",
                boxShadow: activeTab === t ? "inset 0 0 0 1px var(--line-2)" : "none",
                transition: "all 0.12s",
              }}
            >
              {t}
              <span
                style={{
                  marginLeft: 6,
                  padding: "1px 6px",
                  borderRadius: 999,
                  fontSize: 10,
                  background: activeTab === t ? "var(--line)" : "var(--surface-3)",
                  color: "var(--ink-dim)",
                }}
              >
                {t === "all" ? campaigns.length : campaigns.filter((c) => c.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {/* Campaign list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c) => {
            const st = statusConfig[c.status] ?? defaultStatus;
            const typeInfo = typeConfig[c.channel] ?? typeConfig["SMS"];
            const TypeIcon = typeInfo.icon;
            const delRate = c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(1) : "0";
            const replyRateLocal = c.sent > 0 ? ((c.replied / c.sent) * 100).toFixed(1) : "0";

            return (
              <div
                key={c.id}
                style={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--line)",
                  background: "rgba(19,24,38,0.5)",
                  overflow: "hidden",
                }}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-lg)",
                        background: `${typeInfo.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <TypeIcon size={18} style={{ color: typeInfo.color }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{c.name}</span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "var(--radius-md)",
                            background: st.bg,
                            color: st.color,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{c.leads.toLocaleString()} leads</span>
                        <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>·</span>
                        <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{c.start_date}</span>
                        <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>·</span>
                        <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{c.channel}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {c.status === "active" && (
                      <button className="btn-icon p-2" title="Pause">
                        <Pause size={14} />
                      </button>
                    )}
                    {c.status === "paused" && (
                      <button className="btn-icon p-2" title="Resume">
                        <Play size={14} />
                      </button>
                    )}
                    <button className="btn-icon p-2" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: "7px 14px", fontSize: 12 }}
                      onClick={() => { setShowSendModal(c.id); setSmsDraft(""); }}
                    >
                      <Send size={12} style={{ marginRight: 5 }} />
                      Send
                    </button>
                  </div>
                </div>

                {/* Metrics row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, borderTop: "1px solid rgba(37,43,63,0.5)" }}>
                  {[
                    { label: "Sent", value: c.sent.toLocaleString(), color: "var(--ink)" },
                    { label: "Delivered", value: `${delRate}%`, color: "var(--mint)" },
                    { label: "Clicked", value: c.clicked.toLocaleString(), color: "var(--cyan)" },
                    { label: "Replied", value: `${replyRateLocal}%`, color: "var(--viol-400)" },
                    { label: "Revenue", value: "$0", color: "var(--ink-dim)" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        padding: "14px 20px",
                        borderRight: "1px solid rgba(37,43,63,0.4)",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 600, color: m.color, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                        {m.value}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </>)}
      </div>

      {/* New Campaign Modal */}
      {showNewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,7,15,0.62)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 110,
          }}
          onClick={() => setShowNewModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: "var(--radius-2xl)",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid rgba(37,43,63,0.5)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>New Campaign</h3>
              <button className="btn-icon p-2" onClick={() => setShowNewModal(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="input-label">Campaign Name</label>
                <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Medicare Advantage Outreach" />
              </div>
              <div>
                <label className="input-label">Channel</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["SMS", "Email", "Multi"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "var(--radius-lg)",
                        border: `1px solid ${newType === t ? "var(--indi-500)" : "var(--line)"}`,
                        background: newType === t ? "rgba(99,102,241,0.1)" : "transparent",
                        color: newType === t ? "var(--indi-300)" : "var(--ink-mute)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Select Leads</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface-4)", border: "1px solid var(--line)" }}>
                  <Users size={16} style={{ color: "var(--ink-mute)" }} />
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>All Leads — 125,430 contacts</span>
                  <button className="btn-ghost" style={{ marginLeft: "auto", padding: "4px 10px", fontSize: 12 }}>Change</button>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid rgba(37,43,63,0.5)" }}>
              <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>Create Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,7,15,0.62)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 110,
          }}
          onClick={() => setShowSendModal(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              borderRadius: "var(--radius-2xl)",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid rgba(37,43,63,0.5)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>Send Campaign</h3>
              <button className="btn-icon p-2" onClick={() => setShowSendModal(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 14, borderRadius: "var(--radius-lg)", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
                <Users size={18} style={{ color: "var(--indi-400)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{campaigns.find((c) => c.id === showSendModal)?.leads.toLocaleString()} Leads</div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>Estimated cost: ${((campaigns.find((c) => c.id === showSendModal)?.leads ?? 0) * 0.05).toFixed(2)}</div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Message</label>
                  <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{smsDraft.length}/160</span>
                </div>
                <textarea
                  className="input"
                  value={smsDraft}
                  onChange={(e) => setSmsDraft(e.target.value)}
                  placeholder="Hey there! Check out our latest offer just for you..."
                  style={{ minHeight: 90, resize: "vertical" }}
                />
              </div>
              <div>
                <label className="input-label">Sender ID</label>
                <select className="input" style={{ appearance: "none" }}>
                  <option>Revra Sales</option>
                  <option>Revra Team</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid rgba(37,43,63,0.5)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-mute)", cursor: "pointer" }}>
                <span className="check-box" />
                Schedule for later
              </label>
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Send size={13} />
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}