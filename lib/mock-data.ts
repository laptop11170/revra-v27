// Shared mock data — all pages import from here for consistency

// ===== PIPELINE STAGES =====
export const PIPELINE_STAGES = [
  { id: 1, name: "New Lead", slug: "new-lead", color: "bg-blue-100 text-blue-700", order: 1 },
  { id: 2, name: "Attempting Contact", slug: "attempting-contact", color: "bg-blue-100 text-blue-600", order: 2 },
  { id: 3, name: "Contacted", slug: "contacted", color: "bg-cyan-100 text-cyan-700", order: 3 },
  { id: 4, name: "Needs Analysis", slug: "needs-analysis", color: "bg-teal-100 text-teal-700", order: 4 },
  { id: 5, name: "Quote Sent", slug: "quote-sent", color: "bg-yellow-100 text-yellow-700", order: 5 },
  { id: 6, name: "Application Submitted", slug: "application-submitted", color: "bg-orange-100 text-orange-700", order: 6 },
  { id: 7, name: "In Underwriting", slug: "in-underwriting", color: "bg-amber-100 text-amber-700", order: 7 },
  { id: 8, name: "Bound / Policy Active", slug: "bound", color: "bg-green-100 text-green-700", order: 8 },
  { id: 9, name: "Closed Lost", slug: "closed-lost", color: "bg-gray-100 text-gray-600", order: 9 },
  { id: 10, name: "Renewal Due", slug: "renewal-due", color: "bg-amber-100 text-amber-700", order: 10 },
  { id: 11, name: "Lapsed", slug: "lapsed", color: "bg-red-100 text-red-700", order: 11 },
];

export const COVERAGE_TYPES = [
  "Medicare Advantage",
  "ACA (Individual & Family)",
  "Final Expense",
  "Life Insurance",
  "Group Health",
];

export const LEAD_SOURCES = ["Meta Ads", "Manual Entry", "CSV Import", "Referral"];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export const INCOME_RANGES = [
  "Under $25k",
  "$25k–$35k",
  "$35k–$45k",
  "$45k–$60k",
  "$55k–$70k",
  "$60k–$80k",
  "$70k–$90k",
  "$90k–$120k",
  "$120k+",
];

export const CALL_OUTCOMES = [
  "Contacted",
  "No Answer",
  "Voicemail",
  "Not Interested",
  "Wrong Number",
  "Dead Line",
  "Callback Requested",
];

export const LEAD_STATUSES = ["hot", "warm", "cold", "lost"];

// ===== LEADS =====
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email: string;
  dob?: string;
  age?: number;
  state: string;
  county: string;
  coverageType: string;
  currentCarrier?: string;
  monthlyBudget?: string;
  householdSize?: number;
  incomeRange?: string;
  leadSource: string;
  score: number;
  stage: string;
  daysInStage: number;
  lastContact: string;
  assignedAgent: string;
  exclusive: boolean;
  status: string;
  createdAt: string;
}

