"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead } from "@/lib/mock-data";
import { getInitials } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Phone,
  MessageSquare,
  Calendar,
  Bot,
  Mail,
  MapPin,
  Shield,
  DollarSign,
  Star,
  User,
  FileText,
  MessageCircle,
  Activity,
  PhoneCall,
  Send,
  Plus,
  ChevronRight,
  ExternalLink,
  Edit2,
  CheckCircle2,
  X,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";

type ProfileTab = "overview" | "communications" | "activity" | "documents" | "notes";

interface LeadProfilePanelProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
}

export function LeadProfilePanel({ open, onClose, lead }: LeadProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [leadNotes, setLeadNotes] = useState("");

  if (!open) return null;

  const activities = [
    { type: "call", icon: <PhoneCall size={13} />, label: "Outbound Call", time: "2 days ago", detail: "Duration: 8 min · Outcome: Callback Requested", agent: "John Smith" },
    { type: "sms", icon: <Send size={13} />, label: "SMS Sent", time: "1 day ago", detail: "Following up on the Medicare Advantage quote...", agent: "John Smith" },
    { type: "stage", icon: <ChevronRight size={13} />, label: "Stage Changed", time: "3 days ago", detail: "Contacted → Quote Sent", agent: "John Smith" },
    { type: "call", icon: <PhoneCall size={13} />, label: "Outbound Call", time: "4 days ago", detail: "Duration: 12 min · Outcome: Contacted", agent: "John Smith" },
    { type: "created", icon: <Plus size={13} />, label: "Lead Created", time: "5 days ago", detail: `Imported from ${lead.leadSource}`, agent: "System" },
  ];

  const messages = [
    { dir: "outbound", content: "Hi, this is John from RevRa. Calling regarding your Medicare Advantage inquiry.", time: "5 days ago", status: "delivered" },
    { dir: "inbound", content: "Oh yes, I filled out a form online. I'm interested in Medicare plans.", time: "5 days ago" },
    { dir: "outbound", content: "Great! I'd love to walk you through our options. Do you have 15 minutes?", time: "5 days ago", status: "delivered" },
    { dir: "inbound", content: "Sure, I'm available tomorrow afternoon.", time: "5 days ago" },
    { dir: "outbound", content: "Hi, following up on our conversation. Do you have any questions about the quote?", time: "1 day ago", status: "delivered" },
    { dir: "inbound", content: "Actually yes, I have a few questions about the deductible.", time: "1 day ago" },
  ];

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <User size={14} /> },
    { id: "communications", label: "Messages", icon: <MessageCircle size={14} /> },
    { id: "activity", label: "Activity", icon: <Activity size={14} /> },
    { id: "documents", label: "Files", icon: <FileText size={14} /> },
    { id: "notes", label: "Notes", icon: <FileText size={14} /> },
  ];

  return (
    <>
      
      {/* Panel — floating with curved edges */}
      <div
        className="fixed right-4 top-4 z-50 flex flex-col animate-in slide-in-from-right-4 duration-300 rounded-xl overflow-hidden"
        style={{
          width: "min(780px, calc(100vw - 32px))",
          height: "calc(100vh - 32px)",
          backgroundColor: "hsl(var(--surface))",
          boxShadow: "0 25px 80px -12px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--border) / 0.5), inset 0 1px 0 hsl(var(--on-surface) / 0.05)",
        }}
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl" style={{ background: "linear-gradient(to right, #a078ff, #00cbe6)" }} />

        {/* Header */}
        <div
          className="flex items-center px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4"
            style={{ background: "linear-gradient(135deg, #a078ff, #00cbe6)" }}
          >
            {getInitials(lead.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold" style={{ color: "hsl(var(--on-surface))" }}>{lead.name}</h2>
              {lead.exclusive && (
                <Badge variant="warning">Exclusive</Badge>
              )}
              <Badge variant={lead.score >= 80 ? "success" : lead.score >= 50 ? "warning" : "default"}>
                <Star size={10} className="mr-1" style={{ fill: "currentColor" }} />
                {lead.score}/100
              </Badge>
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {lead.coverageType} · {lead.leadSource}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" title="Edit lead">
              <Edit2 size={16} />
            </Button>
            <Button variant="ghost" size="sm" title="Open in new tab">
              <ExternalLink size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} title="Close">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Quick actions bar */}
        <div
          className="flex items-center gap-3 px-6 py-4 shrink-0"
          style={{ backgroundColor: "hsl(var(--surface-container-low))", borderBottom: "1px solid hsl(var(--border))" }}
        >
          <Button size="sm" className="bg-gradient-primary hover:brightness-110">
            <Phone size={14} className="mr-2" />Call
          </Button>
          <Button size="sm" variant="secondary">
            <MessageSquare size={14} className="mr-2" />SMS
          </Button>
          <Button size="sm" variant="secondary">
            <Calendar size={14} className="mr-2" />Schedule
          </Button>
          <Button size="sm" variant="secondary">
            <Bot size={14} className="mr-2" />Emma AI
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="outline">
            <Target size={14} className="mr-2" />Add to List
          </Button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 px-6 py-3 shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-primary text-white shadow-md"
                  : "hover:bg-[hsl(var(--surface-container-high))]"
              )}
              style={activeTab !== tab.id ? { color: "hsl(var(--muted-foreground))" } : {}}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && <OverviewPanel lead={lead} activities={activities} />}
          {activeTab === "communications" && <CommunicationsPanel lead={lead} messages={messages} />}
          {activeTab === "activity" && <ActivityPanel activities={activities} />}
          {activeTab === "documents" && <DocumentsPanel />}
          {activeTab === "notes" && <NotesPanel notes={leadNotes} onChange={setLeadNotes} />}
        </div>
      </div>
    </>
  );
}

