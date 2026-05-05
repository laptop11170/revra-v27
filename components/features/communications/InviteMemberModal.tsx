"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { UserPlus, CheckCircle2, Loader2 } from "lucide-react";

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onInvite?: (data: { email: string; firstName: string; lastName: string; role: string }) => void;
}

export function InviteMemberModal({ open, onClose, onInvite }: InviteMemberModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", role: "Agent" });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleInvite = async () => {
    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onInvite?.(form);
    setStep("success");
  };

  const handleClose = () => {
    setStep("form");
    setForm({ email: "", firstName: "", lastName: "", role: "Agent" });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invite Team Member" size="md">
      {step === "form" ? (
        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="agent@company.com"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Jane"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Smith"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onChange={(e) => update("role", e.target.value)} className="mt-1">
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </Select>
            <p className="text-xs text-gray-400 mt-1">
              Agents can manage leads. Admins can manage team and settings. Viewers are read-only.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent</h3>
          <p className="text-sm text-gray-500 mb-1">An invitation email has been sent to</p>
          <p className="text-sm font-medium text-gray-900">{form.email}</p>
          <p className="text-xs text-gray-400 mt-2">They'll receive instructions to join your workspace.</p>
        </div>
      )}

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
        {step === "form" ? (
          <>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleInvite}
              disabled={!form.email.trim() || !form.firstName.trim() || !form.lastName.trim()}
              loading={loading}
            >
              <UserPlus size={16} className="mr-2" />
              Send Invite
            </Button>
          </>
        ) : (
          <Button onClick={handleClose}>Done</Button>
        )}
      </div>
    </Modal>
  );
}