export const LEADS: Lead[] = [
  { id: "l1", firstName: "Michael", lastName: "Torres", name: "Michael Torres", phonePrimary: "(555) 234-8901", email: "michael.t@email.com", dob: "Mar 15, 1958", age: 68, state: "CA", county: "Los Angeles", coverageType: "Medicare Advantage", currentCarrier: "Aetna", monthlyBudget: "$250/mo", householdSize: 2, incomeRange: "$45k–$60k", leadSource: "Meta Ads", score: 91, stage: "Quote Sent", daysInStage: 5, lastContact: "2 days ago", assignedAgent: "John Smith", exclusive: true, status: "hot", createdAt: "5 days ago" },
  { id: "l2", firstName: "Linda", lastName: "Chen", name: "Linda Chen", phonePrimary: "(555) 345-6789", email: "linda.chen@email.com", dob: "Nov 22, 1975", age: 50, state: "TX", county: "Harris", coverageType: "ACA (Individual & Family)", currentCarrier: "None", monthlyBudget: "$180/mo", householdSize: 4, incomeRange: "$55k–$70k", leadSource: "Referral", score: 85, stage: "Needs Analysis", daysInStage: 3, lastContact: "1 day ago", assignedAgent: "Sarah Lee", exclusive: false, status: "warm", createdAt: "5 days ago" },
  { id: "l3", firstName: "Robert", lastName: "Williams", name: "Robert Williams", phonePrimary: "(555) 456-1234", email: "r.williams@email.com", dob: "Aug 3, 1965", age: 60, state: "FL", county: "Miami-Dade", coverageType: "Final Expense", currentCarrier: "Mutual of Omaha", monthlyBudget: "$75/mo", householdSize: 3, incomeRange: "$35k–$45k", leadSource: "Manual Entry", score: 78, stage: "Contacted", daysInStage: 7, lastContact: "3 days ago", assignedAgent: "Mike Brown", exclusive: false, status: "warm", createdAt: "10 days ago" },
  { id: "l4", firstName: "Patricia", lastName: "Moore", name: "Patricia Moore", phonePrimary: "(555) 111-2233", email: "pat.moore@email.com", dob: "Jan 8, 1956", age: 70, state: "AZ", county: "Maricopa", coverageType: "Medicare Advantage", currentCarrier: "Cigna", monthlyBudget: "$200/mo", householdSize: 1, incomeRange: "$25k–$35k", leadSource: "Meta Ads", score: 72, stage: "New Lead", daysInStage: 1, lastContact: "4 hr ago", assignedAgent: "Emily Davis", exclusive: true, status: "warm", createdAt: "1 day ago" },
  { id: "l5", firstName: "James", lastName: "Wilson", name: "James Wilson", phonePrimary: "(555) 222-3344", email: "jwilson@email.com", dob: "May 19, 1980", age: 45, state: "OH", county: "Franklin", coverageType: "Life Insurance", currentCarrier: "None", monthlyBudget: "$120/mo", householdSize: 5, incomeRange: "$70k–$90k", leadSource: "CSV Import", score: 68, stage: "Attempting Contact", daysInStage: 2, lastContact: "6 hr ago", assignedAgent: "John Smith", exclusive: false, status: "warm", createdAt: "3 days ago" },
  { id: "l6", firstName: "Angela", lastName: "Davis", name: "Angela Davis", phonePrimary: "(555) 567-8901", email: "a.davis@email.com", dob: "Sep 30, 1952", age: 73, state: "NV", county: "Clark", coverageType: "Medicare Advantage", currentCarrier: "Blue Cross", monthlyBudget: "$150/mo", householdSize: 2, incomeRange: "$20k–$25k", leadSource: "Meta Ads", score: 45, stage: "New Lead", daysInStage: 4, lastContact: "2 days ago", assignedAgent: "Unassigned", exclusive: false, status: "cold", createdAt: "5 days ago" },
  { id: "l7", firstName: "Thomas", lastName: "Brown", name: "Thomas Brown", phonePrimary: "(555) 678-9012", email: "t.brown@email.com", dob: "Dec 12, 1985", age: 40, state: "GA", county: "Fulton", coverageType: "ACA (Individual & Family)", currentCarrier: "Kaiser", monthlyBudget: "$200/mo", householdSize: 1, incomeRange: "$50k–$55k", leadSource: "Manual Entry", score: 38, stage: "Closed Lost", daysInStage: 10, lastContact: "1 week ago", assignedAgent: "Mike Brown", exclusive: false, status: "lost", createdAt: "20 days ago" },
  { id: "l8", firstName: "Nancy", lastName: "Garcia", name: "Nancy Garcia", phonePrimary: "(555) 789-0123", email: "nancy.g@email.com", dob: "Jul 4, 1968", age: 57, state: "CA", county: "San Diego", coverageType: "Final Expense", currentCarrier: "None", monthlyBudget: "$90/mo", householdSize: 4, incomeRange: "$40k–$50k", leadSource: "Referral", score: 82, stage: "Application Submitted", daysInStage: 6, lastContact: "Just now", assignedAgent: "Sarah Lee", exclusive: true, status: "hot", createdAt: "12 days ago" },
];

