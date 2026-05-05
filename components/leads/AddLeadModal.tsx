"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (lead: any) => void;
  defaultStage?: string;
}

const LEAD_TYPES = [
  { value: "medicare", label: "Medicare" },
  { value: "aca", label: "ACA / Obamacare" },
  { value: "final_expense", label: "Final Expense" },
  { value: "life", label: "Life Insurance" },
  { value: "other", label: "Other" },
];

const SOURCES = [
  { value: "google_ads", label: "Google Ads" },
  { value: "facebook", label: "Facebook" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "cold_call", label: "Cold Call" },
  { value: "import", label: "CSV Import" },
  { value: "marketplace", label: "Marketplace" },
  { value: "other", label: "Other" },
];

export function AddLeadModal({ open, onClose, onSuccess, defaultStage = "new_lead" }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    lead_type: "",
    source: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.phone.trim()) {
      setError("First name and phone are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pipeline_stage: defaultStage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.lead);
        handleClose();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to add lead");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ first_name: "", last_name: "", phone: "", email: "", lead_type: "", source: "" });
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Lead"
      description="Create a new lead in your pipeline."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Add Lead
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div style={{ color: "hsl(var(--destructive))", fontSize: 13, padding: "8px 12px", borderRadius: 8, background: "hsl(var(--destructive)/0.1)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <Label htmlFor="first_name" style={{ marginBottom: 4, display: "block" }}>First Name *</Label>
            <Input
              id="first_name"
              placeholder="John"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name" style={{ marginBottom: 4, display: "block" }}>Last Name</Label>
            <Input
              id="last_name"
              placeholder="Doe"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone" style={{ marginBottom: 4, display: "block" }}>Phone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+15551234567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" style={{ marginBottom: 4, display: "block" }}>Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <Label htmlFor="lead_type" style={{ marginBottom: 4, display: "block" }}>Lead Type</Label>
            <select
              id="lead_type"
              value={form.lead_type}
              onChange={(e) => setForm({ ...form, lead_type: e.target.value })}
              style={{
                width: "100%",
                height: 40,
                borderRadius: "var(--radius-lg)",
                padding: "0 12px",
                backgroundColor: "hsl(var(--surface-container-low))",
                color: "hsl(var(--on-surface))",
                border: "1px solid hsl(var(--border))",
                fontSize: 14,
              }}
            >
              <option value="">Select type...</option>
              {LEAD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="source" style={{ marginBottom: 4, display: "block" }}>Source</Label>
            <select
              id="source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              style={{
                width: "100%",
                height: 40,
                borderRadius: "var(--radius-lg)",
                padding: "0 12px",
                backgroundColor: "hsl(var(--surface-container-low))",
                color: "hsl(var(--on-surface))",
                border: "1px solid hsl(var(--border))",
                fontSize: 14,
              }}
            >
              <option value="">Select source...</option>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}