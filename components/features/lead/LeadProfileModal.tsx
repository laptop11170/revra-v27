"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Lead } from "@/lib/mock-data";
import { getInitials, getStageColor } from "@/lib/constants";
import {
  Phone,
  MessageSquare,
  Calendar,
  Bot,
  MoreHorizontal,
  Mail,
  MapPin,
  Shield,
  DollarSign,
  Clock,
  Star,
  User,
  FileText,
  MessageCircle,
  Activity,
  PhoneCall,
  Send,
  Plus,
  ChevronRight,
  X,
  ExternalLink,
  Edit2,
  Copy,
  CheckCircle2,
} from "lucide-react";

type ProfileTab = "overview" | "communications" | "activity" | "documents" | "notes";

interface LeadProfileModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
}

// ====== Window Chrome ======
function WindowChrome({ title, subtitle, lead, onClose }: {
  title: string;
  subtitle: string;
  lead: Lead;
  onClose: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{
        backgroundColor: "hsl(var(--surface-container))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="w-3.5 h-3.5 rounded-full transition-opacity hover:opacity-80"
          style={{ backgroundColor: "hsl(var(--danger))" }}
          title="Close"
        />
        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: "hsl(var(--muted-foreground)_/_0.4)" }} />
        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: "hsl(var(--muted-foreground)_/_0.4)" }} />
      </div>

      {/* Title */}
      <div className="flex-1 text-center">
        <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{title}</p>
        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" title="Edit"><Edit2 size={13} /></Button>
        <Button variant="ghost" size="sm" title="Open in new"><ExternalLink size={13} /></Button>
      </div>
    </div>
  );
}