// ===== TEAM MEMBERS =====
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Viewer";
  status: "active" | "idle" | "inactive";
  lastActive: string;
  leads: number;
  workspace?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "t1", name: "Sarah Mitchell", email: "sarah@sdhealth.com", role: "Admin", status: "active", lastActive: "Just now", leads: 0, workspace: "San Diego Health Agents" },
  { id: "t2", name: "John Smith", email: "john@sdhealth.com", role: "Agent", status: "active", lastActive: "Just now", leads: 12 },
  { id: "t3", name: "Sarah Lee", email: "sarah.lee@sdhealth.com", role: "Agent", status: "active", lastActive: "5 min ago", leads: 10 },
  { id: "t4", name: "Mike Brown", email: "mike@sdhealth.com", role: "Agent", status: "active", lastActive: "12 min ago", leads: 8 },
  { id: "t5", name: "Emily Davis", email: "emily@sdhealth.com", role: "Agent", status: "idle", lastActive: "30 min ago", leads: 12 },
];

// ===== WORKSAPCES =====
export interface Workspace {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  plan: "Starter" | "Growth" | "Scale" | "Enterprise";
  users: number;
  leads: number;
  mrr: number;
  status: "active" | "trial" | "suspended" | "past_due";
  joinedDate: string;
}

export const WORKSPACES: Workspace[] = [
  { id: "w1", name: "San Diego Health Agents", owner: "Sarah Mitchell", ownerEmail: "sarah@sdhealth.com", plan: "Scale", users: 8, leads: 342, mrr: 799, status: "active", joinedDate: "Jan 2026" },
  { id: "w2", name: "Texas Insurance Group", owner: "David Chen", ownerEmail: "david@texins.com", plan: "Growth", users: 5, leads: 180, mrr: 450, status: "active", joinedDate: "Feb 2026" },
  { id: "w3", name: "Medicare Direct", owner: "Jennifer Park", ownerEmail: "jen@medicaredirect.com", plan: "Enterprise", users: 24, leads: 1200, mrr: 2400, status: "active", joinedDate: "Nov 2025" },
  { id: "w4", name: "Florida Health Partners", owner: "Robert Lee", ownerEmail: "robert@flhealth.com", plan: "Scale", users: 6, leads: 280, mrr: 799, status: "active", joinedDate: "Dec 2025" },
  { id: "w5", name: "Aetna Partners", owner: "Maria Garcia", ownerEmail: "maria@aetnapartners.com", plan: "Growth", users: 4, leads: 156, mrr: 450, status: "trial", joinedDate: "Apr 2026" },
  { id: "w6", name: "National Benefits Group", owner: "Tom Wilson", ownerEmail: "tom@natbenefits.com", plan: "Starter", users: 2, leads: 45, mrr: 250, status: "active", joinedDate: "Mar 2026" },
  { id: "w7", name: "Pacific Insurance Agency", owner: "Lisa Chang", ownerEmail: "lisa@pacificins.com", plan: "Scale", users: 7, leads: 310, mrr: 799, status: "active", joinedDate: "Jan 2026" },
  { id: "w8", name: "Cascade Health Solutions", owner: "Kevin Martinez", ownerEmail: "kevin@cascadehealth.com", plan: "Growth", users: 5, leads: 198, mrr: 450, status: "past_due", joinedDate: "Feb 2026" },
];

// ===== CALLS =====
export interface Call {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  type: "Outbound" | "Inbound" | "EMMA AI";
  duration: string;
  outcome: string;
  summary: string;
  ai: boolean;
  recording: boolean;
  date: string;
  agentName?: string;
}

export const CALLS: Call[] = [
  { id: "c1", leadId: "l1", leadName: "Michael Torres", leadPhone: "(555) 234-8901", type: "Outbound", duration: "4:32", outcome: "Contacted", summary: "Lead interested in Medicare Advantage plan. Wants follow-up call tomorrow.", ai: true, recording: true, date: "Today, 10:32 AM" },
  { id: "c2", leadId: "l2", leadName: "Linda Chen", leadPhone: "(555) 345-6789", type: "Outbound", duration: "2:15", outcome: "Voicemail", summary: "Left voicemail with callback number.", ai: false, recording: true, date: "Today, 9:48 AM" },
  { id: "c3", leadId: "l3", leadName: "Robert Williams", leadPhone: "(555) 456-1234", type: "Outbound", duration: "6:45", outcome: "Contacted", summary: "Discussed Final Expense policy details. Schedule needs analysis.", ai: true, recording: true, date: "Today, 9:12 AM" },
  { id: "c4", leadId: "l4", leadName: "Patricia Moore", leadPhone: "(555) 111-2233", type: "Outbound", duration: "0:00", outcome: "No Answer", summary: "No answer. Will retry later.", ai: false, recording: false, date: "Today, 8:55 AM" },
  { id: "c5", leadId: "l5", leadName: "James Wilson", leadPhone: "(555) 222-3344", type: "Inbound", duration: "5:20", outcome: "Contacted", summary: "Lead called back regarding quote. Questions answered.", ai: false, recording: true, date: "Yesterday, 4:30 PM" },
  { id: "c6", leadId: "l8", leadName: "Nancy Garcia", leadPhone: "(555) 789-0123", type: "EMMA AI", duration: "3:45", outcome: "Contacted", summary: "EMMA AI: Lead confirmed appointment for Thursday.", ai: true, recording: true, date: "Yesterday, 2:15 PM" },
];

