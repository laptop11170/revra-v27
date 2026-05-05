"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface AddProviderModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: { providerType: string; name: string; apiKey: string; modelId: string; maxTokens: string; temperature: string }) => void;
}

const PROVIDER_TYPES = [
  { key: "llm", label: "LLM Provider (Claude, GPT, Gemini, etc.)" },
  { key: "emma", label: "EMMA AI Voice Agent" },
  { key: "sms", label: "SMS Provider (Twilio, etc.)" },
  { key: "imessage", label: "iMessage Gateway" },
  { key: "rcs", label: "RCS Business" },
  { key: "whatsapp", label: "WhatsApp Business" },
];

export function AddProviderModal({ open, onClose, onSave }: AddProviderModalProps) {
  const [form, setForm] = useState({ providerType: "llm", name: "", apiKey: "", modelId: "claude-opus-4-7", maxTokens: "8192", temperature: "0.7" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.apiKey.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSaved(true);
    onSave?.(form as any);
    setTimeout(() => {
      setSaved(false);
      setForm({ providerType: "llm", name: "", apiKey: "", modelId: "claude-opus-4-7", maxTokens: "8192", temperature: "0.7" });
      onClose();
    }, 800);
  };

  const canSave = form.name.trim() && form.apiKey.trim();

  return (
    <Modal open={open} onClose={onClose} title="Add AI / Provider" size="md">
      <div className="space-y-4">
        <div>
          <Label>Provider Type</Label>
          <Select value={form.providerType} onChange={(e) => update("providerType", e.target.value)} className="mt-1">
            {PROVIDER_TYPES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Provider Name</Label>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Claude (Anthropic)" className="mt-1" />
        </div>
        <div>
          <Label>API Key</Label>
          <Input type="password" value={form.apiKey} onChange={(e) => update("apiKey", e.target.value)} placeholder="sk-ant-..." className="mt-1" />
        </div>
        {form.providerType === "llm" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model ID</Label>
                <Input value={form.modelId} onChange={(e) => update("modelId", e.target.value)} placeholder="claude-opus-4-7" className="mt-1" />
              </div>
              <div>
                <Label>Max Tokens</Label>
                <Input type="number" value={form.maxTokens} onChange={(e) => update("maxTokens", e.target.value)} placeholder="8192" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Temperature</Label>
              <Input type="number" step="0.1" min="0" max="1" value={form.temperature} onChange={(e) => update("temperature", e.target.value)} placeholder="0.7" className="mt-1 w-32" />
              <p className="text-xs text-gray-400 mt-1">Recommended: 0.7 for balanced responses</p>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="outline" size="sm">Test Connection</Button>
        <Button onClick={handleSave} loading={loading} disabled={!canSave}>
          {saved ? <CheckCircle2 size={14} className="mr-1" /> : null}
          {saved ? "Added!" : "Add Provider"}
        </Button>
      </div>
    </Modal>
  );
}