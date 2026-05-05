"use client";

import { useState, useEffect, useRef } from "react";
import { Shell } from "@/components/layouts/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-provider";
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Shield,
  DollarSign,
  MapPin,
  CheckSquare,
  Square,
  Pause,
  Play,
  PhoneOff,
  Bot,
  TrendingUp,
} from "lucide-react";

const TALKING_POINTS = [
  "Introduce yourself and RevRa",
  "Ask about current coverage and carrier",
  "Explain Medicare Advantage key benefits",
  "Discuss any health concerns affecting plan choice",
  "Ask if they have questions about costs or coverage",
  "Schedule a follow-up call or in-person meeting",
];

const OBJECTIONS = [
  "I'm already covered through my spouse",
  "I can't afford the monthly premiums",
  "My doctor doesn't accept Medicare plans",
  "I'm happy with my current coverage",
];

export default function ActiveCallPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [calling, setCalling] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [notes, setNotes] = useState("");
  const [checkedPoints, setCheckedPoints] = useState<Set<number>>(new Set());
  const [showPostCall, setShowPostCall] = useState(false);
  const { addToast } = useToast();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lead = {
    name: "Michael Torres",
    phone: "(555) 234-8901",
    coverageType: "Medicare Advantage",
    email: "mtorres@email.com",
    dob: "Mar 15, 1961",
    state: "California",
    county: "San Diego",
    score: 88,
    stage: "Contacted",
    budget: "$250-$500/mo",
    lastContact: "2 days ago",
    agent: "John Smith",
  };

  useEffect(() => {
    if (calling && !paused && !ended) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [calling, paused, ended]);

  const handleStartCall = () => {
    setCalling(true);
    addToast({ type: "info", title: "Call Connected", description: `Calling ${lead.name}...` });
  };

  const handleEndCall = () => {
    setEnded(true);
    setCalling(false);
    timerRef.current && clearInterval(timerRef.current);
    setShowPostCall(true);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const togglePoint = (i: number) => {
    setCheckedPoints((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handlePostCallSave = (outcome: string) => {
    addToast({ type: "success", title: "Call Logged", description: `Outcome: ${outcome} · Duration: ${formatDuration(duration)}` });
    setShowPostCall(false);
  };

  if (showPostCall) {
    return <PostCallView duration={duration} lead={lead} notes={notes} onSave={handlePostCallSave} onDiscard={() => setShowPostCall(false)} />;
  }

  return (
    <Shell role="user">
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* LEFT: AI Script */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {lead.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.name}</p>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{lead.coverageType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {calling && (
                <Badge variant={paused ? "warning" : "success"}>
                  <Clock size={10} className="mr-1" />
                  {paused ? "Paused" : formatDuration(duration)}
                </Badge>
              )}
              {calling && (
                <Button variant="ghost" size="sm" onClick={() => setPaused((p) => !p)}>
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                  {paused ? "Resume" : "Pause"}
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={handleEndCall} disabled={!calling}>
                <PhoneOff size={14} className="mr-1" />End Call
              </Button>
            </div>
          </div>

          {!calling && (
            <Card>
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "hsl(var(--success)_/_0.12)" }}>
                  <Phone size={36} style={{ color: "hsl(var(--success))" }} />
                </div>
                <p className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--on-surface))" }}>Ready to Call</p>
                <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>{lead.phone}</p>
                <Button size="lg" onClick={handleStartCall}>
                  <PhoneCall size={18} className="mr-2" />Start Call
                </Button>
              </CardContent>
            </Card>
          )}

          {calling && (
            <>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((duration / 300) * 100, 100)}%`, backgroundColor: "hsl(var(--success))" }} />
              </div>

              <Card className="flex-1 overflow-y-auto">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>AI Talking Points</p>
                    <Badge variant="info" className="ml-auto">{checkedPoints.size}/{TALKING_POINTS.length} covered</Badge>
                  </div>
                  <div className="space-y-2">
                    {TALKING_POINTS.map((point, i) => (
                      <button
                        key={i}
                        onClick={() => togglePoint(i)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border"
                        style={checkedPoints.has(i)
                          ? { backgroundColor: "hsl(var(--success)_/_0.06)", borderColor: "hsl(var(--success)_/_0.3)" }
                          : { backgroundColor: "hsl(var(--surface-container-low))", borderColor: "hsl(var(--border)_/_0.5)" }
                        }
                        onMouseEnter={(e) => { if (!checkedPoints.has(i)) e.currentTarget.style.backgroundColor = "hsl(var(--surface-container-high))"; }}
                        onMouseLeave={(e) => { if (!checkedPoints.has(i)) e.currentTarget.style.backgroundColor = "hsl(var(--surface-container-low))"; }}
                      >
                        {checkedPoints.has(i) ? (
                          <CheckSquare size={18} className="flex-shrink-0" style={{ color: "hsl(var(--success))" }} />
                        ) : (
                          <Square size={18} className="flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                        )}
                        <span className="text-sm" style={{ color: checkedPoints.has(i) ? "hsl(var(--success))" : "hsl(var(--on-surface-variant))" }}>{point}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4" style={{ borderColor: "hsl(var(--border)_/_0.3)", borderTop: "1px solid" }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Anticipated Objections</p>
                    <div className="space-y-1">
                      {OBJECTIONS.map((obj, i) => (
                        <p key={i} className="text-xs flex items-start gap-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "hsl(var(--warning))" }} />
                          {obj}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4" style={{ borderColor: "hsl(var(--border)_/_0.3)", borderTop: "1px solid" }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Live Notes</p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes during the call..."
                      className="w-full h-24 p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
                      style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* RIGHT: Lead Context */}
        <div className="w-1/2 flex flex-col gap-4">
          <Card className="flex-1 overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Lead Profile</p>
                <Badge variant={lead.score >= 80 ? "success" : "info"} className="ml-auto">
                  <TrendingUp size={10} className="mr-1" />Score {lead.score}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  [<Phone size={12} />, "Phone", lead.phone],
                  [<Shield size={12} />, "Coverage", lead.coverageType],
                  [<DollarSign size={12} />, "Budget", lead.budget],
                  [<MapPin size={12} />, "Location", `${lead.county}, ${lead.state}`],
                ].map(([icon, label, value], i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                    <p className="text-xs mb-1 flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>{icon} {label}</p>
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{value as string}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4" style={{ borderColor: "hsl(var(--border)_/_0.3)", borderTop: "1px solid" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Quick Actions</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><MessageSquare size={12} className="mr-1" />SMS</Button>
                  <Button size="sm" variant="outline"><Calendar size={12} className="mr-1" />Schedule</Button>
                  <Button size="sm" variant="outline"><Bot size={12} className="mr-1" />Emma AI</Button>
                </div>
              </div>

              <div className="pt-4" style={{ borderColor: "hsl(var(--border)_/_0.3)", borderTop: "1px solid" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Last Contact</p>
                <p className="text-sm" style={{ color: "hsl(var(--on-surface-variant))" }}>{lead.lastContact} — Stage: {lead.stage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function PostCallView({ duration, lead, notes, onSave, onDiscard }: {
  duration: number; lead: any; notes: string; onSave: (o: string) => void; onDiscard: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [outcome, setOutcome] = useState("");
  const [nextStage, setNextStage] = useState("Needs Analysis");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleSave = async () => {
    if (!outcome) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onSave(outcome);
  };

  return (
    <Shell role="user">
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "hsl(var(--success)_/_0.12)" }}>
                <Phone size={32} style={{ color: "hsl(var(--success))" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "hsl(var(--on-surface))" }}>Call Ended</h2>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Duration: {formatDuration(duration)}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Call Outcome *</p>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }}
              >
                <option value="">Select outcome...</option>
                <option>Appointment Scheduled</option>
                <option>Callback Requested</option>
                <option>Interested — Follow Up</option>
                <option>Not Interested</option>
                <option>Wrong Number</option>
                <option>No Answer / Voicemail</option>
                <option>DNC / Do Not Call</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Move to Stage</p>
              <select
                value={nextStage}
                onChange={(e) => setNextStage(e.target.value)}
                className="w-full h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }}
              >
                {["New Lead", "Attempting Contact", "Contacted", "Needs Analysis", "Quote Sent", "Application Submitted", "In Underwriting", "Bound / Policy Active", "Closed Lost"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>Call Notes</p>
              <textarea value={notes} readOnly className="w-full h-24 p-3 rounded-xl text-sm resize-none" style={{ backgroundColor: "hsl(var(--surface-container-low))", borderColor: "hsl(var(--border))", color: "hsl(var(--on-surface))" }} />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onDiscard}>Discard Log</Button>
              <Button className="flex-1" onClick={handleSave} loading={loading} disabled={!outcome || loading}>Save & Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}