// ===== CONVERSATIONS (SMS) =====
export interface Conversation {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  channel: "sms" | "imessage" | "rcs" | "whatsapp";
  lastMessage: string;
  time: string;
  unread: boolean;
}

export const CONVERSATIONS: Conversation[] = [
  { id: "conv1", leadId: "l1", leadName: "Michael Torres", leadPhone: "(555) 234-8901", channel: "sms", lastMessage: "Thanks for the information! I'll review the quote.", time: "10 min ago", unread: true },
  { id: "conv2", leadId: "l2", leadName: "Linda Chen", leadPhone: "(555) 345-6789", channel: "imessage", lastMessage: "That sounds great, when can we schedule a call?", time: "25 min ago", unread: true },
  { id: "conv3", leadId: "l3", leadName: "Robert Williams", leadPhone: "(555) 456-1234", channel: "sms", lastMessage: "I have a few questions about the policy.", time: "1 hr ago", unread: false },
  { id: "conv4", leadId: "l8", leadName: "Nancy Garcia", leadPhone: "(555) 789-0123", channel: "whatsapp", lastMessage: "Perfect, I'll send the documents now.", time: "2 hr ago", unread: false },
  { id: "conv5", leadId: "l4", leadName: "Patricia Moore", leadPhone: "(555) 111-2233", channel: "rcs", lastMessage: "Can you explain the coverage details?", time: "3 hr ago", unread: false },
  { id: "conv6", leadId: "l5", leadName: "James Wilson", leadPhone: "(555) 222-3344", channel: "sms", lastMessage: "I'll think about it and get back to you.", time: "Yesterday", unread: false },
];

// ===== MESSAGES =====
export interface Message {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

export const MESSAGES: Record<string, Message[]> = {
  conv1: [
    { id: "m1", direction: "inbound", content: "Hi, I received your quote. Can you explain the coverage details?", time: "10:30 AM" },
    { id: "m2", direction: "outbound", content: "Of course! Let me walk you through the main benefits...", time: "10:32 AM", status: "delivered" },
    { id: "m3", direction: "inbound", content: "Thanks for the information! I'll review the quote.", time: "10:35 AM" },
  ],
  conv2: [
    { id: "m4", direction: "inbound", content: "I saw your ad about Medicare Advantage plans. Interested!", time: "Yesterday 3:00 PM" },
    { id: "m5", direction: "outbound", content: "Great! I'd love to help you find the right plan. Do you have 15 minutes for a quick call?", time: "Yesterday 3:05 PM", status: "delivered" },
    { id: "m6", direction: "inbound", content: "That sounds great, when can we schedule a call?", time: "Yesterday 3:30 PM" },
  ],
};

// ===== APPOINTMENTS =====
export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: "Phone" | "Video" | "In-Person";
  status: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
  agentName: string;
  meetingLink?: string;
}

export const APPOINTMENTS: Appointment[] = [
  { id: "a1", leadId: "l1", leadName: "Michael Torres", title: "Medicare Quote Review", date: "Today", time: "10:00 AM", duration: 30, type: "Phone", status: "confirmed", agentName: "John Smith" },
  { id: "a2", leadId: "l2", leadName: "Linda Chen", title: "ACA Needs Analysis", date: "Today", time: "2:00 PM", duration: 45, type: "Video", status: "confirmed", agentName: "John Smith", meetingLink: "https://meet.google.com/abc-defg-hij" },
  { id: "a3", leadId: "l3", leadName: "Robert Williams", title: "Final Expense Follow-up", date: "Tomorrow", time: "9:00 AM", duration: 30, type: "Phone", status: "pending", agentName: "Mike Brown" },
  { id: "a4", leadId: "l4", leadName: "Patricia Moore", title: "Medicare Info Session", date: "Tomorrow", time: "11:00 AM", duration: 60, type: "Video", status: "confirmed", agentName: "Emily Davis", meetingLink: "https://meet.google.com/xyz-uvwx-rst" },
];

