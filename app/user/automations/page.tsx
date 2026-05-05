"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import {
  ArrowLeft,
  Search,
  Mail,
  MessageSquare,
  Clock,
  SplitSquareVertical,
  Tag,
  CheckCircle2,
  Pencil,
  List,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  PlayCircle,
  Loader2,
} from "lucide-react";

const workflowTabs = ["builder", "settings", "enrollment", "reports", "activity"];

const actionsByCategory = {
  "Communication": [
    { label: "Send Email", type: "email" },
    { label: "Send SMS", type: "sms" },
    { label: "Send InMail", type: "email" },
  ],
  "Conditions & Logic": [
    { label: "If / Else", type: "cond" },
    { label: "Wait / Delay", type: "wait" },
    { label: "Goal", type: "cond" },
  ],
  "Data Operations": [
    { label: "Update Field", type: "update" },
    { label: "Add Tag", type: "tag" },
    { label: "Adjust Score", type: "cond" },
  ],
  "Integrations": [
    { label: "Slack Notification", type: "cond" },
    { label: "Webhook", type: "cond" },
    { label: "Create Task", type: "task" },
  ],
};

const nodeColors: Record<string, { bg: string; icon: string }> = {
  start:  { bg: "rgba(16,185,129,0.15)", icon: "var(--mint)" },
  email:  { bg: "rgba(99,102,241,0.15)", icon: "var(--indi-400)" },
  sms:    { bg: "rgba(6,182,212,0.15)", icon: "var(--cyan)" },
  wait:   { bg: "rgba(245,158,11,0.15)", icon: "var(--amber)" },
  cond:   { bg: "rgba(139,92,246,0.15)", icon: "var(--viol-400)" },
  tag:    { bg: "rgba(16,185,129,0.15)", icon: "var(--mint)" },
  task:   { bg: "rgba(16,185,129,0.15)", icon: "var(--mint)" },
  update: { bg: "rgba(6,182,212,0.15)", icon: "var(--cyan)" },
  end:    { bg: "rgba(239,68,68,0.15)", icon: "var(--rose)" },
  list:   { bg: "rgba(99,102,241,0.15)", icon: "var(--indi-400)" },
};

const nodeIcons: Record<string, React.FC<{ size?: number; color?: string; style?: React.CSSProperties }>> = {
  start:  () => <PlayCircle size={12} />,
  email:  () => <Mail size={12} />,
  sms:    () => <MessageSquare size={12} />,
  wait:   () => <Clock size={12} />,
  cond:   () => <SplitSquareVertical size={12} />,
  tag:    () => <Tag size={12} />,
  task:   () => <CheckCircle2 size={12} />,
  update: () => <Pencil size={12} />,
  end:    () => <X size={12} />,
  list:   () => <List size={12} />,
};

type WFNode = {
  id: string;
  type: string;
  title: string;
  desc: string;
  x: number;
  y: number;
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: string;
  nodes: WFNode[];
  is_active: boolean;
};

const initialNodes: WFNode[] = [
  { id: "start",  type: "start",  title: "Start",         desc: "Contact added to list — Q4 Nurture", x: 480, y: 30  },
  { id: "email1", type: "email",  title: "Send Email",    desc: "Intro Email",                        x: 480, y: 130 },
  { id: "wait1",  type: "wait",   title: "Wait",          desc: "2 Days",                              x: 480, y: 230 },
  { id: "cond1",  type: "cond",   title: "If / Else",     desc: "Email Opened?",                       x: 480, y: 330 },
  { id: "end",    type: "end",     title: "End",            desc: "Exit this workflow",                  x: 530, y: 730 },
];

