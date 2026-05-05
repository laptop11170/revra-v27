"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";

interface AddWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: { name: string; owner: string; ownerEmail: string; plan: string; trial: boolean }) => void;
}

export function AddWorkspaceModal({ open, onClose, onSave }: AddWorkspaceModalProps) {
  const [form, setForm] = useState({ name: "", owner: "", ownerEmail: "", plan: "Starter", trial: true });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.owner.trim() || !form.ownerEmail.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSaved(true);
    onSave?.(form as any);
    setTimeout(() => {
      setSaved(false);
      setForm({ name: "", owner: "", ownerEmail: "", plan: "Starter", trial: true });
      onClose();
    }, 800);
  };

  const canSave = form.name.trim() && form.owner.trim() && form.ownerEmail.trim();

  return (
    <Modal open={open} onClose={onClose} title="Create Workspace" size="md">
      <div className="space-y-4">
        <div>
          <Label>Workspace Name</Label>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Phoenix Health Agents"
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Owner Name</Label>
            <Input
              value={form.owner}
              onChange={(e) => update("owner", e.target.value)}
              placeholder="Jane Smith"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Owner Email</Label>
            <Input
              type="email"
              value={form.ownerEmail}
              onChange={(e) => update("ownerEmail", e.target.value)}
              placeholder="jane@company.com"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label>Plan</Label>
          <Select value={form.plan} onChange={(e) => update("plan", e.target.value)} className="mt-1">
            <option value="Starter">Starter — $250/mo</option>
            <option value="Growth">Growth — $450/mo</option>
            <option value="Scale">Scale — $799/mo</option>
            <option value="Enterprise">Enterprise — Custom</option>
          </Select>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="trial-check"
            checked={form.trial}
            onChange={(e) => update("trial", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <div>
            <label htmlFor="trial-check" className="text-sm font-medium text-gray-700 cursor-pointer">Start with 14-day trial</label>
            <p className="text-xs text-gray-400">No billing until trial ends</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={loading} disabled={!canSave}>
          {saved ? <CheckCircle2 size={14} className="mr-1" /> : null}
          {saved ? "Created!" : "Create Workspace"}
        </Button>
      </div>
    </Modal>
  );
}