// ===== CHANNELS & TEAM CHAT =====
export interface Channel {
  id: string;
  name: string;
  members: number;
  unread: number;
  lastMessage: string;
}

export const CHANNELS: Channel[] = [
  { id: "ch1", name: "general", members: 8, unread: 3, lastMessage: "Sarah Lee: Check out the new Medicare rates" },
  { id: "ch2", name: "medicare-tips", members: 6, unread: 0, lastMessage: "John Smith: Great call script everyone!" },
  { id: "ch3", name: "health-team", members: 4, unread: 1, lastMessage: "Mike Brown: Meeting at 3pm today" },
  { id: "ch4", name: "announcements", members: 8, unread: 2, lastMessage: "Admin: New leads imported from Meta" },
];

export interface ChatMessage {
  id: string;
  author: string;
  content: string;
  time: string;
}

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  general: [
    { id: "msg1", author: "John Smith", content: "Hey team, anyone have experience with Medicare Advantage leads?", time: "9:00 AM" },
    { id: "msg2", author: "Sarah Lee", content: "Yes! I've been doing Medicare calls all week. Happy to share what works.", time: "9:05 AM" },
    { id: "msg3", author: "Mike Brown", content: "Can you post the call script you use?", time: "9:10 AM" },
    { id: "msg4", author: "Sarah Lee", content: "Sure thing! I'll share it in #medicare-tips", time: "9:12 AM" },
    { id: "msg5", author: "Sarah Mitchell", content: "Great initiative team! We just imported 20 new Medicare leads from Meta.", time: "9:30 AM" },
    { id: "msg6", author: "Emily Davis", content: "Awesome! I'll start calling them right away.", time: "9:35 AM" },
  ],
};

// ===== TASKS =====
export interface Task {
  id: string;
  leadId: string;
  leadName: string;
  type: "Follow-up" | "Callback" | "Send Info" | "Reactivation" | "Custom";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  status: "open" | "completed" | "overdue";
  source: "call" | "email" | "manual";
  note?: string;
}

export const TASKS: Task[] = [
  { id: "t1", leadId: "l1", leadName: "Michael Torres", type: "Callback", priority: "high", dueDate: "Today", status: "open", source: "call", note: "Call back tomorrow to discuss deductible" },
  { id: "t2", leadId: "l3", leadName: "Robert Williams", type: "Send Info", priority: "medium", dueDate: "Today", status: "open", source: "email", note: "Send Final Expense policy details" },
  { id: "t3", leadId: "l4", leadName: "Patricia Moore", type: "Follow-up", priority: "high", dueDate: "Tomorrow", status: "open", source: "manual" },
  { id: "t4", leadId: "l8", leadName: "Nancy Garcia", type: "Follow-up", priority: "urgent", dueDate: "Today", status: "overdue", source: "call", note: "Confirm appointment for Thursday" },
];

// ===== CAMPAIGNS (EMMA AI) =====
export interface Campaign {
  id: string;
  name: string;
  target: string;
  stages: string[];
  agents: number;
  queueSize: number;
  completed: number;
  failed: number;
  status: "active" | "paused";
}

export const CAMPAIGNS: Campaign[] = [
  { id: "camp1", name: "Medicare Follow-Up", target: "Medicare Advantage", stages: ["Quote Sent", "Needs Analysis"], agents: 3, queueSize: 24, completed: 18, failed: 2, status: "active" },
  { id: "camp2", name: "ACA Re-engagement", target: "ACA (Individual & Family)", stages: ["Contacted"], agents: 2, queueSize: 15, completed: 8, failed: 1, status: "active" },
  { id: "camp3", name: "Final Expense Intro", target: "Final Expense", stages: ["New Lead"], agents: 1, queueSize: 8, completed: 0, failed: 0, status: "paused" },
];

