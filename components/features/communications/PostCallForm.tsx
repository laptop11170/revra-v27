"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CALL_OUTCOMES } from "@/lib/mock-data";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import { PhoneCall, PhoneMissed, Voicemail, MessageSquare, Star, ThumbsDown, Clock, PhoneIncoming } from "lucide-react";

interface PostCallFormProps {
  open: boolean;
  onClose: () => void;
  leadName: string;
  leadPhone: string;
  duration: string;
  onSave?: (data: PostCallData) => void;
}

export interface PostCallData {
  outcome: string;
  nextStep: string;
  notes: string;
  stageChange: string;
  scheduleCallback: boolean;
  callbackDate?: string;
  callbackTime?: string;
}

const OUTCOME_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; nextAction: string }> = {
  "Contacted": {
    icon: <PhoneCall size={16} />,
    color: "text-green-600",
    bg: "bg-green-100",
    nextAction: "Schedule next call",
  },
  "No Answer": {
    icon: <PhoneMissed size={16} />,
    color: "text-red-600",
    bg: "bg-red-100",
    nextAction: "Retry later",
  },
  "Voicemail": {
    icon: <Voicemail size={16} />,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    nextAction: "Leave callback number",
  },
  "Not Interested": {
    icon: <ThumbsDown size={16} />,
    color: "text-gray-600",
    bg: "bg-gray-100",
    nextAction: "Close or reactivate later",
  },
  "Wrong Number": {
    icon: <ThumbsDown size={16} />,
    color: "text-red-600",
    bg: "bg-red-100",
    nextAction: "Mark as bad data",
  },
  "Dead Line": {
    icon: <PhoneMissed size={16} />,
    color: "text-red-600",
    bg: "bg-red-100",
    nextAction: "Close lead",
  },
  "Callback Requested": {
    icon: <Clock size={16} />,
    color: "text-blue-600",
    bg: "bg-blue-100",
    nextAction: "Schedule callback",
  },
};

// Stages a lead can move to from current position
const AVAILABLE_STAGES = ["New Lead", "Attempting Contact", "Contacted", "Needs Analysis", "Quote Sent", "Application Submitted", "Bound / Policy Active"];

export function PostCallForm({ open, onClose, leadName, leadPhone, duration, onSave }: PostCallFormProps) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [stageChange, setStageChange] = useState("");
  const [scheduleCallback, setScheduleCallback] = useState(false);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [step, setStep] = useState<"outcome" | "stage" | "summary">("outcome");

  const handleSave = () => {
    onSave?.({
      outcome,
      nextStep: outcome ? OUTCOME_CONFIG[outcome]?.nextAction : "",
      notes,
      stageChange,
      scheduleCallback,
      callbackDate: scheduleCallback ? callbackDate : undefined,
      callbackTime: scheduleCallback ? callbackTime : undefined,
    });
    // Reset
    setOutcome("");
    setNotes("");
    setStageChange("");
    setScheduleCallback(false);
    setCallbackDate("");
    setCallbackTime("");
    setStep("outcome");
    onClose();
  };

  const selectedOutcome = OUTCOME_CONFIG[outcome];

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Log Call Outcome">
      <div className="p-6">
        {/* Call summary bar */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <PhoneIncoming size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{leadName}</p>
            <p className="text-xs text-gray-500">{leadPhone}</p>
          </div>
          <div className="text-right">
            <Badge variant="info">{duration}</Badge>
            <p className="text-xs text-gray-400 mt-0.5">Call duration</p>
          </div>
        </div>

        {step === "outcome" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">What happened on this call?</label>
              <div className="grid grid-cols-2 gap-2">
                {CALL_OUTCOMES.map((oc) => {
                  const cfg = OUTCOME_CONFIG[oc];
                  return (
                    <button
                      key={oc}
                      onClick={() => setOutcome(oc)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        outcome === oc
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{oc}</p>
                        <p className="text-xs text-gray-400">{cfg.nextAction}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Call Notes / Summary</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief summary of what was discussed..."
                className="h-20"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep("stage")} disabled={!outcome}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === "stage" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Update lead stage?</label>
              <div className="space-y-2">
                {AVAILABLE_STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setStageChange(stage)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      stageChange === stage
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      stage === "Bound / Policy Active" ? "bg-green-500" :
                      stage === "New Lead" ? "bg-blue-500" :
                      "bg-gray-300"
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{stage}</span>
                    {stageChange === stage && (
                      <span className="ml-auto text-xs text-blue-600 font-medium">Selected</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStageChange("")}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600"
              >
                No stage change
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                id="scheduleCallback"
                checked={scheduleCallback}
                onChange={(e) => setScheduleCallback(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="scheduleCallback" className="text-sm text-gray-700">
                Schedule callback appointment
              </label>
            </div>

            {scheduleCallback && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={callbackDate}
                    onChange={(e) => setCallbackDate(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("outcome")}>
                ← Back
              </Button>
              <Button onClick={() => setStep("summary")}>
                Review Summary →
              </Button>
            </div>
          </div>
        )}

        {step === "summary" && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Outcome</span>
                <span className="text-sm font-semibold text-gray-900">{outcome}</span>
              </div>
              {notes && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Notes</span>
                  <span className="text-sm font-medium text-gray-700 max-w-[60%] text-right truncate">{notes}</span>
                </div>
              )}
              {stageChange && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Stage update</span>
                  <Badge variant="info">{stageChange}</Badge>
                </div>
              )}
              {scheduleCallback && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Callback</span>
                  <Badge variant="success">{callbackDate} at {callbackTime}</Badge>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("stage")}>
                ← Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save & Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}