export default function AutomationsPage() {
  const [tab, setTab] = useState("builder");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const currentWorkflow = workflows[0] ?? null;
  const nodes = currentWorkflow?.nodes ?? initialNodes;

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      const data = await res.json();
      setWorkflows(data.workflows ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const toggleActive = async (workflowId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });
      if (!res.ok) throw new Error("Failed to update workflow");
      const data = await res.json();
      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? { ...w, ...data } : w))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const inspectorNode = nodes.find((n) => n.id === selectedNode);
  const nc = inspectorNode ? nodeColors[inspectorNode.type] || nodeColors.email : null;
  const nodeIcon = inspectorNode ? nodeIcons[inspectorNode.type] || Mail : Mail;

  return (
    <Shell role="user">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid rgba(37,43,63,0.7)",
            background: "var(--surface)",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-icon p-2">
              <ArrowLeft size={14} />
            </button>
            <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>
              Automations / <b style={{ color: "var(--ink)", fontWeight: 600 }}>{currentWorkflow?.name ?? "Q4 Lead Nurture Campaign"}</b>
            </span>
            {currentWorkflow && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-3)",
                  border: "1px solid var(--line)",
                  fontSize: 10,
                  color: "var(--ink-mute)",
                }}
              >
                {currentWorkflow.status}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {workflowTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  background: tab === t ? "var(--surface-2)" : "transparent",
                  color: tab === t ? "var(--ink)" : "var(--ink-mute)",
                  boxShadow: tab === t ? "inset 0 0 0 1px var(--line-2)" : "none",
                  transition: "all 0.12s",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-icon p-2"><Clock size={14} /></button>
            <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }}>Test</button>
            <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }}>Save</button>
            <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>Publish</button>
          </div>
        </div>

        {/* Three-column body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Actions sidebar */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: "1px solid rgba(37,43,63,0.7)",
              padding: "16px 14px",
              overflowY: "auto",
              background: "rgba(19,24,38,0.95)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--surface-4)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "0 10px",
                height: 34,
                marginBottom: 16,
              }}
            >
              <Search size={13} style={{ color: "var(--ink-mute)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--ink)" }}
              />
            </div>

            {Object.entries(actionsByCategory).map(([cat, actions]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <h4
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--ink-faint)",
                    marginBottom: 6,
                    paddingLeft: 4,
                  }}
                >
                  {cat}
                </h4>
                {actions.map((a) => (
                  <div
                    key={a.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 10px",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12.5,
                      color: "var(--ink-mute)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                  >
                    <GripVertical size={12} style={{ color: "var(--ink-faint)", flexShrink: 0 }} />
                    {a.label}
                  </div>
                ))}
              </div>
            ))}

            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--line-2)",
                fontSize: 11.5,
                color: "var(--ink-mute)",
                textAlign: "center",
              }}
            >
              Drag actions to the canvas
            </div>
          </div>

              {loading ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 size={32} style={{ color: "var(--ink-mute)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
                      backgroundSize: "22px 22px",
                      pointerEvents: "none",
                    }}
                  />

            {/* Zoom toolbar */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                gap: 4,
                zIndex: 5,
              }}
            >
              <button className="btn-icon p-2" style={{ background: "var(--surface-4)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}><Plus size={12} /></button>
              <button className="btn-icon p-2" style={{ background: "var(--surface-4)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: 12, lineHeight: 1 }}>−</span>
              </button>
            </div>

            <div style={{ position: "absolute", top: 14, left: 60, fontSize: 11, color: "var(--ink-dim)", zIndex: 5 }}>
              100%
            </div>

            {/* Active toggle */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 5,
                fontSize: 12,
                color: "var(--ink-mute)",
              }}
            >
              {currentWorkflow?.is_active ? "Active" : "Inactive"}
              <button
                onClick={() => currentWorkflow && toggleActive(currentWorkflow.id, !currentWorkflow.is_active)}
                disabled={!currentWorkflow}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 999,
                  background: (currentWorkflow?.is_active ?? false) ? "var(--mint)" : "var(--line)",
                  position: "relative",
                  border: "none",
                  cursor: currentWorkflow ? "pointer" : "default",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: "white",
                    position: "absolute",
                    top: 3,
                    left: (currentWorkflow?.is_active ?? false) ? 19 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </div>

              {/* Node canvas */}
              <div style={{ position: "relative", minWidth: 900, minHeight: 800, padding: 80 }}>
                {nodes.map((node) => {
                  const colors = nodeColors[node.type] || nodeColors.email;
                  const Icon = nodeIcons[node.type] || Mail;
                  const isSelected = selectedNode === node.id;
                  return (
                    <div
                      key={node.id}
                      style={{
                        position: "absolute",
                        left: node.x,
                        top: node.y,
                        cursor: "pointer",
                        background: "var(--surface)",
                        border: isSelected ? "2px solid var(--indi-500)" : "1px solid var(--line)",
                        borderRadius: "10px",
                        padding: "8px 12px 8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 180,
                        boxShadow: isSelected ? "0 0 0 2px #6366F1, 0 8px 24px -8px rgba(99,102,241,0.55)" : "0 4px 14px -8px rgba(0,0,0,0.6)",
                        transition: "border-color 0.12s",
                      }}
                      onClick={() => setSelectedNode(isSelected ? null : node.id)}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "6px",
                          background: colors.bg,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {(() => { const C = nodeIcons[node.type] || Mail; return <C size={12} />; })()}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, lineHeight: 1.1 }}>{node.title}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-dim)", lineHeight: 1.2, marginTop: 2 }}>{node.desc}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Connector lines */}
                <svg
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
                >
                  {[
                    { x1: 522, y1: 90, x2: 522, y2: 130 },
                    { x1: 522, y1: 190, x2: 522, y2: 230 },
                  ].map((l, i) => (
                    <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--line-2)" strokeWidth="1.4" />
                  ))}
                </svg>
              </div>

              {/* Minimap */}
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  width: 100,
                  height: 60,
                  background: "var(--surface-4)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                {nodes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      position: "absolute",
                      left: n.x * 0.1,
                      top: n.y * 0.05,
                      width: 4,
                      height: 4,
                      borderRadius: 999,
                      background: "var(--line-2)",
                    }}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: 30,
                    top: 20,
                    width: 60,
                    height: 36,
                    border: "1px solid var(--indi-500)",
                    borderRadius: 2,
                    opacity: 0.6,
                  }}
                />
              </div>
              </>
              )}

          {/* Inspector */}
          <div
            style={{
              width: 280,
              flexShrink: 0,
              borderLeft: "1px solid rgba(37,43,63,0.7)",
              background: "rgba(19,24,38,0.95)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {inspectorNode ? (
              <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {nc && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          background: nc.bg,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(() => { const C = nodeIcons[inspectorNode.type] || Mail; return <C size={14} />; })()}
                      </div>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{inspectorNode.title}</span>
                  </div>
                  <button className="btn-icon p-1.5" onClick={() => setSelectedNode(null)}>
                    <X size={13} />
                  </button>
                </div>

                <p style={{ fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.5, marginBottom: 16 }}>
                  {inspectorNode.type === "wait" && "Add a delay before moving to the next action."}
                  {inspectorNode.type === "email" && "Send an email to the contact in this branch."}
                  {inspectorNode.type === "cond" && "Branch the workflow based on a condition."}
                  {inspectorNode.type === "start" && "Defines who enters this workflow."}
                  {inspectorNode.type === "end" && "Marks the end of this workflow."}
                  {inspectorNode.type === "tag" && "Add a tag to this contact."}
                  {inspectorNode.type === "sms" && "Send an SMS to the contact."}
                  {inspectorNode.type === "task" && "Create a task for the assigned rep."}
                  {inspectorNode.type === "update" && "Update a field on the contact record."}
                  {inspectorNode.type === "list" && "Add the contact to a list."}
                </p>

                {inspectorNode.type === "wait" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="input-label">Wait Type</label>
                      <select className="input" style={{ appearance: "none" }}>
                        <option>Fixed Time</option>
                        <option>Until Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Duration</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="input" defaultValue="2" style={{ flex: 1 }} />
                        <select className="input" style={{ flex: 1, appearance: "none" }}>
                          <option>Days</option>
                          <option>Hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorNode.type === "email" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="input-label">Email Template</label>
                      <select className="input" style={{ appearance: "none" }}>
                        <option>{inspectorNode.desc}</option>
                        <option>Use custom template</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Subject Line</label>
                      <input className="input" defaultValue="Quick question for you" />
                    </div>
                  </div>
                )}

                {inspectorNode.type === "cond" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="input-label">Condition</label>
                      <select className="input" style={{ appearance: "none" }}>
                        <option>{inspectorNode.desc}</option>
                        <option>Has clicked link</option>
                        <option>Has replied</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: 16 }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.1)",
                      color: "var(--rose)",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedNode(null)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <ChevronRight size={18} style={{ color: "var(--ink-mute)" }} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.5 }}>
                    Select a node to edit its properties
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}