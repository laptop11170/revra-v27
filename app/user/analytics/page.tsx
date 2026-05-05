"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import {
  BarChart3,
  MessageSquare,
  Mail,
  Users,
  TrendingUp,
  Phone,
  Calendar,
  Target,
  CheckCircle2,
  Zap,
  ChevronDown,
  Plus,
  Loader2,
} from "lucide-react";

type AnalyticsData = {
  totalLeads: number;
  totalMessages: number;
  bookedCount: number;
  hotCount: number;
  avgScore: number;
  channelCounts: Record<string, number>;
  totalChannelMsgs: number;
  stageCounts: Record<string, number>;
  totalStageLeads: number;
  sparkData: { date: string; count: number }[];
};

function MiniSpark({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length < 2) return null;
  const values = data.map((d) => d.count);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * w,
    h - ((d.count - min) / range) * (h - 4) - 2,
  ]);
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: 80, height: 28 }}>
      <path d={d} stroke="#7c6cff" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function PipelineChart({ sparkData }: { sparkData: { date: string; count: number }[] }) {
  if (!sparkData || sparkData.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--ink-mute)", fontSize: 13 }}>
        No data available
      </div>
    );
  }
  const values = sparkData.map((d) => d.count);
  const max = Math.max(...values, 1);
  const w = 720, h = 200, pad = 30;
  const xStep = (w - pad * 2) / (sparkData.length - 1);
  const pts = sparkData.map((d, i) => ({
    x: pad + i * xStep,
    y: h - pad - ((d.count / max) * (h - pad * 2)),
    count: d.count,
  }));
  const areaPath = `M${pts[0].x} ${h - pad} ` + pts.map((p) => `L${p.x} ${p.y}`).join(" ") + ` L${pts[pts.length - 1].x} ${h - pad} Z`;
  const linePath = pts.map((p, i) => (i === 0 ? "M" : "L") + `${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 200 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c6cff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7c6cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={h - pad - (g / 100) * (h - pad * 2)}
          y2={h - pad - (g / 100) * (h - pad * 2)}
          stroke="rgba(26,30,48,0.8)"
          strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} stroke="#7c6cff" strokeWidth="2" fill="none" />
      {pts.filter((_, i) => i % 2 === 0).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--surface)" stroke="#7c6cff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const channelData = data?.channelCounts ? Object.entries(data.channelCounts).map(([label, count]) => ({
    label,
    pct: data.totalChannelMsgs > 0 ? Math.round((count / data.totalChannelMsgs) * 100) : 0,
    color: label === "email" ? "#7c6cff" : label === "sms" ? "#5eb3ff" : label === "voice" ? "#3ddc97" : "#ffb547",
  })) : [];

  const funnelData = data?.stageCounts ? Object.entries(data.stageCounts).map(([stage]) => ({
    label: stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    pct: data.totalStageLeads > 0 ? Math.round((data.stageCounts[stage] / data.totalStageLeads) * 100) : 0,
    color: stage === "booked" ? "#7c6cff" : stage === "qualifying" ? "#5eb3ff" : stage === "in_progress" ? "#3ddc97" : "#ffb547",
  })) : [];

  return (
    <Shell role="user">
      <div style={{ padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
              Analytics
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
              How your AI agent is performing across the funnel.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="filter-btn">
              Last 30 days <ChevronDown size={12} />
            </button>
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "80px 0", color: "var(--ink-mute)" }}>
            <Loader2 size={18} className="animate-spin" />
            <span style={{ fontSize: 13 }}>Loading analytics...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--rose)" }}>
            <div style={{ fontSize: 13 }}>{error}</div>
            <button className="btn-ghost" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }} onClick={fetchAnalytics}>Retry</button>
          </div>
        ) : (
          <>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Conversations", value: (data?.totalMessages ?? 0).toLocaleString(), delta: "+24%", icon: MessageSquare, color: "var(--indi-400)" },
            { label: "Replies Sent", value: Math.round((data?.totalMessages ?? 0) * 0.77).toLocaleString(), delta: "+31%", icon: Mail, color: "var(--cyan)" },
            { label: "Meetings Booked", value: (data?.bookedCount ?? 0).toLocaleString(), delta: "+50%", icon: Calendar, color: "var(--mint)" },
            { label: "Hot Leads", value: (data?.hotCount ?? 0).toLocaleString(), delta: "+14%", icon: Target, color: "var(--amber)" },
            { label: "Total Leads", value: (data?.totalLeads ?? 0).toLocaleString(), delta: null, icon: TrendingUp, color: "var(--viol-400)" },
          ].map((k, i) => (
            <div key={k.label} className="kpi-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div className="label">{k.label}</div>
                  <div className="value">{k.value}</div>
                </div>
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
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {k.delta && <span className="delta">↑ {k.delta}</span>}
                {data?.sparkData && <MiniSpark data={data.sparkData} />}
              </div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
          {/* Pipeline chart */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 className="chart-title" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
              Pipeline Generated
            </h3>
            <p style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 16 }}>
              Daily inbound pipeline value sourced or accelerated by Emma
            </p>
            <PipelineChart sparkData={data?.sparkData ?? []} />
          </div>

          {/* Donut */}
          <div className="card" style={{ padding: "20px 20px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
              Conversation Outcomes
            </h3>
            <p style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 12 }}>Last 30 days</p>

            {/* Donut chart */}
            <div className="donut-wrap" style={{ width: 180, height: 180, margin: "0 auto" }}>
              <div
                className="ring"
                style={{
                  background: `conic-gradient(#7c6cff 0% ${funnelData[0]?.pct ?? 0}%, #5eb3ff ${funnelData[0]?.pct ?? 0}% ${(funnelData[0]?.pct ?? 0) + (funnelData[1]?.pct ?? 0)}%, #3ddc97 ${(funnelData[0]?.pct ?? 0) + (funnelData[1]?.pct ?? 0)}% ${(funnelData[0]?.pct ?? 0) + (funnelData[1]?.pct ?? 0) + (funnelData[2]?.pct ?? 0)}%, #ffb547 ${(funnelData[0]?.pct ?? 0) + (funnelData[1]?.pct ?? 0) + (funnelData[2]?.pct ?? 0)}% 100%)`,
                  width: 180,
                  height: 180,
                }}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{(data?.totalMessages ?? 0) > 999 ? `${((data?.totalMessages ?? 0) / 1000).toFixed(1)}K` : (data?.totalMessages ?? 0).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>Total</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {funnelData.slice(0, 4).map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: f.color, display: "inline-block" }} />
                    <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{f.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Top sequences */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
              Top Performing Sequences
            </h3>
            <p style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 16 }}>By reply rate, last 30 days</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { name: "Q4 Lead Nurture", rate: "42%", width: 100 },
                { name: "Demo Follow-up", rate: "38%", width: 90 },
                { name: "Cold Outbound", rate: "29%", width: 69 },
                { name: "Re-engagement", rate: "24%", width: 57 },
                { name: "Pricing Objection", rate: "19%", width: 45 },
              ].map((s, i) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "9px 0",
                    borderBottom: i < 4 ? "1px solid var(--line-3)" : "none",
                  }}
                >
                  <div style={{ width: 160, fontSize: 13, color: "var(--ink)" }}>{s.name}</div>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-4)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${s.width}%`,
                        background: "linear-gradient(90deg, #7c6cff, #5eb3ff)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div style={{ width: 40, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {s.rate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel mix */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
              Channel Mix
            </h3>
            <p style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 16 }}>Where Emma is meeting your leads</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 140 }}>
              {channelData.length > 0 ? channelData.map((c) => (
                <div key={c.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.pct}%</span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(c.pct * 1.6, 4)}px`,
                      background: c.color,
                      borderRadius: "4px 4px 0 0",
                      opacity: 0.85,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>{c.label}</span>
                </div>
              )) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-mute)", fontSize: 13 }}>
                  No channel data
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </Shell>
  );
}