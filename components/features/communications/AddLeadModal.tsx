"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COVERAGE_TYPES, LEAD_SOURCES, US_STATES } from "@/lib/mock-data";
import { US_STATES as STATES } from "@/lib/constants";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import { Shield, Mail, Phone, MapPin, DollarSign, Users, Calendar, Star, Info, X } from "lucide-react";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: LeadFormData) => void;
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  dob: string;
  state: string;
  county: string;
  coverageType: string;
  currentCarrier: string;
  monthlyBudget: string;
  householdSize: string;
  incomeRange: string;
  leadSource: string;
  notes: string;
}

const INCOME_RANGES = [
  "Under $25k", "$25k–$35k", "$35k–$45k", "$45k–$60k",
  "$55k–$70k", "$60k–$80k", "$70k–$90k", "$90k–$120k", "$120k+",
];

const BUDGET_OPTIONS = [
  "$50/mo", "$75/mo", "$100/mo", "$125/mo", "$150/mo",
  "$175/mo", "$200/mo", "$250/mo", "$300/mo", "$400/mo", "Custom",
];

export function AddLeadModal({ open, onClose, onSave }: AddLeadModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<LeadFormData>({
    firstName: "",
    lastName: "",
    phonePrimary: "",
    phoneSecondary: "",
    email: "",
    dob: "",
    state: "",
    county: "",
    coverageType: "",
    currentCarrier: "",
    monthlyBudget: "",
    householdSize: "",
    incomeRange: "",
    leadSource: "",
    notes: "",
  });

  const update = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(form);
    onClose();
    setStep(1);
    setForm({
      firstName: "", lastName: "", phonePrimary: "", phoneSecondary: "",
      email: "", dob: "", state: "", county: "", coverageType: "",
      currentCarrier: "", monthlyBudget: "", householdSize: "",
      incomeRange: "", leadSource: "", notes: "",
    });
  };

  const canProceed = step === 1
    ? form.firstName.trim() && form.lastName.trim() && form.phonePrimary.trim() && form.email.trim()
    : form.coverageType && form.state && form.leadSource;

  const steps = [
    { id: 1, label: "Contact Info" },
    { id: 2, label: "Insurance Profile" },
    { id: 3, label: "Additional Details" },
  ];

  return (
    <Modal open={open} onClose={onClose} size="xl" title="Add New Lead">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                step === s.id
                  ? "bg-blue-600 text-white"
                  : step > s.id
                  ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > s.id ? (
                <span className="w-4 h-4 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">✓</span>
              ) : (
                <span>{s.id}</span>
              )}
              {s.label}
            </button>
            {i < steps.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Phone size={12} /> Primary Phone *
              </label>
              <Input
                value={form.phonePrimary}
                onChange={(e) => update("phonePrimary", e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Phone size={12} /> Secondary Phone
              </label>
              <Input
                value={form.phoneSecondary}
                onChange={(e) => update("phoneSecondary", e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Mail size={12} /> Email *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="john.smith@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Calendar size={12} /> Date of Birth
              </label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => update("dob", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Coverage Type *</label>
              <div className="flex flex-wrap gap-2">
                {COVERAGE_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => update("coverageType", type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.coverageType === type
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
              <select
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select state...</option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <MapPin size={12} /> County
              </label>
              <Input
                value={form.county}
                onChange={(e) => update("county", e.target.value)}
                placeholder="Los Angeles"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Shield size={12} /> Current Carrier
              </label>
              <Input
                value={form.currentCarrier}
                onChange={(e) => update("currentCarrier", e.target.value)}
                placeholder="Aetna, Blue Cross, etc."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <DollarSign size={12} /> Monthly Budget
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update("monthlyBudget", opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.monthlyBudget === opt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Users size={12} /> Household Size
                </label>
                <select
                  value={form.householdSize}
                  onChange={(e) => update("householdSize", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} member{n > 1 ? "s" : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <DollarSign size={12} /> Income Range
                </label>
                <select
                  value={form.incomeRange}
                  onChange={(e) => update("incomeRange", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {INCOME_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Star size={12} /> Lead Source *
              </label>
              <div className="flex flex-wrap gap-2">
                {LEAD_SOURCES.map((src) => (
                  <button
                    key={src}
                    onClick={() => update("leadSource", src)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.leadSource === src
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <Textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any additional notes about this lead..."
                className="h-24"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Info size={12} />
          Lead will be assigned to New Lead stage
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
              Next →
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!canProceed}>
              Add Lead
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}