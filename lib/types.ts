// ============================================================
// RevRa CRM — TypeScript Types (generated from schema)
// ============================================================

// ─── Enums ───────────────────────────────────────────────────────────────────
export type WorkspacePlan = "starter" | "professional" | "enterprise";
export type UserRole = "superadmin" | "admin" | "agent";
export type MessageChannel = "sms" | "imessage" | "whatsapp" | "rcs" | "email";
export type MessageDirection = "inbound" | "outbound";
export type CallDirection = "inbound" | "outbound";
export type CallStatus = "initiated" | "ringing" | "in_progress" | "completed" | "busy" | "no_answer" | "failed";
export type TaskType = "call" | "email" | "sms" | "follow_up" | "schedule" | "custom";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "completed" | "skipped";
export type AIMode = "agent" | "chat";
export type AIRole = "user" | "assistant" | "system" | "tool";
export type CalendarEventStatus = "confirmed" | "cancelled";
export type IntegrationProvider = "twilio" | "loopmessages" | "sendgrid" | "google";
export type IntegrationStatus = "active" | "error" | "disconnected";
export type LeadType = "medicare" | "aca" | "final_expense" | "life" | "other";
export type AIDisposition = "interested" | "not_interested" | "callback" | "not_reachable";

// ─── Tables ───────────────────────────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  twilio_account_sid: string | null;
  loopmessages_api_key: string | null;
  sendgrid_api_key: string | null;
  google_calendar_creds: Json;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clerk_user_id: string;
  workspace_id: string | null;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  last_active_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  assigned_agent_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  phone_formatted: string | null;
  lead_type: LeadType | null;
  score: number;
  score_breakdown: Json | null;
  pipeline_stage: string;
  previous_stages: string[];
  last_contacted_at: string | null;
  last_call_at: string | null;
  last_message_at: string | null;
  source: string | null;
  notes: string | null;
  tags: string[];
  enrichment_data: Json | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  position: number;
  color: string | null;
  created_at: string;
}

export interface PipelineMove {
  id: string;
  lead_id: string;
  from_stage: string | null;
  to_stage: string;
  moved_by: string | null;
  moved_at: string;
  note: string | null;
}

export interface Call {
  id: string;
  workspace_id: string;
  lead_id: string;
  agent_id: string;
  twilio_call_sid: string | null;
  twilio_recording_sid: string | null;
  direction: CallDirection | null;
  status: CallStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcription: string | null;
  ai_summary: string | null;
  ai_disposition: AIDisposition | null;
  ai_next_steps: string | null;
  recording_url: string | null;
  recording_duration: number | null;
  created_at: string;
}

export interface Message {
  id: string;
  workspace_id: string;
  lead_id: string;
  agent_id: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  body: string;
  media_url: string | null;
  external_id: string | null;
  external_status: string | null;
  ai_generated: boolean;
  ai_context: Json | null;
  sent_at: string | null;
  created_at: string;
}

export interface AIConversation {
  id: string;
  workspace_id: string;
  agent_id: string;
  lead_id: string | null;
  mode: AIMode;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: AIRole;
  content: string | null;
  tool_calls: Json | null;
  tool_results: Json | null;
  tokens_used: number | null;
  latency_ms: number | null;
  created_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  lead_id: string | null;
  assigned_agent_id: string;
  created_by: string | null;
  type: TaskType;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  source: string;
  recurring: Json | null;
  completed_at: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  workspace_id: string;
  lead_id: string | null;
  agent_id: string;
  google_event_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  attendees: Json | null;
  google_meet_link: string | null;
  status: CalendarEventStatus;
  reminder_sent: boolean;
  created_at: string;
}

export interface Integration {
  id: string;
  workspace_id: string | null;
  provider: IntegrationProvider;
  credentials: Json;
  settings: Json;
  status: IntegrationStatus;
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  workspace_id: string | null;
  provider: string;
  event_type: string;
  payload: Json;
  processed: boolean;
  processed_at: string | null;
  error: string | null;
  created_at: string;
}

// ─── JSON Type ────────────────────────────────────────────────────────────────
type Json = Record<string, unknown>;

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface LeadWithRelations extends Lead {
  assigned_agent?: User;
}

export interface CallWithRelations extends Call {
  lead?: Lead;
  agent?: User;
}

export interface MessageWithRelations extends Message {
  lead?: Lead;
  agent?: User;
}

// ─── LLM Tool Types ──────────────────────────────────────────────────────────
export interface LLMToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
}