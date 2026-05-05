"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

// Node template definitions
interface NodeTemplate {
  id: string;
  label: string;
  type: "trigger" | "condition" | "action" | "delay";
  icon: string;
  bg: string;
  border: string;
  text: string;
}

const NODE_TEMPLATES: NodeTemplate[] = [
  { id: "new-lead", label: "New Lead", type: "trigger", icon: "🎯", bg: "bg-blue-500", border: "border-blue-300", text: "text-white" },
  { id: "schedule", label: "Schedule", type: "trigger", icon: "📅", bg: "bg-blue-500", border: "border-blue-300", text: "text-white" },
  { id: "call-completed", label: "Call Completed", type: "trigger", icon: "📞", bg: "bg-blue-500", border: "border-blue-300", text: "text-white" },
  { id: "stage-change", label: "Stage Changed", type: "trigger", icon: "🔄", bg: "bg-blue-500", border: "border-blue-300", text: "text-white" },
  { id: "is-hot-lead", label: "Lead Score > 80", type: "condition", icon: "🔥", bg: "bg-yellow-400", border: "border-yellow-300", text: "text-yellow-900" },
  { id: "has-email", label: "Has Email", type: "condition", icon: "📧", bg: "bg-yellow-400", border: "border-yellow-300", text: "text-yellow-900" },
  { id: "assign-agent", label: "Assign Agent", type: "action", icon: "👤", bg: "bg-green-500", border: "border-green-300", text: "text-white" },
  { id: "send-sms", label: "Send SMS", type: "action", icon: "💬", bg: "bg-green-500", border: "border-green-300", text: "text-white" },
  { id: "add-tag", label: "Add Tag", type: "action", icon: "🏷️", bg: "bg-green-500", border: "border-green-300", text: "text-white" },
  { id: "notify-agent", label: "Notify Agent", type: "action", icon: "🔔", bg: "bg-green-500", border: "border-green-300", text: "text-white" },
  { id: "wait", label: "Wait", type: "delay", icon: "⏱️", bg: "bg-purple-500", border: "border-purple-300", text: "text-white" },
];

interface CanvasNode {
  id: string;
  templateId: string;
  config: Record<string, string>;
}

interface WorkflowCanvasProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: { name: string; nodes: CanvasNode[] }) => void;
  workflowName?: string;
}

