"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { LEAD_SOURCES, COVERAGE_TYPES } from "@/lib/mock-data";

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport?: (data: { leads: any[] }) => void;
}

interface ParsedRow { [key: string]: string }

const SAMPLE_HEADERS = ["firstName", "lastName", "phonePrimary", "email", "coverageType", "leadSource", "state"];

const MAPPING_OPTIONS = [
  "Skip", "firstName", "lastName", "phonePrimary", "phoneSecondary", "email",
  "dob", "state", "county", "coverageType", "currentCarrier", "monthlyBudget",
  "householdSize", "incomeRange", "leadSource",
];

export function CSVImportModal({ open, onClose, onImport }: CSVImportModalProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        setError("CSV must have at least a header row and one data row.");
        return;
      }
      const hdrs = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const data = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const obj: ParsedRow = {};
        hdrs.forEach((h, i) => { obj[h] = vals[i] || ""; });
        return obj;
      });
      setHeaders(hdrs);
      const initial: Record<string, string> = {};
      hdrs.forEach((h) => {
        const lower = h.toLowerCase().replace(/[^a-z]/g, "");
        if (lower.includes("first") && lower.includes("name")) initial[h] = "firstName";
        else if (lower.includes("last") && lower.includes("name")) initial[h] = "lastName";
        else if (lower.includes("phone") && lower.includes("primary")) initial[h] = "phonePrimary";
        else if (lower.includes("phone") && lower.includes("secondary")) initial[h] = "phoneSecondary";
        else if (lower.includes("email")) initial[h] = "email";
        else if (lower.includes("coverage") || lower.includes("type")) initial[h] = "coverageType";
        else if (lower.includes("source")) initial[h] = "leadSource";
        else if (lower.includes("state") || lower.includes("st")) initial[h] = "state";
        else initial[h] = "Skip";
      });
      setMapping(initial);
      setRows(data);
      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (col: string, field: string) => {
    setMapping((p) => ({ ...p, [col]: field }));
  };

  const handlePreview = () => {
    if (!Object.values(mapping).some((v) => v !== "Skip")) {
      setError("Please map at least one field to continue.");
      return;
    }
    setStep("preview");
  };

  const getMappedRow = (row: ParsedRow) => {
    const result: Record<string, string> = {};
    headers.forEach((col) => {
      const field = mapping[col];
      if (field && field !== "Skip") result[field] = row[col] || "";
    });
    return result;
  };

  const getSampleValue = (field: string) => {
    for (let i = 0; i < Math.min(rows.length, 3); i++) {
      const row = getMappedRow(rows[i]);
      if (row[field]) return row[field];
    }
    return "-";
  };

  const handleImport = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const leads = rows.map((r) => getMappedRow(r)).filter((l) => l.firstName || l.lastName || l.phonePrimary);
    onImport?.({ leads });
    setLoading(false);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep("upload");
    setFileName("");
    setRows([]);
    setHeaders([]);
    setMapping({});
    setError("");
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={handleReset} title="Import Leads from CSV" size="lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-6 pt-4 pb-2">
        {["upload", "mapping", "preview"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? "bg-blue-500 text-white" :
              ["upload", "mapping", "preview"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {["upload", "mapping", "preview"].indexOf(step) > i ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            {i < 2 && <div className={`w-12 h-0.5 ${["upload", "mapping", "preview"].indexOf(step) > i ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>
      <div className="px-6 pb-2 flex gap-4">
        <span className={`text-xs ${step === "upload" ? "text-blue-600 font-medium" : "text-gray-400"}`}>Upload</span>
        <span className={`text-xs ${step === "mapping" ? "text-blue-600 font-medium" : "text-gray-400"}`}>Map Columns</span>
        <span className={`text-xs ${step === "preview" ? "text-blue-600 font-medium" : "text-gray-400"}`}>Preview</span>
      </div>

      {step === "upload" && (
        <div className="px-6 pb-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="font-medium text-gray-900">Click to upload CSV</p>
            <p className="text-xs text-gray-400 mt-1">or drag and drop your file here</p>
            <p className="text-xs text-gray-300 mt-2">Supported: .csv files up to 5MB</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Expected CSV columns:</p>
            <div className="flex flex-wrap gap-1">
              {SAMPLE_HEADERS.map((h) => (
                <span key={h} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">{h}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "mapping" && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              Map your CSV columns to RevRa fields &mdash; <span className="font-medium text-gray-700">{fileName}</span>
            </p>
            <p className="text-xs text-gray-400">{rows.length} rows found</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {headers.map((col) => (
              <div key={col} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{col}</p>
                  <p className="text-xs text-gray-400 truncate">
                    Sample: {rows[0]?.[col] || "(empty)"}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-gray-400">→</span>
                  <select
                    value={mapping[col] || "Skip"}
                    onChange={(e) => handleMappingChange(col, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MAPPING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleReset}><ArrowLeft size={14} className="mr-1" />Back</Button>
            <Button onClick={handlePreview}>Preview <ArrowRight size={14} className="ml-1" /></Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-500 mb-3">
            Preview of {rows.length} leads to import
          </p>
          <div className="overflow-x-auto max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  {["firstName", "lastName", "phonePrimary", "email", "coverageType", "leadSource", "state"]
                    .filter((f) => Object.values(mapping).includes(f))
                    .map((f) => <TableHead key={f}>{f}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 10).map((row, i) => {
                  const mapped = getMappedRow(row);
                  return (
                    <TableRow key={i}>
                      {["firstName", "lastName", "phonePrimary", "email", "coverageType", "leadSource", "state"]
                        .filter((f) => Object.values(mapping).includes(f))
                        .map((f) => <TableCell key={f} className="text-sm">{mapped[f] || "-"}</TableCell>)}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {rows.length > 10 && <p className="text-xs text-gray-400 mt-2">...and {rows.length - 10} more rows</p>}
        </div>
      )}

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
        {step === "preview" ? (
          <>
            <Button variant="outline" onClick={() => setStep("mapping")}><ArrowLeft size={14} className="mr-1" />Back</Button>
            <Button onClick={handleImport} loading={loading}>
              <FileText size={16} className="mr-2" />Import {rows.length} Leads
            </Button>
          </>
        ) : step === "mapping" ? null : (
          <Button variant="outline" onClick={handleReset}>Cancel</Button>
        )}
      </div>
    </Modal>
  );
}