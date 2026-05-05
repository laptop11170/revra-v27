"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: { firstName: string; lastName: string; email: string; role: string; workspaceId: string }) => void;
}

export function AddUserModal({ open, onClose, onSave }: AddUserModalProps) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "Agent", workspaceId: "w1" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSaved(true);
    onSave?.(form as any);
    setTimeout(() => {
      setSaved(false);
      setForm({ firstName: "", lastName: "", email: "", role: "Agent", workspaceId: "w1" });
      onClose();
    }, 800);
  };

  const canSave = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <Modal open={open} onClose={onClose} title="Add Platform User" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Jane" className="mt-1" />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Smith" className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Email Address</Label>
          <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@company.com" className="mt-1" />
        </div>
        <div>
          <Label>Role</Label>
          <Select value={form.role} onChange={(e) => update("role", e.target.value)} className="mt-1">
            <option value="Agent">Agent</option>
            <option value="Admin">Admin</option>
            <option value="Viewer">Viewer</option>
          </Select>
        </div>
        <div>
          <Label>Workspace</Label>
          <Select value={form.workspaceId} onChange={(e) => update("workspaceId", e.target.value)} className="mt-1">
            <option value="w1">San Diego Health Agents</option>
            <option value="w2">Texas Insurance Group</option>
            <option value="w3">Medicare Direct</option>
            <option value="w4">Florida Health Partners</option>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={loading} disabled={!canSave}>
          {saved ? <CheckCircle2 size={14} className="mr-1" /> : null}
          {saved ? "Added!" : "Add User"}
        </Button>
      </div>
    </Modal>
  );
}