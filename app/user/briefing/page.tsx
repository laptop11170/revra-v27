"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/constants";
import {
  Target,
  TrendingUp,
  TrendingDown,
  PhoneCall,
  Calendar,
  Star,
  ArrowRight,
  Bot,
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronRight,
  Play,
  Video,
  Loader2,
} from "lucide-react";

type BriefingData = {
  todayMessages: number;
  todayLeads: number;
  hotLeads: number;
  todayAppointments: number;
  stageCounts: Record<string, number>;
  totalStageLeads: number;
  recentLeads: Array<{
    id: string;
    first_name: string;
    last_name: string;
    score: number;
    pipeline_stage: string;
    created_at: string;
  }>;
  recentMessages: Array<{
    id: string;
    body: string;
    direction: string;
    created_at: string;
  }>;
  sparkData: { date: string; count: number }[];
};

function PipelineFunnel({ stageCounts, totalLeads }: {
  stageCounts: Record<string, number>;
  totalLeads: number;
}) {
  const stages = [
    { name: "New Lead", key: "new_lead" },
    { name: "Contacted", key: "contacted" },
    { name: "Qualifying", key: "qualifying" },
    { name: "Booked", key: "booked" },
    { name: "In Progress", key: "in_progress" },
    { name: "Closed Won", key: "closed_won" },
  ];
  const max = Math.max(...stages.map((s) => stageCounts[s.key] ?? 0), 1);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--on-surface))" }}>Pipeline Funnel</h3>
        <div className="space-y-2">
          {stages.map((s) => {
            const count = stageCounts[s.key] ?? 0;
            return (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs w-32 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{s.name}</span>
                <div className="flex-1 rounded-full h-5 overflow-hidden" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(count / max) * 100}%`, background: "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))" }}
                  >
                    <span className="text-xs text-white font-bold">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: "1px solid hsl(var(--border))" }}>
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{totalLeads} total leads</span>
          <span className="text-xs font-medium" style={{ color: "hsl(var(--success))" }}>{(stageCounts["closed_won"] ?? 0)} won</span>
        </div>
      </CardContent>
    </Card>
  );
}

function HotLeads({ leads }: {
  leads: Array<{ id: string; first_name: string; last_name: string; score: number; pipeline_stage: string }>
}) {
  const hot = leads.filter((l) => l.score >= 80).slice(0, 4);
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Hot Leads</h3>
          <Badge variant="success">{hot.length} hot</Badge>
        </div>
        <div className="space-y-3">
          {hot.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                {`${lead.first_name?.[0] ?? ""}${lead.last_name?.[0] ?? ""}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{lead.first_name} {lead.last_name}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{lead.pipeline_stage ?? "—"}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold" style={{ color: "hsl(var(--success))" }}>{lead.score}</span>
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>score</p>
              </div>
            </div>
          ))}
          {hot.length === 0 && (
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              No hot leads yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MorningBriefingPage() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "tasks" | "leads">("dashboard");

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefing");
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Failed to load briefing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  return (
    <Shell role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--on-surface))" }}>Good Morning, Agent</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} — Here's your day at a glance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveView("dashboard")}>Dashboard</Button>
            <Button variant="outline" onClick={() => setActiveView("tasks")}>Focus Tasks</Button>
            <Button onClick={() => setActiveView("leads")}><Target size={16} className="mr-2" />Start Calling</Button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "80px 0", color: "hsl(var(--muted-foreground))" }}>
            <Loader2 size={18} className="animate-spin" />
            <span style={{ fontSize: 13 }}>Loading briefing...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "hsl(var(--danger))" }}>
            <div style={{ fontSize: 13 }}>{error}</div>
            <button className="btn-ghost" style={{ marginTop: 8, padding: "6px 12px", fontSize: 12 }} onClick={fetchBriefing}>Retry</button>
          </div>
        ) : (
          <>
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Conversations", value: data?.todayMessages ?? 0, sub: "Today", trend: "+12%", trendUp: true },
            { label: "Hot Leads", value: data?.hotLeads ?? 0, sub: "Priority this morning", trend: "+2", trendUp: true },
            { label: "New Leads", value: data?.todayLeads ?? 0, sub: "Added today", trend: "+5", trendUp: true },
            { label: "Appointments", value: data?.todayAppointments ?? 0, sub: "Booked today" },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>{k.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: "hsl(var(--on-surface))" }}>{k.value.toLocaleString()}</p>
                    {k.sub && <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{k.sub}</p>}
                  </div>
                  {k.trend && (
                    <div
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: k.trendUp ? "hsl(var(--success)_/_0.12)" : "hsl(var(--danger)_/_0.12)",
                        color: k.trendUp ? "hsl(var(--success))" : "hsl(var(--danger))",
                      }}
                    >
                      {k.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {k.trend}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PipelineFunnel stageCounts={data?.stageCounts ?? {}} totalLeads={data?.totalStageLeads ?? 0} />
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>AI Insights</h3>
                    <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: <Zap size={16} />, text: `${data?.todayLeads ?? 0} new leads added today`, type: "info", iconColor: "hsl(var(--warning))", bg: "hsl(var(--warning)_/_0.08)" },
                      { icon: <Star size={16} />, text: `${data?.hotLeads ?? 0} hot leads ready for action`, type: "hot", iconColor: "hsl(var(--success))", bg: "hsl(var(--success)_/_0.08)" },
                      { icon: <CheckCircle2 size={16} />, text: "Engagement rate up 18% this week", type: "success", iconColor: "hsl(var(--primary))", bg: "hsl(var(--primary)_/_0.08)" },
                      { icon: <AlertCircle size={16} />, text: `${(data?.stageCounts["new_lead"] ?? 0) + (data?.stageCounts["contacted"] ?? 0)} leads need follow-up`, type: "urgent", iconColor: "hsl(var(--danger))", bg: "hsl(var(--danger)_/_0.08)" },
                    ].map((ins, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: ins.bg }}>
                        <div className="mt-0.5" style={{ color: ins.iconColor }}>{ins.icon}</div>
                        <p className="text-sm" style={{ color: "hsl(var(--on-surface))" }}>{ins.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="space-y-6">
            <HotLeads leads={data?.recentLeads ?? []} />
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Upcoming Appointments</h3>
                  <a href="/user/calendar" className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--primary))" }}>
                    View all <ChevronRight size={12} />
                  </a>
                </div>
                <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  {data?.todayAppointments ?? 0} appointment{data?.todayAppointments !== 1 ? "s" : ""} today
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>
    </Shell>
  );
}