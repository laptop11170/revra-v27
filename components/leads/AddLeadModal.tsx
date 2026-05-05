"use client";

import { useState, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Loader2, Upload, FileSpreadsheet, ChevronDown, ArrowRight, Check, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

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

// Column definitions with fuzzy matching aliases
const COLUMN_DEFS: Record<string, { label: string; required: boolean; examples: string[] }> = {
  first_name: { label: "First Name", required: true, examples: ["first_name", "first name", "firstname", "given name", "fname", "first"] },
  last_name: { label: "Last Name", required: false, examples: ["last_name", "last name", "lastname", "surname", "family name", "lname"] },
  email: { label: "Email", required: false, examples: ["email", "email_address", "email address", "e-mail", "mail"] },
  phone: { label: "Phone", required: true, examples: ["phone", "phone_number", "phone number", "mobile", "cell", "tel", "telephone", "contact"] },
  lead_type: { label: "Lead Type", required: false, examples: ["lead_type", "lead type", "type", "product", "insurance_type", "coverage"] },
  source: { label: "Source", required: false, examples: ["source", "lead_source", "lead source", "referral_source", "utm_source"] },
};

type ImportRow = Record<string, string>;
type ColumnMapping = Record<string, string>; // target field → source column name

function fuzzyMatch(header: string, candidates: string[]): boolean {
  const h = header.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return candidates.some((c) => {
    const c2 = c.toLowerCase().replace(/[^a-z0-9]/g, "");
    return h === c2 || h.includes(c2) || c2.includes(h);
  });
}

function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const [field, def] of Object.entries(COLUMN_DEFS)) {
    const match = headers.find((h) => fuzzyMatch(h, def.examples));
    if (match) mapping[field] = match;
  }
  return mapping;
}

// ── Single Lead Form ─────────────────────────────────────────────────────────
function SingleLeadForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "", lead_type: "", source: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Label htmlFor="first_name" style={{ marginBottom: 4, display: "block" }}>First Name *</Label>
          <Input id="first_name" placeholder="John" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="last_name" style={{ marginBottom: 4, display: "block" }}>Last Name</Label>
          <Input id="last_name" placeholder="Doe" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="phone" style={{ marginBottom: 4, display: "block" }}>Phone *</Label>
        <Input id="phone" type="tel" placeholder="+15551234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="email" style={{ marginBottom: 4, display: "block" }}>Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Label htmlFor="lead_type" style={{ marginBottom: 4, display: "block" }}>Lead Type</Label>
          <select id="lead_type" value={form.lead_type} onChange={(e) => setForm({ ...form, lead_type: e.target.value })} style={{ width: "100%", height: 40, borderRadius: "var(--radius-lg)", padding: "0 12px", backgroundColor: "hsl(var(--surface-container-low))", color: "hsl(var(--on-surface))", border: "1px solid hsl(var(--border))", fontSize: 14 }}>
            <option value="">Select type...</option>
            {LEAD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="source" style={{ marginBottom: 4, display: "block" }}>Source</Label>
          <select id="source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ width: "100%", height: 40, borderRadius: "var(--radius-lg)", padding: "0 12px", backgroundColor: "hsl(var(--surface-container-low))", color: "hsl(var(--on-surface))", border: "1px solid hsl(var(--border))", fontSize: 14 }}>
            <option value="">Select source...</option>
            {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 size={14} className="animate-spin" />}
        Add Lead
      </Button>
    </form>
  );
}

