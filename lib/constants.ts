// Shared constants for RevRa — used across all components and pages

export const APP_NAME = "RevRa";
export const APP_TAGLINE = "AI-Powered Insurance CRM";

// Pipeline stages (11-stage insurance pipeline)
export const PIPELINE_STAGES_ORDER = [
  "New Lead",
  "Attempting Contact",
  "Contacted",
  "Needs Analysis",
  "Quote Sent",
  "Application Submitted",
  "In Underwriting",
  "Bound / Policy Active",
  "Closed Lost",
  "Renewal Due",
  "Lapsed",
] as const;

// Lead score tiers
export const LEAD_SCORE_TIERS = {
  HOT: { min: 80, max: 100, label: "Hot", color: "text-green-600" },
  WARM: { min: 50, max: 79, label: "Warm", color: "text-yellow-600" },
  COLD: { min: 0, max: 49, label: "Cold", color: "text-red-600" },
} as const;

// Coverage types
export const COVERAGE_TYPES = [
  { value: "medicare-advantage", label: "Medicare Advantage" },
  { value: "aca", label: "ACA (Individual & Family)" },
  { value: "final-expense", label: "Final Expense" },
  { value: "life-insurance", label: "Life Insurance" },
  { value: "group-health", label: "Group Health" },
] as const;

// US States
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

// Lead sources
export const LEAD_SOURCES = [
  { value: "meta-ads", label: "Meta Ads (Facebook/Instagram)" },
  { value: "manual", label: "Manual Entry" },
  { value: "csv-import", label: "CSV Import" },
  { value: "referral", label: "Referral" },
] as const;

// Call outcomes
export const CALL_OUTCOMES = [
  { value: "contacted", label: "Contacted" },
  { value: "no-answer", label: "No Answer" },
  { value: "voicemail", label: "Voicemail" },
  { value: "not-interested", label: "Not Interested" },
  { value: "wrong-number", label: "Wrong Number" },
  { value: "dead-line", label: "Dead Line" },
  { value: "callback-requested", label: "Callback Requested" },
] as const;

// Appointment types
export const APPOINTMENT_TYPES = ["Phone", "Video", "In-Person"] as const;
export const APPOINTMENT_DURATIONS = [15, 30, 45, 60] as const;

// Task types and priorities
export const TASK_TYPES = ["Follow-up", "Callback", "Send Info", "Reactivation", "Custom"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const TASK_STATUSES = ["open", "completed", "overdue"] as const;

// User roles
export const USER_ROLES = ["Viewer", "Agent", "Admin"] as const;
export const SUPERADMIN_ROLES = ["Super Admin", "Admin", "Agent", "Viewer"] as const;

// Channel types
export const CHANNEL_TYPES = ["sms", "imessage", "rcs", "whatsapp"] as const;

// Workspace plans
export const PLANS = ["Starter", "Growth", "Scale", "Enterprise"] as const;

// Status colors map
export const STATUS_COLORS: Record<string, string> = {
  healthy: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
  active: "bg-green-500",
  trial: "bg-blue-500",
  suspended: "bg-gray-400",
  past_due: "bg-red-500",
  idle: "bg-gray-400",
  inactive: "bg-gray-300",
};

// Helper: get score color
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

// Helper: get stage color class
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    "New Lead": "bg-blue-100 text-blue-700",
    "Attempting Contact": "bg-blue-100 text-blue-600",
    "Contacted": "bg-cyan-100 text-cyan-700",
    "Needs Analysis": "bg-teal-100 text-teal-700",
    "Quote Sent": "bg-yellow-100 text-yellow-700",
    "Application Submitted": "bg-orange-100 text-orange-700",
    "In Underwriting": "bg-amber-100 text-amber-700",
    "Bound / Policy Active": "bg-green-100 text-green-700",
    "Closed Lost": "bg-gray-100 text-gray-600",
    "Renewal Due": "bg-amber-100 text-amber-700",
    "Lapsed": "bg-red-100 text-red-700",
  };
  return colors[stage] || "bg-gray-100 text-gray-700";
}

// Helper: get outcome color
export function getOutcomeColor(outcome: string): string {
  const colors: Record<string, string> = {
    Contacted: "bg-green-100 text-green-700",
    Voicemail: "bg-yellow-100 text-yellow-700",
    "No Answer": "bg-red-100 text-red-700",
    "Not Interested": "bg-gray-100 text-gray-600",
    "Wrong Number": "bg-red-100 text-red-700",
    "Dead Line": "bg-red-100 text-red-700",
    "Callback Requested": "bg-blue-100 text-blue-700",
  };
  return colors[outcome] || "bg-gray-100 text-gray-700";
}

// Helper: get channel color
export function getChannelColor(channel: string): string {
  const colors: Record<string, string> = {
    sms: "bg-blue-100 text-blue-700",
    imessage: "bg-gray-100 text-gray-700",
    rcs: "bg-green-100 text-green-700",
    whatsapp: "bg-green-600 text-white",
  };
  return colors[channel] || "bg-gray-100 text-gray-700";
}

// Helper: format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

// Helper: format phone
export function formatPhone(phone: string): string {
  return phone; // already formatted
}

// Helper: get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}