export function WorkflowCanvas({ open, onClose, onSave, workflowName }: WorkflowCanvasProps) {
  const [name, setName] = useState(workflowName || "");
  const [nodes, setNodes] = useState<CanvasNode[]>([
    { id: "node-1", templateId: "new-lead", config: {} },
    { id: "node-2", templateId: "is-hot-lead", config: { threshold: "80" } },
    { id: "node-3", templateId: "send-sms", config: { template: "Hi {{firstName}}, this is {{agentName}}..." } },
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedTemplate = selectedNode ? NODE_TEMPLATES.find((t) => t.id === selectedNode.templateId) : null;

  const addNode = (templateId: string) => {
    const newNode: CanvasNode = { id: `node-${Date.now()}`, templateId, config: {} };
    setNodes((prev) => [...prev, newNode]);
  };

  const updateNodeConfig = (nodeId: string, key: string, value: string) => {
    setNodes((prev) => prev.map((n) =>
      n.id === nodeId ? { ...n, config: { ...n.config, [key]: value } } : n
    ));
  };

  const removeNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    onSave?.({ name: name.trim(), nodes });
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const getNodeY = (index: number) => 24 + index * 100;

  return (
    <Modal open={open} onClose={onClose} title={workflowName ? "Edit Workflow" : "Create Workflow"} size="xl">
      <div className="p-4">
        {/* Workflow name */}
        <div className="mb-4">
          <Label>Workflow Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hot Lead SMS Follow-up"
            className="mt-1"
          />
        </div>

        {/* Canvas area */}
        <div className="flex gap-4 border border-gray-200 rounded-xl overflow-hidden min-h-[480px]">
          {/* Left: Palette */}
          <div className="w-52 bg-gray-50 border-r border-gray-200 p-3 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Trigger</p>
            <div className="space-y-1 mb-4">
              {NODE_TEMPLATES.filter((t) => t.type === "trigger").map((t) => (
                <button
                  key={t.id}
                  onClick={() => addNode(t.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer", t.bg, t.text)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Condition</p>
            <div className="space-y-1 mb-4">
              {NODE_TEMPLATES.filter((t) => t.type === "condition").map((t) => (
                <button
                  key={t.id}
                  onClick={() => addNode(t.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer", t.bg, t.text)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Action</p>
            <div className="space-y-1 mb-4">
              {NODE_TEMPLATES.filter((t) => t.type === "action").map((t) => (
                <button
                  key={t.id}
                  onClick={() => addNode(t.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer", t.bg, t.text)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delay</p>
            <div className="space-y-1">
              {NODE_TEMPLATES.filter((t) => t.type === "delay").map((t) => (
                <button
                  key={t.id}
                  onClick={() => addNode(t.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer", t.bg, t.text)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Node chain */}
          <div className="flex-1 bg-white p-4 relative">
            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <p className="text-sm">Click nodes from the left panel to add them</p>
                <p className="text-xs mt-1">Build your workflow from top to bottom</p>
              </div>
            ) : (
              <div className="space-y-0 relative">
                {nodes.map((node, index) => {
                  const template = NODE_TEMPLATES.find((t) => t.id === node.templateId)!;
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <div key={node.id} className="flex flex-col items-center">
                      <div
                        onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                        className={cn(
                          "w-56 border-2 rounded-xl p-4 cursor-pointer transition-all relative",
                          template.border,
                          isSelected ? "shadow-lg ring-2 ring-blue-400" : "shadow-sm hover:shadow-md"
                        )}
                      >
                        <div className={cn("flex items-center gap-2", template.bg, template.text, "rounded-lg px-2 py-1 w-fit mb-2")}>
                          <span className="text-base">{template.icon}</span>
                          <span className="text-sm font-semibold">{template.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 capitalize">{template.type} node</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                          className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {index < nodes.length - 1 && (
                        <div className="flex flex-col items-center py-1">
                          <div className="w-0.5 h-5 bg-gray-200" />
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <ArrowRight size={10} className="text-gray-400" />
                          </div>
                          <div className="w-0.5 h-5 bg-gray-200" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Config panel */}
          <div className="w-56 bg-gray-50 border-l border-gray-200 p-3 overflow-y-auto">
            {selectedNode && selectedTemplate ? (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Configure</p>
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg mb-3", selectedTemplate.bg, selectedTemplate.text)}>
                  <span>{selectedTemplate.icon}</span>
                  <span className="text-sm font-medium">{selectedTemplate.label}</span>
                </div>

                {/* Dynamic config based on node type */}
                {selectedTemplate.id === "send-sms" && (
                  <div className="mb-3">
                    <Label className="text-xs">SMS Template</Label>
                    <Textarea
                      value={selectedNode.config.template || ""}
                      onChange={(e) => updateNodeConfig(selectedNode.id, "template", e.target.value)}
                      placeholder="Hi {{firstName}}, this is {{agentName}} from RevRa..."
                      className="mt-1 h-24 text-xs"
                    />
                    <p className="text-xs text-gray-400 mt-1">Use {"{{firstName}}"}, {"{{agentName}}"} as variables</p>
                  </div>
                )}
                {selectedTemplate.id === "is-hot-lead" && (
                  <div className="mb-3">
                    <Label className="text-xs">Score Threshold</Label>
                    <Input
                      type="number"
                      value={selectedNode.config.threshold || "80"}
                      onChange={(e) => updateNodeConfig(selectedNode.id, "threshold", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                {selectedTemplate.id === "wait" && (
                  <div className="mb-3">
                    <Label className="text-xs">Wait Duration</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={selectedNode.config.duration || "1"}
                        onChange={(e) => updateNodeConfig(selectedNode.id, "duration", e.target.value)}
                        className="w-16"
                      />
                      <select
                        value={selectedNode.config.unit || "hours"}
                        onChange={(e) => updateNodeConfig(selectedNode.id, "unit", e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                )}
                {selectedTemplate.id === "assign-agent" && (
                  <div className="mb-3">
                    <Label className="text-xs">Assign Method</Label>
                    <select
                      value={selectedNode.config.method || "round-robin"}
                      onChange={(e) => updateNodeConfig(selectedNode.id, "method", e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="round-robin">Round Robin</option>
                      <option value="lowest-load">Lowest Lead Count</option>
                      <option value="specific">Specific Agent</option>
                    </select>
                  </div>
                )}
                {selectedTemplate.id === "add-tag" && (
                  <div className="mb-3">
                    <Label className="text-xs">Tag Name</Label>
                    <Input
                      value={selectedNode.config.tag || ""}
                      onChange={(e) => updateNodeConfig(selectedNode.id, "tag", e.target.value)}
                      placeholder="e.g. hot-lead, follow-up"
                      className="mt-1"
                    />
                  </div>
                )}
                {selectedTemplate.id === "notify-agent" && (
                  <div className="mb-3">
                    <Label className="text-xs">Notify via</Label>
                    <select
                      value={selectedNode.config.channel || "sms"}
                      onChange={(e) => updateNodeConfig(selectedNode.id, "channel", e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="slack">Slack</option>
                    </select>
                  </div>
                )}
                {(selectedTemplate.type === "trigger" || selectedTemplate.type === "condition") && (
                  <p className="text-xs text-gray-400 italic">No additional configuration needed</p>
                )}

                <button
                  onClick={() => removeNode(selectedNode.id)}
                  className="w-full mt-3 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 justify-center"
                >
                  <Trash2 size={12} /> Remove Node
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-2">
                <p className="text-xs">Click a node to configure it</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="outline" size="sm">
          <Play size={14} className="mr-1" />Test Workflow
        </Button>
        <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>
          {saved ? <CheckCircle2 size={14} className="mr-1" /> : null}
          {saved ? "Saved!" : "Save Workflow"}
        </Button>
      </div>
    </Modal>
  );
}

// Workflow list item type
export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  effectiveness: number;
  lastRun: string;
  status: "active" | "paused";
  runs: number;
}

const DEFAULT_WORKFLOWS: Workflow[] = [
  { id: "wf1", name: "Hot Lead SMS", trigger: "New Lead", effectiveness: 92, lastRun: "2 hr ago", status: "active", runs: 142 },
  { id: "wf2", name: "Callback Reminder", trigger: "Schedule", effectiveness: 78, lastRun: "5 hr ago", status: "active", runs: 89 },
  { id: "wf3", name: "Quote Follow-up", trigger: "Stage Change", effectiveness: 65, lastRun: "1 day ago", status: "paused", runs: 56 },
];

export { DEFAULT_WORKFLOWS };