"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CALL_OUTCOMES } from "@/lib/mock-data";
import { getInitials } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-provider";
import {
  Phone,
  PhoneCall,
  Play,
  Download,
  Search,
  ArrowUpRight,
  PhoneIncoming,
  Bot,
  Clock,
  Loader2,
} from "lucide-react";

type ApiCall = {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  direction: string;
  duration: string;
  outcome: string;
  summary: string;
  is_ai: boolean;
  has_recording: boolean;
  created_at: string;
};

// Form-friendly call type for PostCallForm
type FormCall = {
  id: string;
  leadName: string;
  leadPhone: string;
  duration: string;
  summary: string;
  direction: string;
  outcome: string;
};

function formatDuration(seconds: string | number): string {
  const s = typeof seconds === "string" ? parseInt(seconds) : seconds;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function getCallType(dir: string, isAi: boolean): string {
  if (isAi) return "EMMA AI";
  if (dir === "inbound") return "Inbound";
  return "Outbound";
}

const OUTCOME_CONFIG: Record<string, { icon: React.ReactNode; colorVar: string; bgVar: string }> = {
  "Contacted": { icon: <PhoneCall size={16} />, colorVar: "success", bgVar: "success" },
  "Voicemail": { icon: <PhoneCall size={16} />, colorVar: "warning", bgVar: "warning" },
  "No Answer": { icon: <PhoneCall size={16} />, colorVar: "danger", bgVar: "danger" },
  "Callback Requested": { icon: <Clock size={16} />, colorVar: "primary", bgVar: "primary" },
  "Not Interested": { icon: <ArrowUpRight size={16} />, colorVar: "on-surface-variant", bgVar: "surface-container-high" },
  "Wrong Number": { icon: <Phone size={16} />, colorVar: "danger", bgVar: "danger" },
  "Dead Line": { icon: <Phone size={16} />, colorVar: "danger", bgVar: "danger" },
};

// Post-call form modal
function PostCallForm({ open, onClose, call, onSave }: {
  open: boolean;
  onClose: () => void;
  call: FormCall;
  onSave?: (data: any) => void;
}) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState(call.summary);
  const [step, setStep] = useState<"outcome" | "stage" | "summary">("outcome");
  const [stageChange, setStageChange] = useState("");
  const [scheduleCallback, setScheduleCallback] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");

  const stages = ["New Lead", "Attempting Contact", "Contacted", "Needs Analysis", "Quote Sent", "Application Submitted", "Bound / Policy Active"];

  const handleSave = () => {
    onSave?.({ outcome, notes, stageChange, scheduleCallback, callbackDate, callbackTime });
    setOutcome(""); setNotes(""); setStageChange(""); setScheduleCallback(false);
    setCallbackDate(""); setCallbackTime(""); setStep("outcome");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Log Call Outcome">
      <div className="p-6">
        <div className="flex items-center gap-4 p-3 rounded-xl mb-6" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary)_/_0.12)", color: "hsl(var(--primary))" }}>
            <PhoneIncoming size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{call.leadName}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{call.leadPhone}</p>
          </div>
          <div className="text-right">
            <Badge variant="info">{call.duration}</Badge>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Call duration</p>
          </div>
        </div>

        {step === "outcome" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "hsl(var(--on-surface))" }}>What happened?</label>
              <div className="grid grid-cols-2 gap-2">
                {CALL_OUTCOMES.map((oc) => {
                  const cfg = OUTCOME_CONFIG[oc] || { icon: <PhoneCall size={16} />, colorVar: "muted-foreground", bgVar: "surface-container-low" };
                  return (
                    <button
                      key={oc}
                      onClick={() => setOutcome(oc)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        outcome === oc ? "" : ""
                      }`}
                      style={outcome === oc
                        ? { borderColor: "hsl(var(--primary))", backgroundColor: "hsl(var(--primary)_/_0.06)" }
                        : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface-bright))" }
                      }
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(var(--${cfg.bgVar})_/_0.12)`, color: `hsl(var(--${cfg.colorVar}))` }}>
                        {cfg.icon}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{oc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Call Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-20" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep("stage")} disabled={!outcome}>Next →</Button>
            </div>
          </div>
        )}

        {step === "stage" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "hsl(var(--on-surface))" }}>Update lead stage?</label>
              <div className="space-y-2">
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setStageChange(stage)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                    style={stageChange === stage
                      ? { borderColor: "hsl(var(--primary))", backgroundColor: "hsl(var(--primary)_/_0.06)" }
                      : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface-bright))" }
                    }
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage === "Bound / Policy Active" ? "hsl(var(--success))" : "hsl(var(--border))" }} />
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{stage}</span>
                    {stageChange === stage && <span className="ml-auto text-xs font-medium" style={{ color: "hsl(var(--primary))" }}>Selected</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStageChange("")} className="mt-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>No stage change</button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: "hsl(var(--primary)_/_0.06)", borderColor: "hsl(var(--primary)_/_0.3)" }}>
              <input type="checkbox" id="cb" checked={scheduleCallback} onChange={(e) => setScheduleCallback(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="cb" className="text-sm" style={{ color: "hsl(var(--on-surface))" }}>Schedule callback appointment</label>
            </div>
            {scheduleCallback && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2" style={{ borderColor: "hsl(var(--primary)_/_0.3)" }}>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Date</label>
                  <input type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} className="w-full h-10 rounded-lg px-3 text-sm" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Time</label>
                  <input type="time" value={callbackTime} onChange={(e) => setCallbackTime(e.target.value)} className="w-full h-10 rounded-lg px-3 text-sm" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }} />
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("outcome")}>← Back</Button>
              <Button onClick={() => setStep("summary")}>Review Summary →</Button>
            </div>
          </div>
        )}

        {step === "summary" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
              {[
                ["Outcome", outcome],
                ...(notes ? [["Notes", notes]] : []),
                ...(stageChange ? [["Stage update", stageChange, "info"]] : []),
                ...(scheduleCallback ? [["Callback", `${callbackDate} at ${callbackTime}`, "success"]] : []),
              ].map(([label, value, badgeVariant]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
                  {badgeVariant ? <Badge variant={badgeVariant as any}>{value as string}</Badge> : <span className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{value as string}</span>}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("stage")}>← Back</Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save & Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function CallHistoryPage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [calls, setCalls] = useState<ApiCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({ outcome: "", type: "", search: "" });
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calls");
      if (!res.ok) throw new Error("Failed to fetch calls");
      const data = await res.json();
      setCalls(data.calls || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      addToast?.({ type: "error", title: "Failed to load calls" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const filtered = calls.filter((c) => {
    const callType = getCallType(c.direction, c.is_ai);
    if (filter.outcome && c.outcome !== filter.outcome) return false;
    if (filter.type && callType !== filter.type) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!c.lead_name.toLowerCase().includes(q) && !c.lead_phone.includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: filtered.length,
    contacted: filtered.filter((c) => c.outcome === "Contacted").length,
    voicemail: filtered.filter((c) => c.outcome === "Voicemail").length,
    noAnswer: filtered.filter((c) => c.outcome === "No Answer").length,
  };

  const handleLogOutcome = async (data: any) => {
    if (!selectedCall) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/calls/${selectedCall.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: data.outcome, notes: data.notes }),
      });
      if (!res.ok) throw new Error("Failed to update call");
      setCalls((prev) => prev.map((c) =>
        c.id === selectedCall.id ? { ...c, outcome: data.outcome, summary: data.notes } : c
      ));
      addToast?.({ type: "success", title: "Call outcome saved" });
    } catch {
      addToast?.({ type: "error", title: "Failed to save outcome" });
    } finally {
      setSaving(false);
    }
  };

  // Convert ApiCall to FormCall for PostCallForm
  const formCall: FormCall | null = selectedCall ? {
    id: selectedCall.id,
    leadName: selectedCall.lead_name,
    leadPhone: selectedCall.lead_phone,
    duration: formatDuration(selectedCall.duration),
    summary: selectedCall.summary,
    direction: selectedCall.direction,
    outcome: selectedCall.outcome,
  } : null;

  return (
    <Shell role="user">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--on-surface))" }}>Call History</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{stats.total} calls · {stats.contacted} contacted</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><Bot size={16} className="mr-2" />Start AI Dialer</Button>
            <Button variant="outline"><Download size={16} className="mr-2" />Export</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <Input
              placeholder="Search calls..."
              value={filter.search}
              onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          {[
            { val: filter.outcome, set: (v: string) => setFilter(f => ({ ...f, outcome: v })), opts: CALL_OUTCOMES },
            { val: filter.type, set: (v: string) => setFilter(f => ({ ...f, type: v })), opts: ["", "Outbound", "Inbound", "EMMA AI"] },
          ].map((sel, si) => (
            <select
              key={si}
              value={sel.val}
              onChange={(e) => sel.set(e.target.value)}
              className="h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }}
            >
              <option value="">{si === 0 ? "All Outcomes" : "All Types"}</option>
              {sel.opts.slice(1).map((o) => <option key={o as string} value={o as string}>{o as string}</option>)}
            </select>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            [stats.total, "Total Calls", null],
            [stats.contacted, "Contacted", "success"],
            [stats.voicemail, "Voicemail", "warning"],
            [stats.noAnswer, "No Answer", "danger"],
          ].map(([val, label, colorVar]) => (
            <Card key={label}><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: colorVar ? `hsl(var(--${colorVar}))` : "hsl(var(--on-surface))" }}>{val}</p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Calls Table */}
        <Card>
          <table className="w-full">
            <thead>
              <tr style={{ borderColor: "hsl(var(--border))", borderBottom: "1px solid" }}>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Lead</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Duration</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Outcome</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Summary</th>
                <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="mb-2" style={{ color: "hsl(var(--danger))" }}>{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchCalls}>Retry</Button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>No calls found</td>
                </tr>
              ) : (
                filtered.map((call) => {
                const oc = OUTCOME_CONFIG[call.outcome] || { colorVar: "muted-foreground", bgVar: "surface-container-low" };
                const callType = getCallType(call.direction, call.is_ai);
                return (
                  <tr key={call.id} className="transition-colors" style={{ borderColor: "hsl(var(--border)_/_0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--primary)_/_0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {getInitials(call.lead_name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "hsl(var(--on-surface))" }}>{call.lead_name}</p>
                          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{call.lead_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={callType === "EMMA AI" ? "info" : callType === "Inbound" ? "success" : "default"}>
                        {call.is_ai && <Bot size={10} className="inline mr-1" />}{callType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: "hsl(var(--on-surface-variant))" }}>{formatDuration(call.duration)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: `hsl(var(--${oc.bgVar})_/_0.12)`, color: `hsl(var(--${oc.colorVar}))` }}>{call.outcome}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm truncate" style={{ color: "hsl(var(--on-surface-variant))" }}>{call.summary}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {call.has_recording && (
                          <Button variant="ghost" size="sm" title="Play recording">
                            <Play size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Log outcome" onClick={() => { setSelectedCall(call); setShowLogForm(true); }}>
                          <Phone size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </Card>
      </div>

      {formCall && (
        <PostCallForm
          open={showLogForm}
          onClose={() => { setShowLogForm(false); setSelectedCall(null); }}
          call={formCall}
          onSave={handleLogOutcome}
        />
      )}
    </Shell>
  );
}