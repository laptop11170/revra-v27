"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Bot, Loader2, CheckCircle2 } from "lucide-react";

const COVERAGE_TYPES = ["Medicare Advantage", "ACA (Individual & Family)", "Final Expense", "Life Insurance", "Group Health"];
const PIPELINE_STAGES = ["New Lead", "Attempting Contact", "Contacted", "Needs Analysis", "Quote Sent", "Application Submitted", "In Underwriting"];
const AGENTS = ["John Smith", "Marcus Chen", "Alex Turner", "Rachel Kim", "Emma Wilson", "David Rodriguez", "James Brown"];

interface CampaignBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (data: any) => void;
}

export function CampaignBuilderModal({ open, onClose, onCreate }: CampaignBuilderModalProps) {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    coverageType: "",
    stages: [] as string[],
    agents: [] as string[],
    script: "",
    timeout: "30",
    maxRetries: "3",
    voicemailBehavior: "skip",
  });

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const toggleStage = (s: string) =>
    setForm((p) => ({ ...p, stages: p.stages.includes(s) ? p.stages.filter((x) => x !== s) : [...p.stages, s] }));
  const toggleAgent = (a: string) =>
    setForm((p) => ({ ...p, agents: p.agents.includes(a) ? p.agents.filter((x) => x !== a) : [...p.agents, a] }));

  const canNext = step === 1 ? form.name.trim() && form.coverageType
    : step === 2 ? form.stages.length > 0
    : step === 3 ? form.script.trim()
    : true;

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setCreating(false);
    setCreated(true);
    onCreate?.(form);
    addToast({ type: "success", title: "Campaign Created", description: `"${form.name}" is now running with ${form.stages.length} target stages` });
    setTimeout(() => {
      setCreated(false);
      setStep(1);
      setForm({ name: "", coverageType: "", stages: [], agents: [], script: "", timeout: "30", maxRetries: "3", voicemailBehavior: "skip" });
      onClose();
    }, 2000);
  };

  const steps = [
    { n: 1, label: "Campaign" },
    { n: 2, label: "Targets" },
    { n: 3, label: "Script" },
    { n: 4, label: "Review" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Emma AI Campaign"
      description={created ? undefined : `Step ${step} of 4 — ${steps[step - 1].label}`}
      size="md"
      footer={
        created ? null : (
          <>
            {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
            {step < 4 && <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Next</Button>}
            {step === 4 && <Button onClick={handleCreate} loading={creating} disabled={creating}>Create Campaign</Button>}
          </>
        )
      }
    >
      {created ? (
        <div className="py-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Campaign Created!</p>
          <p className="text-sm text-gray-500 mt-1">&ldquo;{form.name}&rdquo; is now live on Emma AI</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s.n ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s.n ? <CheckCircle2 size={12} /> : s.n}
                </div>
                {s.n < 4 && <div className={`h-0.5 flex-1 ${step > s.n ? "bg-blue-600" : "bg-gray-100"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Campaign */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Medicare Follow-Up Q2" className="mt-1" />
              </div>
              <div>
                <Label>Coverage Type *</Label>
                <select
                  value={form.coverageType}
                  onChange={(e) => update("coverageType", e.target.value)}
                  className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select coverage type...</option>
                  {COVERAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Call Timeout (sec)</Label>
                  <Input type="number" value={form.timeout} onChange={(e) => update("timeout", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Max Retries</Label>
                  <Input type="number" value={form.maxRetries} onChange={(e) => update("maxRetries", e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Voicemail Behavior</Label>
                <select
                  value={form.voicemailBehavior}
                  onChange={(e) => update("voicemailBehavior", e.target.value)}
                  className="mt-1 w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="skip">Skip</option>
                  <option value="leave_voicemail">Leave Voicemail</option>
                  <option value="retry_later">Retry Later</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Targets */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Target Pipeline Stages *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PIPELINE_STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStage(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.stages.includes(s)
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Target Agents (optional)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AGENTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAgent(a)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.agents.includes(a)
                          ? "bg-purple-50 border-purple-300 text-purple-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {form.stages.length === 0 ? "Select at least one stage to target" : `${form.stages.length} stage(s) selected`}
              </p>
            </div>
          )}

          {/* Step 3: Script */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>AI Script / Talking Points *</Label>
                <p className="text-xs text-gray-400 mb-2">Provide the main talking points Emma AI will use during calls</p>
                <textarea
                  value={form.script}
                  onChange={(e) => update("script", e.target.value)}
                  placeholder="e.g. Introduce yourself and RevRa, ask about current coverage, explain Medicare Advantage benefits, ask if they have questions, schedule a follow-up call..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Bot size={14} className="text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700">AI Enhancement</p>
                </div>
                <p className="text-xs text-blue-600">Emma AI will adapt this script based on lead responses and past conversation history.</p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Campaign Name</span>
                  <span className="text-sm font-medium text-gray-900">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Coverage Type</span>
                  <span className="text-sm font-medium text-gray-900">{form.coverageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Target Stages</span>
                  <span className="text-sm font-medium text-gray-900">{form.stages.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Target Agents</span>
                  <span className="text-sm font-medium text-gray-900">{form.agents.length > 0 ? form.agents.join(", ") : "All agents"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Call Timeout</span>
                  <span className="text-sm font-medium text-gray-900">{form.timeout}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Max Retries</span>
                  <span className="text-sm font-medium text-gray-900">{form.maxRetries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Voicemail</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{form.voicemailBehavior.replace("_", " ")}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">AI Script Preview</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic line-clamp-4">{form.script}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