// ===== ACTIVITY LOG =====
export interface Activity {
  id: string;
  action: string;
  time: string;
  result?: string;
  leadName?: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "act1", action: "Called Michael Torres", time: "10 min ago", result: "Left voicemail", leadName: "Michael Torres" },
  { id: "act2", action: "Sent SMS to Linda Chen", time: "25 min ago", result: "Delivered", leadName: "Linda Chen" },
  { id: "act3", action: "Moved Robert Williams to Quote Sent", time: "1 hr ago", result: "Stage changed", leadName: "Robert Williams" },
  { id: "act4", action: "Called Patricia Moore", time: "2 hr ago", result: "No answer", leadName: "Patricia Moore" },
];

// ===== SYSTEM HEALTH =====
export interface Service {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: string;
  latency: string;
  region: string;
}

export const SERVICES: Service[] = [
  { id: "s1", name: "API Server", status: "healthy", uptime: "99.97%", latency: "42ms", region: "us-east-1" },
  { id: "s2", name: "Database Primary", status: "healthy", uptime: "99.99%", latency: "8ms", region: "us-east-1" },
  { id: "s3", name: "Database Replica", status: "healthy", uptime: "99.98%", latency: "12ms", region: "us-west-2" },
  { id: "s4", name: "AI Gateway", status: "healthy", uptime: "99.95%", latency: "180ms", region: "us-east-1" },
  { id: "s5", name: "Twilio", status: "healthy", uptime: "100%", latency: "95ms", region: "global" },
  { id: "s6", name: "EMMA AI", status: "healthy", uptime: "99.90%", latency: "210ms", region: "us-east-1" },
  { id: "s7", name: "Stripe", status: "healthy", uptime: "99.99%", latency: "55ms", region: "global" },
  { id: "s8", name: "Meta Webhooks", status: "degraded", uptime: "98.5%", latency: "450ms", region: "global" },
  { id: "s9", name: "S3 Storage", status: "healthy", uptime: "100%", latency: "25ms", region: "us-east-1" },
  { id: "s10", name: "Email Service", status: "healthy", uptime: "99.97%", latency: "120ms", region: "us-east-1" },
];

// ===== INTEGRATIONS =====
export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  workspaces?: number;
}

export const INTEGRATIONS: Integration[] = [
  { id: "int1", name: "Twilio", category: "SMS & Voice", description: "Programmable SMS and outbound/inbound calling", connected: true, workspaces: 24 },
  { id: "int2", name: "Meta Ads", category: "Lead Ads", description: "Facebook and Instagram lead ad integration", connected: true, workspaces: 18 },
  { id: "int3", name: "Stripe", category: "Billing", description: "Subscription billing and payments", connected: true, workspaces: 24 },
  { id: "int4", name: "Google Calendar", category: "Calendar", description: "Bi-directional calendar sync", connected: true, workspaces: 20 },
  { id: "int5", name: "Supabase", category: "Database", description: "PostgreSQL database and realtime", connected: true, workspaces: 24 },
  { id: "int6", name: "Slack", category: "Notifications", description: "Team notifications and alerts", connected: false, workspaces: 0 },
  { id: "int7", name: "SendGrid", category: "Email", description: "Transactional email delivery", connected: true, workspaces: 24 },
  { id: "int8", name: "Intercom", category: "Support", description: "Customer support chat", connected: false, workspaces: 0 },
];

// ===== PLANS =====
export const PLANS = [
  {
    name: "Starter",
    price: 250,
    billing: "monthly",
    leadsPerWeek: 10,
    features: ["10 leads/week", "Basic pipeline", "SMS & calls", "1 agent", "Email support"],
  },
  {
    name: "Growth",
    price: 450,
    billing: "monthly",
    leadsPerWeek: 20,
    features: ["20 leads/week", "Full pipeline", "SMS, calls, Emma AI", "Up to 5 agents", "Priority support"],
  },
  {
    name: "Scale",
    price: 799,
    billing: "monthly",
    leadsPerWeek: 40,
    features: ["40 leads/week", "Full pipeline + workflows", "SMS, calls, Emma AI", "Up to 20 agents", "Dedicated support"],
  },
  {
    name: "Enterprise",
    price: null,
    billing: "custom",
    leadsPerWeek: null,
    features: ["Unlimited leads", "Custom integrations", "SOC 2 compliance", "Unlimited agents", "White-glove onboarding"],
  },
];