// ====== Tab Bar ======
function TabBar({ active, onChange }: {
  active: ProfileTab;
  onChange: (t: ProfileTab) => void;
}) {
  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <User size={13} /> },
    { id: "communications", label: "Communications", icon: <MessageCircle size={13} /> },
    { id: "activity", label: "Activity", icon: <Activity size={13} /> },
    { id: "documents", label: "Documents", icon: <FileText size={13} /> },
    { id: "notes", label: "Notes", icon: <FileText size={13} /> },
  ];

  return (
    <div
      className="flex gap-1 px-5 py-2"
      style={{ borderBottom: "1px solid hsl(var(--border))" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={
            active === tab.id
              ? { backgroundColor: "hsl(var(--primary)_/_0.15)", color: "hsl(var(--primary))" }
              : { color: "hsl(var(--muted-foreground))" }
          }
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ====== Quick Actions Bar ======
function QuickActionsBar({ lead }: { lead: Lead }) {
  return (
    <div
      className="flex items-center gap-2 px-5 py-3"
      style={{
        backgroundColor: "hsl(var(--surface-container-low))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      <Button size="sm">
        <Phone size={13} className="mr-1.5" />Call
      </Button>
      <Button size="sm" variant="outline">
        <MessageSquare size={13} className="mr-1.5" />SMS
      </Button>
      <Button size="sm" variant="outline">
        <Calendar size={13} className="mr-1.5" />Schedule
      </Button>
      <Button size="sm" variant="outline">
        <Bot size={13} className="mr-1.5" />Emma AI
      </Button>
      <div className="flex-1" />
      <Badge variant={
        lead.score >= 80 ? "success" :
        lead.score >= 50 ? "warning" : "default"
      }>
        <Star size={10} className="mr-1" style={{ fill: "currentColor" }} />
        Score: {lead.score}
      </Badge>
    </div>
  );
}

// ====== Overview Tab ======
function OverviewTab({ lead }: { lead: Lead }) {
  const activities = [
    { type: "call", icon: <PhoneCall size={12} />, label: "Outbound Call", time: "2 days ago", detail: "Duration: 8 min · Outcome: Callback Requested", agent: "John Smith" },
    { type: "sms", icon: <Send size={12} />, label: "SMS Sent", time: "1 day ago", detail: "Following up on the Medicare Advantage quote...", agent: "John Smith" },
    { type: "stage", icon: <ChevronRight size={12} />, label: "Stage Changed", time: "3 days ago", detail: "Contacted → Quote Sent", agent: "John Smith" },
    { type: "call", icon: <PhoneCall size={12} />, label: "Outbound Call", time: "4 days ago", detail: "Duration: 12 min · Outcome: Contacted", agent: "John Smith" },
    { type: "created", icon: <Plus size={12} />, label: "Lead Created", time: "5 days ago", detail: `Imported from ${lead.leadSource}`, agent: "System" },
  ];

  return (
    <div className="space-y-5 px-5 py-4">
      {/* Lead Score */}
      <div
        className="p-5 rounded-lg border"
        style={{
          backgroundColor: "hsl(var(--success)_/_0.08)",
          borderColor: "hsl(var(--success)_/_0.25)",
        }}
      >
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--success))" }}>AI Lead Score</p>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-5xl font-bold" style={{ color: "hsl(var(--success))" }}>{lead.score}</p>
              <p className="text-xl" style={{ color: "hsl(var(--success)_/_0.6)" }}>/100</p>
            </div>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--success))" }}>
              {lead.score >= 80 ? "Hot lead — prioritize immediately" :
               lead.score >= 50 ? "Warm lead — work within normal cadence" :
               "Cold lead — minimal investment"}
            </p>
          </div>
          <div className="text-right space-y-1.5 min-w-[180px]">
            <p className="text-xs font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Score Factors</p>
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2 text-xs">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Medicare in CA</span>
                <span className="font-bold" style={{ color: "hsl(var(--success))" }}>+20</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Budget $250+/mo</span>
                <span className="font-bold" style={{ color: "hsl(var(--success))" }}>+15</span>
              </div>
              {lead.age && lead.age >= 65 && (
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Age 65+ qualified</span>
                  <span className="font-bold" style={{ color: "hsl(var(--success))" }}>+10</span>
                </div>
              )}
              {lead.exclusive && (
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Exclusive source</span>
                  <span className="font-bold" style={{ color: "hsl(var(--success))" }}>+5</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contact Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Contact Information</p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Phone size={11} />Phone (Primary)
                </p>
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.phonePrimary}</p>
              </div>
              {lead.phoneSecondary && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Phone size={11} />Phone (Secondary)
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.phoneSecondary}</p>
                </div>
              )}
              <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Mail size={11} />Email
                </p>
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.email}</p>
              </div>
              {lead.dob && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Calendar size={11} />Date of Birth
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.dob}{lead.age ? ` (${lead.age} yrs)` : ""}</p>
                </div>
              )}
              <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <MapPin size={11} />Location
                </p>
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.county}, {lead.state}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Insurance Profile */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Insurance Profile</p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Shield size={11} />Coverage Type
                </p>
                <div className="mt-1">
                  <Badge variant="info">{lead.coverageType}</Badge>
                </div>
              </div>
              {lead.monthlyBudget && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <DollarSign size={11} />Monthly Budget
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.monthlyBudget}</p>
                </div>
              )}
              {lead.currentCarrier && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Shield size={11} />Current Carrier
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.currentCarrier}</p>
                </div>
              )}
              {lead.householdSize && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <User size={11} />Household Size
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.householdSize} members</p>
                </div>
              )}
              {lead.incomeRange && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                  <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <DollarSign size={11} />Income Range
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{lead.incomeRange}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment & Pipeline */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Assignment & Pipeline</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Assigned Agent", lead.assignedAgent, "hsl(var(--on-surface))"],
            ["Current Stage", lead.stage, getStageColor(lead.stage)],
            ["Days in Stage", `${lead.daysInStage}d`, lead.daysInStage > 5 ? "hsl(var(--danger))" : "hsl(var(--on-surface))"],
            ["Last Activity", lead.lastContact, "hsl(var(--on-surface))"],
            ["Created", lead.createdAt, "hsl(var(--on-surface))"],
            ["Lead Source", lead.leadSource, "hsl(var(--on-surface))"],
          ].map(([label, value, color]) => (
            <div
              key={label as string}
              className="p-3 rounded-xl"
              style={{ backgroundColor: "hsl(var(--surface-container-low))" }}
            >
              <p className="text-xs mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{label as string}</p>
              <p className="text-sm font-semibold" style={{ color: color as string }}>{value as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      <div
        className="p-5 rounded-lg border"
        style={{
          backgroundColor: "hsl(var(--primary)_/_0.05)",
          borderColor: "hsl(var(--primary)_/_0.2)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Bot size={14} style={{ color: "hsl(var(--primary))" }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Next Best Action</p>
        </div>
        <p className="text-sm mb-4" style={{ color: "hsl(var(--on-surface))" }}>
          {lead.score >= 80
            ? `Reach out to ${lead.name} today — high-intent signal detected. Call first, then follow up with a text using our Medicare follow-up template.`
            : lead.score >= 50
            ? `Continue nurturing this lead. Schedule a call for this week to discuss their coverage needs and answer questions about ${lead.coverageType}.`
            : `Keep ${lead.name} in your regular touch cadence. No urgent action needed — maintain monthly check-ins.`}
        </p>
        <div className="flex gap-2">
          <Button size="sm" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--on-primary))" }}>
            <Phone size={12} className="mr-1.5" />Call Now
          </Button>
          <Button size="sm" variant="outline">
            <Calendar size={12} className="mr-1.5" />Schedule
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Recent Activity</p>
          <button className="text-xs" style={{ color: "hsl(var(--primary))" }}>View all →</button>
        </div>
        <div className="space-y-1">
          {activities.map((act, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: "hsl(var(--surface-container-low))" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--primary)_/_0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--surface-container-low))")}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "hsl(var(--surface-container-high))", color: "hsl(var(--muted-foreground))" }}
              >
                {act.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: "hsl(var(--on-surface)" }}>{act.label}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{act.detail}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{act.time}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{act.agent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== Communications Tab ======
function CommunicationsTab({ lead, messages }: {
  lead: Lead;
  messages: { dir: string; content: string; time: string; status?: string }[];
}) {
  const [newMsg, setNewMsg] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);

  const handleAiDraft = async () => {
    if (!newMsg.trim()) return;
    setAiDrafting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAiDrafting(false);
    setNewMsg(
      `Hi ${lead.name.split(" ")[0]}, thanks for your interest in ${lead.coverageType} coverage. I'd love to walk you through your options — do you have 15 minutes this week?`
    );
  };

  return (
    <div className="flex flex-col h-full px-5 py-4">
      {/* Conversation */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: "360px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.dir === "outbound" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[75%] rounded-lg px-4 py-3"
              style={
                msg.dir === "outbound"
                  ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--on-primary))" }
                  : { backgroundColor: "hsl(var(--surface-container-low))", color: "hsl(var(--on-surface))", border: "1px solid hsl(var(--border))" }
              }
            >
              <p className="text-sm">{msg.content}</p>
              <div
                className="flex items-center gap-2 mt-1.5"
                style={{ color: msg.dir === "outbound" ? "hsl(var(--on-primary)_/_0.65)" : "hsl(var(--muted-foreground))" }}
              >
                <span className="text-xs">{msg.time}</span>
                {msg.status && msg.dir === "outbound" && (
                  <CheckCircle2 size={10} style={{ color: "hsl(var(--success))" }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div
        className="pt-3"
        style={{ borderTop: "1px solid hsl(var(--border))" }}
      >
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleAiDraft} disabled={aiDrafting}>
            {aiDrafting ? <Activity size={13} className="animate-spin" /> : <Bot size={13} />}
            <span className="ml-1.5 hidden sm:inline">AI Draft</span>
          </Button>
          <Button size="sm">
            <Send size={13} className="mr-1.5" />Send
          </Button>
        </div>
        <p className="text-xs mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          AI drafts are powered by EMMA · Messages logged to lead timeline
        </p>
      </div>
    </div>
  );
}

// ====== Activity Tab ======
function ActivityTab({ activities }: {
  activities: { type: string; icon: React.ReactNode; label: string; time: string; detail: string; agent: string }[];
}) {
  return (
    <div className="px-5 py-4 space-y-1">
      {activities.map((act, i) => (
        <div
          key={i}
          className="flex gap-4 py-4 px-3 rounded-xl transition-colors cursor-pointer"
          style={{ borderBottom: "1px solid hsl(var(--border)_/_0.4)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--primary)_/_0.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "hsl(var(--surface-container-low))", color: "hsl(var(--muted-foreground))" }}
          >
            {act.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{act.label}</span>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{act.time}</span>
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{act.detail}</p>
            <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>by {act.agent}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====== Documents Tab ======
function DocumentsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5">
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: "hsl(var(--surface-container-low))" }}
      >
        <FileText size={28} style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>No documents yet</p>
      <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Upload quotes, applications, and other files</p>
      <Button variant="outline" size="sm" className="mt-4">
        <Plus size={13} className="mr-1.5" />Upload Document
      </Button>
    </div>
  );
}

// ====== Notes Tab ======
function NotesTab({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Private Notes</p>
          <div
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: "hsl(var(--surface-container-low))", color: "hsl(var(--muted-foreground))" }}
          >
            Only visible to you
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add notes about this lead — qualifications, preferences, important details..."
          className="w-full h-48 p-4 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 transition-all"
          style={{
            color: "hsl(var(--on-surface))",
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--surface))",
          }}
          onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary)_/_0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave}>
          {saved ? <CheckCircle2 size={13} className="mr-1.5" /> : null}
          {saved ? "Saved" : "Save Notes"}
        </Button>
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Notes are saved locally in your browser</span>
      </div>
    </div>
  );
}

// ====== Main Modal ======
export function LeadProfileModal({ open, onClose, lead }: LeadProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [leadNotes, setLeadNotes] = useState("");

  const activities = [
    { type: "call", icon: <PhoneCall size={12} />, label: "Outbound Call", time: "2 days ago", detail: "Duration: 8 min · Outcome: Callback Requested", agent: "John Smith" },
    { type: "sms", icon: <Send size={12} />, label: "SMS Sent", time: "1 day ago", detail: "Following up on the Medicare Advantage quote...", agent: "John Smith" },
    { type: "stage", icon: <ChevronRight size={12} />, label: "Stage Changed", time: "3 days ago", detail: "Contacted → Quote Sent", agent: "John Smith" },
    { type: "call", icon: <PhoneCall size={12} />, label: "Outbound Call", time: "4 days ago", detail: "Duration: 12 min · Outcome: Contacted", agent: "John Smith" },
    { type: "created", icon: <Plus size={12} />, label: "Lead Created", time: "5 days ago", detail: `Imported from ${lead.leadSource}`, agent: "System" },
  ];

  const messages = [
    { dir: "outbound", content: "Hi, this is John from RevRa. Calling regarding your Medicare Advantage inquiry.", time: "5 days ago", status: "delivered" },
    { dir: "inbound", content: "Oh yes, I filled out a form online. I'm interested in Medicare plans.", time: "5 days ago" },
    { dir: "outbound", content: "Great! I'd love to walk you through our options. Do you have 15 minutes?", time: "5 days ago", status: "delivered" },
    { dir: "inbound", content: "Sure, I'm available tomorrow afternoon.", time: "5 days ago" },
    { dir: "outbound", content: "Hi, following up on our conversation. Do you have any questions about the quote?", time: "1 day ago", status: "delivered" },
    { dir: "inbound", content: "Actually yes, I have a few questions about the deductible.", time: "1 day ago" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--surface))",
          borderRadius: "1rem",
          width: "min(900px, 95vw)",
          maxHeight: "85vh",
          overflow: "hidden",
        }}
      >
        {/* Window Chrome */}
        <WindowChrome
          title={lead.name}
          subtitle={`${lead.coverageType} · ${lead.leadSource}`}
          lead={lead}
          onClose={onClose}
        />

        {/* Quick Actions */}
        <QuickActionsBar lead={lead} />

        {/* Tab Bar */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && <OverviewTab lead={lead} />}
          {activeTab === "communications" && <CommunicationsTab lead={lead} messages={messages} />}
          {activeTab === "activity" && <ActivityTab activities={activities} />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "notes" && <NotesTab notes={leadNotes} onChange={setLeadNotes} />}
        </div>
      </div>
    </Modal>
  );
}