// ====== Overview ======
function OverviewPanel({
  lead,
  activities,
}: {
  lead: Lead;
  activities: { type: string; icon: React.ReactNode; label: string; time: string; detail: string; agent: string }[];
}) {
  const scoreColor = lead.score >= 80 ? "var(--success)" : lead.score >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Score Hero Card */}
      <div
        className="p-6 rounded-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${lead.score >= 80 ? "142 76% 46% / 0.12)" : lead.score >= 50 ? "38 92% 50% / 0.12)" : "0 84% 60% / 0.12)"} 0%, hsl(var(--surface-container)) 100%)`,
          border: "1px solid hsl(var(--border))"
        }}
      >
        {/* Decorative gradient orb */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, hsl(${scoreColor} / 0.15), transparent 70%)` }}
        />

        <div className="flex items-start gap-6 relative">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: `hsl(${scoreColor})` }}>Lead Score</p>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-bold" style={{ color: `hsl(${scoreColor})` }}>{lead.score}</p>
              <p className="text-2xl" style={{ color: `hsl(${scoreColor} / 0.5)` }}>/100</p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp size={14} style={{ color: `hsl(${scoreColor})` }} />
              <p className="text-sm font-medium" style={{ color: `hsl(${scoreColor})` }}>
                {lead.score >= 80 ? "Hot Lead" : lead.score >= 50 ? "Warm Lead" : "Cold Lead"}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="space-y-3 min-w-[200px]">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Score Breakdown</p>
            {[
              { label: "Medicare in CA", value: "+20", positive: true },
              { label: "Budget $250+/mo", value: "+15", positive: true },
              { label: "Exclusive source", value: "+5", positive: true },
              lead.daysInStage > 5 ? { label: "Stalled (>5 days)", value: "-5", positive: false } : null,
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "hsl(var(--on-surface-variant))" }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: item.positive ? "hsl(var(--success))" : "hsl(var(--danger))" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="p-5 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}>
              <Phone size={16} style={{ color: "hsl(var(--primary))" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Contact Information</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: <Phone size={14} />, label: "Primary Phone", value: lead.phonePrimary, highlight: true },
              { icon: <Mail size={14} />, label: "Email Address", value: lead.email },
              lead.dob ? { icon: <Calendar size={14} />, label: "Date of Birth", value: `${lead.dob}${lead.age ? ` (${lead.age}y)` : ""}` } : null,
              { icon: <MapPin size={14} />, label: "Location", value: `${lead.county}, ${lead.state}` },
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(var(--surface-container-high))" }}>
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: item.highlight ? "hsl(var(--primary))" : "hsl(var(--on-surface))" }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Info */}
        <div className="p-5 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--secondary) / 0.15)" }}>
              <Shield size={16} style={{ color: "hsl(var(--secondary))" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Insurance Details</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Coverage Type", value: lead.coverageType, badge: true },
              lead.monthlyBudget ? { label: "Monthly Budget", value: lead.monthlyBudget } : null,
              lead.currentCarrier ? { label: "Current Carrier", value: lead.currentCarrier } : null,
              lead.incomeRange ? { label: "Income Range", value: lead.incomeRange } : null,
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(var(--surface-container-high))" }}>
                  <DollarSign size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{item.label}</p>
                  {item.badge ? (
                    <Badge variant="info" className="mt-0.5">{item.value}</Badge>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="p-5 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--info) / 0.15)" }}>
            <Target size={16} style={{ color: "hsl(var(--info))" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Pipeline Status</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Assigned Agent", value: lead.assignedAgent, icon: <User size={14} /> },
            { label: "Current Stage", value: lead.stage, color: "var(--primary)" },
            { label: "Days in Stage", value: `${lead.daysInStage}d`, color: lead.daysInStage > 5 ? "var(--danger)" : "var(--on-surface)" },
            { label: "Last Contact", value: lead.lastContact, icon: <Clock size={14} /> },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
              <p className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{item.label}</p>
              <p className="text-sm font-bold" style={{ color: item.color || "hsl(var(--on-surface))" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      <div
        className="p-5 rounded-lg"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.08))", border: "1px solid hsl(var(--primary) / 0.2)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}>
            <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Emma's Recommendation</p>
        </div>
        <p className="text-sm mb-4" style={{ color: "hsl(var(--on-surface-variant))" }}>
          {lead.score >= 80
            ? `Reach out to ${lead.name} today — high-intent signal detected. Call first, then follow up with SMS using our Medicare follow-up template.`
            : lead.score >= 50
            ? `Continue nurturing ${lead.name}. Schedule a call this week to discuss ${lead.coverageType} options and address any questions.`
            : `Keep ${lead.name} in your regular cadence. No urgent action needed — focus on higher-priority leads.`}
        </p>
        <div className="flex gap-3">
          <Button size="sm" className="bg-gradient-primary hover:brightness-110">
            <Phone size={14} className="mr-2" />Call Now
          </Button>
          <Button size="sm" variant="outline">
            <Calendar size={14} className="mr-2" />Schedule
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare size={14} className="mr-2" />Send SMS
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Recent Activity</p>
          <button className="text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>View all →</button>
        </div>
        <div className="space-y-2">
          {activities.map((act, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
              style={{ backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border))")}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "hsl(var(--surface-container-high))", color: "hsl(var(--primary))" }}
              >
                {act.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{act.label}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{act.detail}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{act.time}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>by {act.agent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== Communications ======
function CommunicationsPanel({ lead, messages }: {
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
    setNewMsg(`Hi ${lead.name.split(" ")[0]}, thanks for your interest in ${lead.coverageType} coverage. Do you have 15 minutes this week?`);
  };

  return (
    <div className="flex flex-col h-full px-6 py-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.dir === "outbound" ? "justify-end" : "justify-start")}>
            <div
              className="max-w-[75%] px-4 py-3 rounded-lg"
              style={
                msg.dir === "outbound"
                  ? { background: "linear-gradient(to right, #a078ff, #00cbe6)", color: "white" }
                  : { backgroundColor: "hsl(var(--surface-container))", color: "hsl(var(--on-surface))", border: "1px solid hsl(var(--border))" }
              }
            >
              <p className="text-sm">{msg.content}</p>
              <div
                className="flex items-center gap-2 mt-2"
                style={{ color: msg.dir === "outbound" ? "rgba(255,255,255,0.7)" : "hsl(var(--muted-foreground))" }}
              >
                <span className="text-xs">{msg.time}</span>
                {msg.status && msg.dir === "outbound" && <CheckCircle2 size={12} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex gap-3">
          <Input
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleAiDraft} disabled={aiDrafting}>
            {aiDrafting ? <Activity size={14} className="animate-spin" /> : <Bot size={14} />}
            <span className="ml-2">AI</span>
          </Button>
          <Button size="sm" className="bg-gradient-primary hover:brightness-110">
            <Send size={14} className="mr-2" />Send
          </Button>
        </div>
        <p className="text-xs mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
          Powered by Emma AI · Messages logged to lead timeline
        </p>
      </div>
    </div>
  );
}

// ====== Activity ======
function ActivityPanel({ activities }: {
  activities: { type: string; icon: React.ReactNode; label: string; time: string; detail: string; agent: string }[];
}) {
  return (
    <div className="px-6 py-4 space-y-4">
      {activities.map((act, i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-lg cursor-pointer transition-all"
          style={{ backgroundColor: "hsl(var(--surface-container))", border: "1px solid hsl(var(--border))" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border))")}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.15))", color: "hsl(var(--primary))" }}
          >
            {act.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{act.label}</span>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>·</span>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{act.time}</span>
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--on-surface-variant))" }}>{act.detail}</p>
            <p className="text-xs mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>by {act.agent}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====== Documents ======
function DocumentsPanel() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div
        className="w-20 h-20 rounded-lg flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))" }}
      >
        <FileText size={32} style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
      <p className="text-base font-semibold mb-2" style={{ color: "hsl(var(--on-surface))" }}>No documents yet</p>
      <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Upload quotes, applications, and files for this lead</p>
      <Button variant="outline">
        <Plus size={14} className="mr-2" />Upload File
      </Button>
    </div>
  );
}

// ====== Notes ======
function NotesPanel({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--warning) / 0.15)" }}>
            <FileText size={16} style={{ color: "hsl(var(--warning))" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "hsl(var(--on-surface))" }}>Private Notes</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Only visible to you</p>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add notes about this lead — qualifications, preferences, key details to remember..."
          className="w-full h-48 p-4 rounded-lg text-sm resize-none focus:outline-none transition-all"
          style={{
            color: "hsl(var(--on-surface))",
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--surface-container))",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--primary))")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border))")}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button size="sm" onClick={handleSave} className="bg-gradient-primary hover:brightness-110">
          {saved ? <CheckCircle2 size={14} className="mr-2" /> : null}
          {saved ? "Saved" : "Save Notes"}
        </Button>
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Saved locally in your browser</span>
      </div>
    </div>
  );
}