// ── Bulk Import Modal ─────────────────────────────────────────────────────────
function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "importing" | "done">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importCount, setImportCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError("");
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse<ImportRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data.length) { setError("File appears to be empty"); return; }
          setHeaders(results.meta.fields || []);
          setRows(results.data as ImportRow[]);
          setMapping(autoMapColumns(results.meta.fields || []));
          setStep("map");
        },
        error: () => setError("Failed to parse CSV file"),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<ImportRow>(ws);
          if (!json.length) { setError("File appears to be empty"); return; }
          const fields = Object.keys(json[0]);
          setHeaders(fields);
          setRows(json as ImportRow[]);
          setMapping(autoMapColumns(fields));
          setStep("map");
        } catch { setError("Failed to parse Excel file"); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Please upload a .csv or .xlsx file");
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const getMappedRows = (): any[] => {
    return rows.map((row) => {
      const lead: any = {};
      for (const [field, sourceCol] of Object.entries(mapping)) {
        let val = row[sourceCol] || "";
        // Clean whitespace
        val = typeof val === "string" ? val.trim() : val;
        // Normalize phone: strip non-digits except +
        if (field === "phone") {
          val = val.replace(/[^\d+]/g, "");
          if (!val.startsWith("+") && val.length > 10) val = "+" + val;
        }
        if (val) lead[field] = val;
      }
      return lead;
    }).filter((r) => r.first_name || r.phone);
  };

  const canImport = mapping.first_name && mapping.phone;

  const doImport = async () => {
    setStep("importing");
    setProgress(0);
    const toImport = getMappedRows();
    let imported = 0;

    for (let i = 0; i < toImport.length; i++) {
      const lead = toImport[i];
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...lead, pipeline_stage: "new_lead" }),
        });
        if (res.ok) imported++;
      } catch { /* skip failed rows */ }
      setProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    setImportCount(imported);
    setStep("done");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {["upload", "map", "preview"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              background: step === s ? "var(--indi-500)" : ["upload", "map", "preview"].indexOf(step) > i ? "var(--mint)" : "var(--surface-3)",
              color: step === s || ["upload", "map", "preview"].indexOf(step) > i ? "white" : "var(--ink-mute)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600,
            }}>
              {["upload", "map", "preview"].indexOf(step) > i ? <Check size={12} /> : i + 1}
            </div>
            {i < 2 && (
              <div style={{ width: 48, height: 2, background: ["upload", "map", "preview"].indexOf(step) > i ? "var(--mint)" : "var(--line)", margin: "0 4px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Upload step */}
      {step === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--indi-400)" : "var(--line)"}`,
            borderRadius: "var(--radius-xl)",
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(99,102,241,0.05)" : "transparent",
            transition: "all 0.15s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "var(--radius-xl)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileSpreadsheet size={24} style={{ color: "var(--ink-mute)" }} />
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
            Drop your CSV or Excel file here
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>
            or click to browse · .csv, .xlsx supported
          </div>
        </div>
      )}

      {/* Mapping step */}
      {step === "map" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Map Columns</div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>
                Match your file columns to RevRa fields · <strong style={{ color: "var(--mint)" }}>{rows.length} rows found</strong>
              </div>
            </div>
            <button onClick={() => { setMapping(autoMapColumns(headers)); }} style={{ background: "none", border: "none", color: "var(--indi-400)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
              Auto-detect
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(COLUMN_DEFS).map(([field, def]) => (
              <div key={field} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 130, flexShrink: 0 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)" }}>{def.label}</span>
                  {def.required && <span style={{ color: "var(--rose)", marginLeft: 4 }}>*</span>}
                </div>
                <select
                  value={mapping[field] || ""}
                  onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  style={{
                    flex: 1, height: 36, borderRadius: "var(--radius-md)",
                    padding: "0 10px", backgroundColor: "hsl(var(--surface-container-low))",
                    color: "hsl(var(--on-surface))", border: "1px solid hsl(var(--border))",
                    fontSize: 13, cursor: "pointer",
                  }}
                >
                  <option value="">— Skip this field —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                {mapping[field] ? (
                  <Check size={14} style={{ color: "var(--mint)", flexShrink: 0 }} />
                ) : def.required ? (
                  <AlertCircle size={14} style={{ color: "var(--rose)", flexShrink: 0 }} />
                ) : null}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <Button variant="ghost" onClick={() => setStep("upload")} style={{ flex: 1 }}>
              Back
            </Button>
            <Button onClick={() => setStep("preview")} disabled={!canImport} style={{ flex: 1 }}>
              Preview <ArrowRight size={13} style={{ marginLeft: 6 }} />
            </Button>
          </div>
        </div>
      )}

      {/* Preview step */}
      {step === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
            Preview — first 5 rows
          </div>
          <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--line)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {Object.entries(mapping).filter(([, v]) => v).map(([field]) => (
                    <th key={field} style={{ padding: "8px 12px", background: "var(--surface-2)", color: "var(--ink-mute)", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap" }}>
                      {COLUMN_DEFS[field as keyof typeof COLUMN_DEFS]?.label || field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getMappedRows().slice(0, 5).map((row, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                    {Object.entries(mapping).filter(([, v]) => v).map(([field]) => (
                      <td key={field} style={{ padding: "7px 12px", color: "var(--ink)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {String(row[field] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-mute)", textAlign: "center" }}>
            {getMappedRows().length} leads will be imported
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={() => setStep("map")} style={{ flex: 1 }}>
              Back to Mapping
            </Button>
            <Button onClick={doImport} style={{ flex: 1 }}>
              Import {getMappedRows().length} Leads
            </Button>
          </div>
        </div>
      )}

      {/* Importing step */}
      {step === "importing" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--indi-400)", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 12 }}>
            Importing leads...
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--indi-400)", fontVariantNumeric: "tabular-nums" }}>
            {progress}%
          </div>
          <div style={{ height: 4, borderRadius: 999, background: "var(--line)", marginTop: 16 }}>
            <div style={{ height: "100%", borderRadius: 999, background: "var(--indi-500)", width: `${progress}%`, transition: "width 0.2s" }} />
          </div>
        </div>
      )}

      {/* Done step */}
      {step === "done" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Check size={28} style={{ color: "var(--mint)" }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
            {importCount} lead{importCount !== 1 ? "s" : ""} imported!
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
            Added to your pipeline in the New Leads stage
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "hsl(var(--destructive))", fontSize: 13, padding: "8px 12px", borderRadius: 8, background: "hsl(var(--destructive)/0.1)" }}>
          {error}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

// ── Main AddLeadModal ─────────────────────────────────────────────────────────
export function AddLeadModal({ open, onClose, onSuccess, defaultStage = "new_lead" }: AddLeadModalProps) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [bulkDone, setBulkDone] = useState(false);

  const handleSingleSubmit = async (data: any) => {
    setLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pipeline_stage: defaultStage }),
      });
      if (res.ok) {
        const json = await res.json();
        onSuccess(json.lead);
        handleClose();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to add lead");
      }
    } catch { setFormError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleBulkSuccess = () => {
    setBulkDone(true);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setMode("single");
    setFormError("");
    setBulkDone(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "bulk" ? "Import Bulk Leads" : "Add New Lead"}
      description={
        mode === "bulk"
          ? "Upload a CSV or Excel file with your leads."
          : "Create a new lead in your pipeline."
      }
      size="md"
      footer={
        mode === "single" ? (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button onClick={(e) => { const form = e.currentTarget.closest(".space-y-4"); if (form) handleSingleSubmit(Object.fromEntries(new FormData(form as HTMLFormElement))); }} disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Add Lead
            </Button>
          </>
        ) : bulkDone ? (
          <Button onClick={handleClose}>Done</Button>
        ) : undefined
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Mode selector */}
        {!bulkDone && (
          <div style={{ display: "flex", gap: 8, background: "var(--surface-2)", padding: 4, borderRadius: "var(--radius-lg)" }}>
            {([
              { value: "single", label: "Single Lead", icon: <span style={{ fontSize: 11 }}>＋</span> },
              { value: "bulk", label: "Bulk Import", icon: <Upload size={11} /> },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setMode(opt.value); setFormError(""); }}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "8px 12px", borderRadius: "var(--radius-md)",
                  border: mode === opt.value ? "1px solid var(--line-2)" : "1px solid transparent",
                  background: mode === opt.value ? "var(--surface)" : "transparent",
                  color: mode === opt.value ? "var(--ink)" : "var(--ink-mute)",
                  fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "all 0.12s",
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {mode === "single" ? (
          <SingleLeadForm onSubmit={handleSingleSubmit} loading={loading} />
        ) : (
          <BulkImportModal onClose={handleClose} onSuccess={handleBulkSuccess} />
        )}

        {formError && (
          <div style={{ color: "hsl(var(--destructive))", fontSize: 13, padding: "8px 12px", borderRadius: 8, background: "hsl(var(--destructive)/0.1)" }}>
            {formError}
          </div>
        )}
      </div>
    </Modal>
  );
}