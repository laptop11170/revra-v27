# RevRa Platform — Full Architecture Mindmap

> Last updated: 2026-05-14
> Single source of truth for platform architecture

---

## Legend

```
[ LAYER ]  ← Top-level architecture layer
  ├── [ Node ]  ← Major component or service
  │     ├── [ sub-node ]  ← Sub-component
  │     │     ├── item
  │     │     └── item
  │     └── [ sub-node ]
  └── [ Node ]

[ ✅ = Built ]  [ 🔜 = Not Yet Built ]  [ ⏳ = On Hold / Pending ]
```

---

## 1. PRESENTATION LAYER (`app/`)

### 1A. User Dashboard — `/user/*`

```
[ USER DASHBOARD ]  app/user/page.tsx
│
├── 📊 Analytics              app/user/analytics/page.tsx
│     ├── Performance metrics
│     ├── Lead conversion funnel
│     └── Campaign ROI
│
├── 🤖 AI                    app/user/ai/page.tsx
│     ├── RevRa AI Chat interface
│     ├── Campaign builder modal
│     └── ✅ AI draft generation  (mocked — awaiting Emma endpoint)
│
├── 📅 Calendar              app/user/calendar/page.tsx
│     ├── Google Calendar sync (via Emma OAuth)
│     └── Appointment booking
│
├── 📢 Campaigns             app/user/campaigns/page.tsx
│     ├── 5-step wizard (Setup → Compose → Select Leads → Keywords → Review & Launch)
│     ├── Campaign list + status
│     └── Bulk SMS via Sendillo ✅
│
├── 📞 Calls                 app/user/calls/page.tsx
│     ├── Call log (inbound + outbound)
│     ├── Active calls        app/user/calls/active/page.tsx
│     └── AI transcription + disposition (via Emma/Twilio)
│
├── 💬 Conversations          app/user/conversations/page.tsx
│     ├── Multi-channel inbox (SMS, WhatsApp, iMessage, etc.)
│     ├── Unread count badges
│     └── Lead profile slide-over
│
├── 🔗 Integrations          app/user/integrations/page.tsx
│     ├── Per-workspace integration config
│     ├── Connect platforms (Sendillo, Emma messaging channels)
│     └── Status monitoring
│
├── 👥 Leads                 app/user/leads/page.tsx
│     ├── Lead list (searchable, sortable)
│     ├── Add lead modal
│     ├── Bulk SMS modal → campaign creation + send ✅
│     ├── Lead profile modal/panel
│     ├── CSV import wizard
│     └── Pipeline stage tracking
│
├── 📋 Pipeline (Kanban)     app/user/pipeline/page.tsx
│     ├── Kanban board (drag-and-drop)
│     ├── Custom stage columns
│     └── Lead card → profile slide-over
│
├── ⚙️ Settings              app/user/settings/page.tsx
│     ├── Profile
│     └── Preferences
│
├── 👔 Team                  app/user/team/page.tsx
│     ├── Member list
│     └── Invite member modal
│
├── ✅ Tasks                 app/user/tasks/page.tsx
│     ├── Task list (by agent, by lead)
│     └── Recurring tasks
│
├── 💬 Texts                 app/user/texts/page.tsx
│     └── SMS compose + send
│
├── 📝 Automations           app/user/automations/page.tsx
│     └── Workflow canvas (visual builder)
│
└── 📋 Briefing             app/user/briefing/page.tsx
      └── Daily/weekly agent briefing
```

### 1B. Admin Dashboard — `/admin/*`

```
[ ADMIN DASHBOARD ]  app/admin/page.tsx
│
├── 👥 Lead Pool             app/admin/lead-pool/page.tsx
│     ├── Admin's own lead pool (RevRa Platform pool — future)
│     ├── Lead tier management (Premium/Normal/Aged)
│     ├── Bulk upload CSV
│     ├── Lead pricing config (future)
│     └── 🔜 Stripe Connect payout setup
│
├── 📊 Performance           app/admin/performance/page.tsx
│     ├── Agent leaderboard
│     └── Workspace KPIs
│
├── 🔁 Subscriptions         app/admin/subscriptions/page.tsx
│     ├── Agent subscription plans (future)
│     ├── Prepaid credits tracking
│     └── 🔜 Stripe billing
│
├── 👥 Team                  app/admin/team/page.tsx
│     ├── Agent management
│     └── Invite + role assignment
│
├── ⚡ Workflows             app/admin/workflows/page.tsx
│     ├── Workflow builder canvas
│     └── Active/paused workflows
│
├── 🔗 Integrations          app/admin/integrations/page.tsx
│     └── Per-workspace integration settings
│
└── ⚙️ Settings              app/admin/settings/page.tsx
      ├── Workspace profile
      └── API key management
```

### 1C. Superadmin Dashboard — `/superadmin/*`

```
[ SUPERADMIN DASHBOARD ]  app/superadmin/page.tsx
│
├── 👥 Users                 app/superadmin/users/page.tsx
│     ├── Cross-workspace user list
│     └── User detail panel + role management
│
├── 🏢 Workspaces            app/superadmin/workspaces/page.tsx
│     ├── Workspace list
│     └── Workspace detail panel + plan management
│
├── 📞 Providers             app/superadmin/providers/page.tsx
│     ├── SMS/messaging provider management
│     └── Provider status + usage stats
│
├── 📊 Performance          app/superadmin/performance/page.tsx
│     └── Platform-wide analytics
│
├── 🔁 Subscriptions         app/superadmin/subscriptions/page.tsx
│     └── RevRa platform subscription plans
│
├── ❤️ Health               app/superadmin/health/page.tsx
│     └── System health + uptime monitoring
│
├── 🤖 AI                   app/superadmin/ai/page.tsx
│     ├── AI provider management
│     └── Config (OpenAI, Anthropic, etc.)
│
├── 🔗 Integrations         app/superadmin/integrations/page.tsx
│     └── Platform integrations overview
│
├── 📞 Sendillo              app/superadmin/sendillo/page.tsx ✅
│     ├── Purchased phone numbers
│     ├── Sendillo brands
│     └── Number registration
│
└── ⚙️ Settings             app/superadmin/settings/page.tsx
      ├── Emma API key setup ✅
      ├── Platform config
      └── 🔜 Stripe Connect (RevRa platform payout)
```

### 1D. Auth — `/auth/*`

```
[ AUTH ]
├── 🔐 Sign In   app/(auth)/sign-in/[[...sign-in]]/page.tsx
├── 📝 Sign Up   app/(auth)/sign-up/[[...sign-up]]/page.tsx
└── 🏢 Workspace Select   app/(auth)/select-workspace/page.tsx
```

### 1E. Public Pages

```
[ PUBLIC PAGES ]
├── 🏠 Root   app/page.tsx  (marketing / redirect)
└── 🔜 Lead Marketplace  (future — /marketplace or /user/marketplace)
```

---

## 2. UI COMPONENT LIBRARY (`components/`)

```
[ UI COMPONENTS ]  components/ui/
├── atoms/  (button, badge, input, label, avatar, tooltip, toggle, progress, skeleton)
├── molecules/  (modal, slide-over, dropdown, tabs, table, empty-state)
└── organisms/  (metro-pane)

[ FEATURE COMPONENTS ]  components/features/
├── 🤖 AI/  (CampaignBuilderModal, RevRaAIChat)
├── 💬 Communications/  (AddLeadModal, IntegrationConfigModal, InviteMemberModal, PostCallForm)
├── 📄 CSV/  (CSVImportModal)
├── 👥 Lead Management/  (LeadProfileModal, LeadProfilePanel)
├── 🔄 Modals/  (AddProviderModal, AddUserModal, AddWorkspaceModal, ConfirmationDialog)
├── 📋 Pipeline/  (KanbanBoard)
└── ⚡ Workflow/  (WorkflowCanvas)

[ LAYOUT COMPONENTS ]  components/layouts/
├── Shell.tsx  (main app shell + sidebar nav)
├── UserDashboard.tsx
├── CommandPalette.tsx
└── NotificationPanel.tsx

[ CONTEXT PROVIDERS ]  context/
├── auth-context.tsx
├── lead-profile-context.tsx
└── theme-provider.tsx
```

---

## 3. BACKEND API LAYER (`app/api/`)

### 3A. Core Resources

```
[ CORE API ROUTES ]
│
├── 👥 Leads
│     ├── GET  /api/leads           — list leads (filterable by stage, agent, limit/offset) ✅
│     ├── POST /api/leads           — create lead + auto-push to Emma ✅
│     ├── PATCH /api/leads          — update lead + sync stage to Emma ✅
│     └── GET  /api/leads/[id]      — get single lead
│           └── GET /api/leads/[id]/messages — lead message history
│
├── 📞 Calls
│     ├── GET  /api/calls           — list call logs
│     └── GET  /api/calls/[id]      — call details (transcription, recording)
│
├── 💬 Conversations
│     ├── GET  /api/conversations           — list conversations per lead
│     └── GET /api/conversations/[id]/messages — conversation messages
│
├── 📢 Channels
│     ├── GET  /api/channels                — list team channels
│     └── GET /api/channels/[id]/messages  — channel messages
│
├── 📋 Tasks
│     └── GET/POST /api/tasks              — list/create tasks
│
├── 📅 Appointments
│     └── GET/POST /api/appointments       — list/create appointments
│
├── 📊 Analytics
│     └── GET /api/analytics               — workspace analytics
│
├── 📝 Briefings
│     └── GET /api/briefing                — agent briefings
│
├── 👔 Team
│     └── GET /api/team                   — team members
│
└── 🏠 Home
      └── GET /api/home                   — dashboard home data
```

### 3B. Campaigns (`/api/campaigns/`)

```
[ CAMPAIGN API ]  app/api/campaigns/
│
├── GET  /api/campaigns            — list campaigns (with stats) ✅
├── POST /api/campaigns            — create campaign ✅
│
├── GET  /api/campaigns/stats      — aggregate workspace campaign stats ✅
│
└── [id]/
      ├── GET  /api/campaigns/[id]        — get campaign ✅
      ├── PATCH /api/campaigns/[id]       — update campaign (status, keywords, etc.) ✅
      ├── DELETE /api/campaigns/[id]      — delete campaign ✅
      ├── POST  /api/campaigns/[id]/send  — execute bulk SMS via Sendillo ✅
      └── GET  /api/campaigns/[id]/stats  — per-campaign delivery stats ✅
```

### 3C. Emma AI Integration (`/api/emma/`)

```
[ EMMA AI API ]  app/api/emma/
│
├── GET  /api/emma/setup           — check Emma API key config ✅
│
├── Clients
│     └── GET/POST /api/emma/clients  — list/create Emma clients ✅
│
├── Leads
│     ├── POST /api/emma/leads             — push single lead to Emma ✅
│     ├── POST /api/emma/leads/bulk        — bulk push leads to Emma ✅
│     └── PATCH /api/emma/leads/[id]      — update Emma lead status ✅
│
├── Connect Links
│     ├── POST /api/emma/messaging/connect-link  — OAuth link (IG/WhatsApp/FB/Telegram) ✅
│     └── POST /api/emma/calendar/connect-link   — Google Calendar OAuth link ✅
│
├── Emma Campaigns
│     ├── GET/POST /api/emma-campaigns           — list/create Emma AI campaigns ✅
│     └── GET/PATCH /api/emma-campaigns/[id]    — get/update Emma campaign ✅
│
└── Queue
      └── GET/POST /api/emma-queue              — outbound dialer/SMS queue ✅
```

### 3D. Sendillo Integration (`/api/sendillo/`)

```
[ SENDILLO API ]  app/api/sendillo/
│
├── Phone Numbers
│     ├── GET  /api/sendillo/numbers       — list Sendillo purchased + registered numbers ✅
│     ├── POST /api/sendillo/numbers       — register number in RevRa DB ✅
│     └── [id]/
│           ├── GET  /api/sendillo/numbers/[id]   — get number details ✅
│           ├── PATCH /api/sendillo/numbers/[id]  — update label/is_active ✅
│           └── DELETE /api/sendillo/numbers/[id] — remove number ✅
│
└── Brands
      └── GET /api/sendillo/brands         — list Sendillo brands ✅
```

### 3E. Sendillo Webhooks (`/api/webhooks/sendillo/`)

```
[ SENDILLO WEBHOOKS ]  app/api/webhooks/sendillo/route.ts ✅
│
├── inbound.received  → handleInbound()
│     ├── Find lead by phone (ilike)
│     ├── Match campaign positive/opt-out keywords
│     ├── Opt-out: mark lead opted_out + increment_campaign_optout RPC
│     ├── Positive keyword: push lead to Emma AI + increment_campaign_emma_synced RPC
│     ├── Upsert conversation + increment_conversation_unread RPC
│     └── Insert inbound message + increment_campaign_replied RPC
│
├── message.delivered  → handleDelivered()
│     ├── Update message external_status = "delivered"
│     └── Increment campaign delivered count (RPC)
│
├── message.sent      → handleSent()
│     └── Update message external_status = "sent"
│
└── message.failed    → handleFailed()
      ├── Update message external_status = "failed"
      └── Increment campaign failed count (RPC)
```

### 3F. Emma Webhooks (`/api/webhooks/emma/`)

```
[ EMMA WEBHOOKS ]  app/api/webhooks/emma/route.ts
└── 🔜 ON HOLD — Emma AI team still building webhook payload + auth
      ├── Inbound messages (IG/WhatsApp/FB/Telegram/Telegram)
      ├── AI agent responses
      └── Call recording/transcription/summary
```

### 3G. Clerk Webhooks (`/api/webhooks/clerk/`)

```
[ CLERK WEBHOOKS ]  app/api/webhooks/clerk/route.ts ✅
│
├── user.created  → Upsert user to Supabase users table
│     ├── clerk_user_id, email, full_name, avatar_url
│     ├── role from public_metadata (default: "agent")
│     └── Auto-assign to DEFAULT_WORKSPACE_ID
│
├── user.updated  → Update same fields
└── user.deleted  → Delete user from Supabase
```

### 3H. Admin APIs (`/api/admin/`)

```
[ ADMIN API ]  app/api/admin/
├── GET  /api/admin/dashboard      — admin overview stats
├── GET  /api/admin/lead-pool       — admin lead pool management
├── GET  /api/admin/performance    — agent performance metrics
├── GET  /api/admin/subscriptions  — subscription tracking
├── GET  /api/admin/team           — team management
└── GET  /api/admin/workflows      — workflow management
```

### 3I. Superadmin APIs (`/api/superadmin/`)

```
[ SUPERADMIN API ]  app/api/superadmin/
├── GET  /api/superadmin/overview     — platform overview
├── GET  /api/superadmin/users        — cross-workspace users
├── GET  /api/superadmin/workspaces  — all workspaces
├── GET  /api/superadmin/performance — platform performance
├── GET  /api/superadmin/subscriptions — platform subscriptions
├── GET  /api/superadmin/health      — system health
├── GET  /api/superadmin/providers   — provider management
└── GET  /api/superadmin/ai-providers — AI provider config
```

### 3J. Other APIs

```
[ OTHER API ]
├── GET  /api/workspaces               — workspaces CRUD
├── GET  /api/workspaces/my            — current user's workspace
├── POST /api/workspaces/[id]/join    — join workspace
├── GET  /api/integrations            — workspace integrations catalog
├── GET  /api/workflows               — workflow definitions
└── GET  /api/home                    — dashboard home data
```

---

## 4. DATA LAYER — Supabase PostgreSQL

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE POSTGRESQL                          │
│                  supabase/schema.sql (source of truth)           │
└─────────────────────────────────────────────────────────────────┘

### 4A. Enums (15)

message_channel     →  sms | imessage | whatsapp | rcs | email
message_direction   →  inbound | outbound
call_direction      →  inbound | outbound
call_status         →  initiated | ringing | in_progress | completed | busy | no_answer | failed
workspace_plan      →  starter | professional | enterprise
user_role           →  superadmin | admin | agent
task_type           →  call | email | sms | follow_up | schedule | custom
task_priority       →  low | medium | high | urgent
task_status         →  pending | completed | skipped
integration_provider→  twilio | loopmessages | sendgrid | google | meta_ads | hubspot | salesforce | stripe | slack | zapier | calendly | aircall | intercom | sendillo
integration_status  →  active | error | disconnected
lead_type           →  medicare | aca | final_expense | life | other
ai_mode             →  agent | chat
ai_role             →  user | assistant | system | tool
ai_disposition      →  interested | not_interested | callback | not_reachable
calendar_event_status→  confirmed | cancelled
```

### 4B. Tables (25) — Entity Relationship

```
╔══════════════════════════════════════════════════════════════════╗
║                    CORE ENTITIES                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  workspaces                                                         ║
║    ├── id (PK)                                                      ║
║    ├── name, slug, plan                                             ║
║    ├── twilio_account_sid, loopmessages_api_key                     ║
║    ├── sendgrid_api_key                                             ║
║    ├── google_calendar_creds (JSONB)                               ║
║    ├── emma_api_key 🔜                                              ║
║    └── settings (JSONB)                                              ║
║          │                                                          ║
║          │ 1:N                                                       ║
║          ▼                                                          ║
║  users ◄─────────── clerk_user_id (Clerk auth)                      ║
║    ├── id (PK), clerk_user_id, workspace_id (FK)                    ║
║    ├── email, full_name, role, avatar_url                          ║
║    └── emma_client_id (future multi-client)                        ║
║          │                                                          ║
║          │ 1:N                                                       ║
║          ▼                                                          ║
║  leads                                                          ║
║    ├── id (PK), workspace_id (FK), assigned_agent_id (FK)          ║
║    ├── first_name, last_name, email, phone                          ║
║    ├── lead_type, score, pipeline_stage                             ║
║    ├── previous_stages[], tags[]                                    ║
║    ├── opted_out, opted_out_at  (Phase 4 ✅)                        ║
║    ├── is_admin_lead, is_marketplace_lead                           ║
║    ├── enrichment_data (JSONB — emma_lead_id, etc.)                 ║
║    └── source, notes, last_contacted_at                             ║
║          │                                                          ║
║          ├──────────────────┬──────────────────┬─────────────────  ║
║          ▼                  ▼                  ▼                  ║
║  pipeline_moves      conversations       appointments                 ║
║  (stage history)    (per-lead thread)  (scheduled calls)           ║
║          │                  │                  │                   ║
║          ▼                  ▼                  ▼                   ║
║  messages ◄──── campaign_id (FK)       calls                        ║
║    ├── id (PK)                            (AI transcription)         ║
║    ├── workspace_id, lead_id, agent_id                               ║
║    ├── conversation_id, campaign_id                                  ║
║    ├── channel (message_channel enum)                               ║
║    ├── direction (inbound/outbound)                                 ║
║    ├── body, media_url                                               ║
║    ├── external_id, external_status                                  ║
║    ├── ai_generated, ai_context (JSONB)                             ║
║    └── sent_at                                                      ║
║          │                                                          ║
║          ▼                                                          ║
║  emma_queue                    sendillo_phone_numbers               ║
║  (outbound dialer/SMS queue)  (agent phone numbers)                 ║
║          │                    ├── id (PK)                          ║
║          ▼                    ├── workspace_id, agent_id (FK)        ║
║  emma_campaigns               └── phone_number, label, is_active    ║
║  (AI campaign def)                          │                      ║
║                                            FK                       ║
║                                     campaigns ◄── sender_phone_id   ║
║                                       ├── id (PK)                  ║
║                                       ├── workspace_id (FK)          ║
║                                       ├── name, channel, status      ║
║                                       ├── sent, delivered, failed   ║
║                                       ├── opted_out, emma_synced    ║
║                                       ├── sender_phone_id (FK)       ║
║                                       ├── message_body              ║
║                                       ├── positive_keywords[]        ║
║                                       ├── optout_keywords[]          ║
║                                       └── created_by (FK → users)   ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                    SECONDARY ENTITIES                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  pipeline_stages   — custom stages per workspace                   ║
║  default_pipeline_stages — global stage templates                  ║
║  appointments      — scheduled appointments with duration/type      ║
║  workflows        — JSONB node graph (automation builder)          ║
║  channels         — team messaging (Slack-like)                     ║
║  channel_messages — messages in team channels                       ║
║  ai_conversations — AI agent chat sessions                          ║
║  ai_messages     — individual AI messages with tool_calls/results    ║
║  tasks           — agent to-dos (call, email, sms, follow_up)     ║
║  calendar_events — Google Calendar synced events                   ║
║  integrations    — per-workspace integrations catalog               ║
║  webhooks_log    — incoming webhook audit log                       ║
║  ai_providers    — superadmin AI provider config                    ║
║  providers       — superadmin message provider config               ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### 4C. Database Triggers & Functions

```
[ AUTO-UPDATED_AT ]  (9 triggers on 9 tables)
workspaces, leads, appointments, conversations, workflows,
channels, campaigns, emma_campaigns, ai_conversations

[ PIPELINE MOVE TRACKER ]
leads_updated_at  →  track_pipeline_move()  →  pipeline_moves INSERT

[ CAMPAIGN COUNTER RPCs ]  (Phase 4 ✅)
increment_campaign_sent()         → sent++
increment_campaign_delivered()    → delivered++
increment_campaign_failed()       → failed++
increment_campaign_replied()      → replied++
increment_campaign_optout()       → opted_out++
increment_campaign_emma_synced()   → emma_synced++
increment_conversation_unread()   → unread_count++
```

### 4D. Row Level Security (RLS) Model

```
[ RLS ENABLED ON ALL 25 TABLES ]
Role hierarchy:  superadmin > admin > agent

users         → SELECT by workspace members / INSERT/UPDATE/DELETE by admins+
leads         → SELECT/INSERT/UPDATE by workspace members / DELETE by admins+
conversations → SELECT/INSERT/UPDATE by workspace members
messages      → SELECT/INSERT by workspace members
campaigns     → SELECT/INSERT by all / DELETE by admins+
integrations  → SELECT/INSERT/UPDATE/DELETE by admins+
ai_providers  → SELECT/INSERT/UPDATE/DELETE by superadmins only
sendillo_phone_numbers → SELECT by all / INSERT/UPDATE/DELETE by superadmins
```

---

## 5. INTEGRATION LAYER — External Services

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                                  │
│                                                                            │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │   CLERK    │     │  SUPABASE   │     │  STRIPE     │                  │
│   │  (Auth)    │     │  (Database)│     │  (Payments)│                  │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                  │
│          │ webhook          │             🔜 future                       │
│          ▼                  ▼                                           │
│   ┌──────────────────────────────────────┐                               │
│   │           NEXT.JS APP                │                               │
│   │         (Railway Hosting)             │                               │
│   │  app.letsrevra.com                     │                               │
│   └────────────┬────────────────┬──────────┘                               │
│                │                │                                          │
│                ▼                ▼              🔜 Lead Marketplace        │
│   ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐        │
│   │  lib/emma/     │  │ lib/sendillo/  │  │    lib/stripe/       │        │
│   │  client.ts     │  │ client.ts      │  │    (future)          │        │
│   └───────┬────────┘  └───────┬────────┘  └──────────────────────┘        │
│           │                  │                                             │
└───────────│──────────────────│─────────────────────────────────────────────┘
            │                  │
            ▼                  ▼
    ┌──────────────┐   ┌──────────────┐
    │  EMMA AI     │   │  SENDILLO    │
    │  LunarOlivia │   │  (Bulk SMS)  │
    │  lunarolivia │   │  sendillo.com │
    └──────┬───────┘   └──────┬───────┘
           │                 │
           ▼                 ▼
    ┌─────────────────────────────────┐
    │         EMMA AI CHANNELS         │
    │                                   │
    │  ┌──────────┐  ┌──────────────┐  │
    │  │ WhatsApp │  │  Instagram   │  │
    │  │(Zernio OA)│  │ (Zernio OA) │  │
    │  └──────────┘  └──────────────┘  │
    │  ┌──────────────┐  ┌──────────┐  │
    │  │FB Messenger  │  │ Telegram │  │
    │  │(Zernio OA)  │  │(Zernio OA)│  │
    │  └──────────────┘  └──────────┘  │
    │                                   │
    │  🔜 iMessage  (Emma pending)       │
    │  🔜 SMS Fallback (Emma pending)   │
    │  🔜 RCS (Emma pending)            │
    │                                   │
    │  VOICE (via Emma AI)               │
    │  ┌──────────┐  ┌──────────────┐  │
    │  │  Twilio  │  │  Auto-Dialer │  │
    │  │ (Retell) │  │   (future)   │  │
    │  └──────────┘  └──────────────┘  │
    │                                   │
    │  CALENDAR                          │
    │  ┌──────────────┐                   │
    │  │   Google    │                   │
    │  │ Calendar OA │                   │
    │  └──────────────┘                   │
    └───────────────────────────────────┘
```

### 5A. Integration Status Matrix

```
┌────────────────────────────┬──────────────────┬────────────────┬────────────┐
│ Integration                │ Provider         │ Status          │ Env Var    │
├────────────────────────────┼──────────────────┼────────────────┼────────────┤
│ Authentication             │ Clerk            │ ✅ Built        │ CLERK_*    │
│ Database                   │ Supabase         │ ✅ Built        │ SUPABASE_* │
│ User Sync Webhook          │ Clerk → Supabase │ ✅ Built        │ CLERK_WH_  │
│ Emma AI (LunarGrowth)      │ Lunar Olivia     │ ✅ Built        │ EMMA_API_  │
│ Emma Leads Push            │ Emma             │ ✅ Built        │ EMMA_API_  │
│ Emma Messaging OAuth       │ Emma → Zernio    │ ✅ Built        │ EMMA_API_  │
│ Emma Calendar OAuth        │ Emma → Google    │ ✅ Built        │ EMMA_API_  │
│ Emma Webhooks             │ Emma             │ 🔜 On Hold      │ EMMA_WH_   │
│ Emma Campaign Queue       │ Emma             │ ✅ Built        │ EMMA_API_  │
│ Sendillo Bulk SMS         │ Sendillo         │ ✅ Built        │ SENDILLO_* │
│ Sendillo Webhooks         │ Sendillo         │ ✅ Built        │ SENDILLO_* │
│ Sendillo Numbers Mgmt     │ Sendillo         │ ✅ Built        │ SENDILLO_* │
│ Twilio Voice              │ Twilio (via Emma)│ 🔜 Via Emma     │ TWILIO_*   │
│ Auto-Dialer               │ —                │ 🔜 Not started  │ —          │
│ Google Calendar           │ Google (via Emma)│ 🔜 Via Emma    │ GOOGLE_*   │
│ Email (SendGrid/Resend)   │ SendGrid/Resend │ 🔜 Not started  │ SENDGRID_* │
│ Stripe Payments           │ Stripe           │ 🔜 Not started  │ STRIPE_*   │
│ iMessage                  │ Apple            │ 🔜 Emma pending │ —          │
│ SMS Fallback              │ Sendillo         │ 🔜 Emma pending │ —          │
│ RCS                       │ —                │ 🔜 Emma pending │ —          │
│ WhatsApp                  │ Zernio (via Emma)│ 🔜 Via Emma     │ —          │
│ Instagram                 │ Zernio (via Emma)│ 🔜 Via Emma     │ —          │
│ Facebook Messenger        │ Zernio (via Emma)│ 🔜 Via Emma     │ —          │
│ Telegram                  │ Zernio (via Emma)│ 🔜 Via Emma     │ —          │
│ AI Draft Generation       │ Emma             │ 🔜 Emma pending │ —          │
│ Lead Marketplace          │ Stripe           │ 🔜 Not started  │ —          │
│ Bulk Upload (Marketplace) │ CSV import       │ 🔜 Not started  │ —          │
└────────────────────────────┴──────────────────┴────────────────┴────────────┘
```

### 5B. Emma AI — Channel Architecture

```
EMMA AI  (lunarolivia.com/api/v1/external)
│
├── WhatsApp ──────────────────────────────────────────────────────► RevRa Lead
│   Zernio OAuth                                                       Pipeline
├── Instagram ─────────────────────────────────────────────────────►
│   Zernio OAuth
├── FB Messenger ─────────────────────────────────────────────────►
│   Zernio OAuth
├── Telegram ───────────────────────────────────────────────────────►
│   Zernio OAuth
├── Voice (Twilio/Retell) ──────────────────────────────────────────► Call Log
│   ↳ Call Recording ──► Transcription ──► AI Summary ──► Disposition  (🔜)
├── Google Calendar OAuth ─────────────────────────────────────────► Calendar Events
│   ↳ Event sync
└── Inbound Webhooks ───────────────────────────────────────────────► ⏳ On Hold
      (Emma team building)
```

---

## 6. AUTHENTICATION & AUTHORIZATION FLOW

```
[ AUTH FLOW ]

Clerk (letsrevra.com)
      │
      │ OAuth sign-in
      ▼
┌─────────────┐
│  Next.js    │
│  Middleware │  (redirect to /sign-in if no session)
└──────┬──────┘
       │ Clerk session cookie
       ▼
┌──────────────────────────────────────┐
│         Clerk Webhook                 │
│  app/api/webhooks/clerk/route.ts     │
│                                      │
│  user.created → upsert Supabase users │
│  user.updated → update user fields    │
│  user.deleted → delete from Supabase  │
└──────────────┬───────────────────────┘
               │ clerk_user_id + workspace_id
               ▼
┌──────────────────────────────────────┐
│       Supabase (RLS)                 │
│                                      │
│  auth.uid()::text = clerk_user_id    │
│  workspace_id from Supabase users     │
│  role from Supabase users            │
└──────────────────────────────────────┘
```

---

## 7. LEAD FLOW — Full Lifecycle

```
[ LEAD LIFECYCLE ]

┌─────────────────────────────────────────────────────────────────┐
│                     LEAD CREATION                                │
│                                                                   │
│  Agent creates lead                                              │
│  ├── POST /api/leads  ──► Supabase INSERT                       │
│  │                    └──► Emma AI createLead()  (fire-and-forget)│
│  │                        └──► enrichment_data.emma_lead_id     │
│  └── Response: { lead: {...} }                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LEAD PIPELINE STAGES                            │
│                                                                   │
│  new_lead → contacted → qualified → booked → converted            │
│                          ↓              ↓                        │
│                        lost              dnc                     │
│                                                                   │
│  Stage change:                                                  │
│  ├── PATCH /api/leads ──► pipeline_moves INSERT (trigger)        │
│  └── Emma updateLead() called (fire-and-forget)                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              MESSAGE / CAMPAIGN FLOW (Sendillo)                  │
│                                                                   │
│  ① Agent creates campaign (POST /api/campaigns)                   │
│     └── Selects sendillo_phone_number, writes message_body        │
│         configures positive/optout keywords                       │
│                                                                   │
│  ② Agent launches campaign (POST /api/campaigns/[id]/send)        │
│     ├── Fetch leads (opted_out=false, phone != null)             │
│     ├── sendBulkSMS(messages[])  ──► Sendillo API               │
│     ├── INSERT messages (id = clientRef UUID)                    │
│     └── UPDATE campaign status = "active", sent = N              │
│                                                                   │
│  ③ Sendillo processes bulk SMS                                    │
│                                                                   │
│  ④ Webhooks fire back:                                            │
│     inbound.received ──► keyword check ──► Emma push on positive  │
│     message.delivered ──► delivered++                           │
│     message.sent ──► sent++                                      │
│     message.failed ──► failed++                                  │
│                                                                   │
│  ⑤ Lead replies                                                  │
│     └── inbound.received ──► Opt-out keyword? Mark opted_out     │
│                               Positive keyword? Push to Emma AI  │
│                               Upsert conversation + message       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. LEAD MARKETPLACE FLOW (🔜 Future)

```
[ LEAD MARKETPLACE ]

┌─────────────────────────────────────────────────────────┐
│  RevRa Platform Pool         Workspace Admin Pool       │
│  (Superadmin uploads)       (Admin uploads)            │
│                                                        │
│  Premium / Normal / Aged     Premium / Normal / Aged    │
│  Tiered pricing             Custom pricing             │
│  Stripe Connect payout      Stripe Connect payout       │
│  (2% RevRa cut)            (Admin sets own price)      │
└────────────────────┬──────────────────────────────────┘
                     │ Agent purchases
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LEAD MARKETPLACE PAGE                       │
│  /user/marketplace (future)                              │
│                                                          │
│  Two tabs:                                                │
│  ├── RevRa Platform Pool                                  │
│  └── Workspace Admin Pool                                │
│                                                          │
│  Per lead:                                               │
│  ├── Tier (Premium/Normal/Aged)                          │
│  ├── Price                                               │
│  ├── Preview info                                        │
│  ├── "Purchase" button → Stripe Checkout                 │
│  └── First-come-first-served (removed after purchase)    │
└────────────────────┬────────────────────────────────────┘
                     │ Purchase confirmed
                     ▼
┌─────────────────────────────────────────────────────────┐
│              POST-PURCHASE FLOW                          │
│                                                          │
│  ① Stripe webhook (future) → confirm payment            │
│  ② Lead assigned to agent (is_marketplace_lead=true)    │
│  ③ Lead moved to workspace admin pool → then to agent   │
│  ④ Admin payout via Stripe Connect (2% RevRa cut)      │
│  ⑤ Lead removed from marketplace (first-served)         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. FILE MAP — Complete Source of Truth

### Database
```
supabase/
├── schema.sql          ← Full schema (single source of truth)
├── migration.sql       ← Initial migration (v2)
└── migrations/
    ├── 003_emma_ai_schema.sql        ← Emma AI additions
    ├── 004_sendillo_schema_enum.sql ← Enum: ADD VALUE 'sendillo'
    └── 004_sendillo_schema.sql      ← Sendillo main migration
```

### Library Clients
```
lib/
├── constants.ts       ← App constants
├── types.ts           ← Shared TypeScript types
├── utils.ts          ← Utility functions
├── mock-data.ts      ← Development mock data
│
├── supabase/
│   ├── client.ts     ← Browser Supabase client (RLS)
│   └── server.ts     ← Server clients (service role, anon key)
│
├── emma/
│   └── client.ts     ← Emma AI API client (Lunar Olivia)
│
├── sendillo/
│   └── client.ts     ← Sendillo API client (bulk SMS)
│
├── ai/
│   ├── client.ts     ← AI client config
│   └── tools.ts      ← Emma AI tools
│
└── types.ts          ← Integration types
```

### API Routes
```
app/api/
├── leads/[id]/messages/route.ts
├── channels/[id]/messages/route.ts
├── conversations/[id]/messages/route.ts
├── calls/[id]/route.ts
├── campaigns/[id]/send/route.ts
├── campaigns/[id]/stats/route.ts
│
├── emma/
│   ├── leads/route.ts
│   ├── leads/[id]/route.ts
│   ├── leads/bulk/route.ts
│   ├── clients/route.ts
│   ├── setup/route.ts
│   ├── messaging/connect-link/route.ts
│   └── calendar/connect-link/route.ts
│
├── emma-campaigns/route.ts
├── emma-campaigns/[id]/route.ts
├── emma-queue/route.ts
│
├── sendillo/
│   ├── numbers/route.ts
│   ├── numbers/[id]/route.ts
│   └── brands/route.ts
│
├── webhooks/
│   ├── clerk/route.ts         ✅
│   └── sendillo/route.ts     ✅
│
├── admin/
│   ├── dashboard/route.ts
│   ├── lead-pool/route.ts
│   ├── performance/route.ts
│   ├── subscriptions/route.ts
│   ├── team/route.ts
│   └── workflows/route.ts
│
└── superadmin/
    ├── overview/route.ts
    ├── users/route.ts
    ├── workspaces/route.ts
    ├── performance/route.ts
    ├── subscriptions/route.ts
    ├── health/route.ts
    ├── providers/route.ts
    └── ai-providers/route.ts
```

### Frontend Pages
```
app/
├── page.tsx                        (root — marketing/redirect)
├── (auth)/
│   ├── select-workspace/page.tsx
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
│
├── user/
│   ├── page.tsx                    (dashboard home)
│   ├── analytics/page.tsx
│   ├── ai/page.tsx
│   ├── automations/page.tsx
│   ├── briefing/page.tsx
│   ├── calendar/page.tsx
│   ├── campaigns/page.tsx          (5-step wizard)
│   ├── calls/page.tsx
│   ├── calls/active/page.tsx
│   ├── conversations/page.tsx
│   ├── integrations/page.tsx
│   ├── leads/page.tsx
│   ├── pipeline/page.tsx           (Kanban)
│   ├── settings/page.tsx
│   ├── tasks/page.tsx
│   ├── team/page.tsx
│   └── texts/page.tsx
│
├── admin/
│   ├── page.tsx
│   ├── lead-pool/page.tsx
│   ├── performance/page.tsx
│   ├── subscriptions/page.tsx
│   ├── team/page.tsx
│   ├── workflows/page.tsx
│   ├── integrations/page.tsx
│   └── settings/page.tsx
│
└── superadmin/
    ├── page.tsx
    ├── users/page.tsx
    ├── workspaces/page.tsx
    ├── providers/page.tsx
    ├── performance/page.tsx
    ├── subscriptions/page.tsx
    ├── health/page.tsx
    ├── ai/page.tsx
    ├── integrations/page.tsx
    ├── sendillo/page.tsx           ✅ Sendillo management
    └── settings/page.tsx
```

---

## 10. DEPLOYMENT & ENVIRONMENT

```
[ RAILWAY.DEPLOYMENT ]  app.letsrevra.com
│
├── Environment Variables (Railway)
│   ├── NEXT_PUBLIC_SUPABASE_URL
│   ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
│   ├── SUPABASE_SERVICE_ROLE_KEY
│   ├── CLERK_PUBLISHABLE_KEY
│   ├── CLERK_SECRET_KEY
│   ├── CLERK_WEBHOOK_SECRET
│   ├── EMMA_API_KEY              ← needs to be set
│   ├── SENDILLO_API_KEY          ← needs to be set
│   ├── NEXT_PUBLIC_APP_URL
│   └── DATABASE_URL (auto)
│
├── Webhook URLs (to configure in provider dashboards)
│   ├── Sendillo:     https://app.letsrevra.com/api/webhooks/sendillo
│   ├── Clerk:        https://app.letsrevra.com/api/webhooks/clerk
│   └── 🔜 Emma:      https://app.letsrevra.com/api/webhooks/emma (pending)
│
└── External OAuth Redirects
    └── Emma connects: https://app.letsrevra.com/integrations/emma/callback (future)
```

---

## 11. IMPLEMENTATION ROADMAP

```
COMPLETED (✅)
──────────────────────────────────────────────────
  Phase 1-2    Core CRM (leads, pipeline, tasks, etc.)
  Phase 3      Emma AI integration (leads push, messaging OAuth, calendar OAuth)
  Phase 3B     Sendillo integration (bulk SMS, webhooks, campaigns, number mgmt)

ON HOLD / PENDING (🔜)
──────────────────────────────────────────────────
  Emma webhooks        Waiting on Emma AI team payload + auth
  AI draft generation  Waiting on Emma AI team endpoint
  Auto-dialer         Not started — needs Twilio via Emma
  iMessage/SMS/RCS    Waiting on Emma AI team
  Inbound routing     Refinement after Emma webhook delivery
  Email provider      Not started (Resend or SendGrid)

DEFERRED — LEAD MARKETPLACE (🔜)
──────────────────────────────────────────────────
  Lead Marketplace page       (/user/marketplace)
  RevRa Platform pool         (superadmin bulk upload)
  Workspace Admin pool        (admin bulk upload + pricing)
  Lead tier system            (Premium/Normal/Aged)
  Stripe Connect              (2% RevRa cut, 98% admin payout)
  Payment routing             admin→RevRa platform payments
  Subscription plans          Prepaid agent subscriptions
  Marketplace lead dedup     First-come-first-served
  Bulk upload CSV wizard      Per-pool CSV import
```

---

## 12. MINDMAP OVERVIEW — Single View

```
                                    ┌─────────────────────┐
                                    │  CLERK (Auth)       │
                                    │  letsrevra.com      │
                                    └──────────┬──────────┘
                                               │ webhook
                              ┌────────────────▼──────────────────┐
                              │          SUPABASE                 │
                              │   PostgreSQL + RLS + Auth Bridge   │
                              └────────────────┬──────────────────┘
                                               │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
          ┌─────────────────┐     ┌───────────────────┐     ┌───────────────────┐
          │   NEXT.JS APP    │     │   NEXT.JS API     │     │   EXTERNAL APIS   │
          │  (Railway)       │     │   ROUTES         │     │                   │
          │  app.letsrevra  │     │                   │     │  EMMA AI ─────────┼──► WhatsApp
          └────────┬────────┘     └─────────┬─────────┘     │         │        │──► Instagram
                   │                       │               │         │        │──► FB Messenger
                   │                       │               │         │        │──► Telegram
                   │                       │               │         │        ├──► Voice (Twilio)
                   │                       │               │         │        ├──► Google Calendar
                   │                       │               │         │        └──► 🔜 Webhooks (hold)
                   │                       │               │                   │
                   │                       │               │  SENDILLO ─────────┼──► Bulk SMS
                   │                       │               │         │        └──► Inbound SMS
                   │                       │               │         │
                   │                       │               │  STRIPE ──────────🔜 Payments
                   │                       │               │  (future)
                   │                       │               │
                   ▼                       ▼               ▼
          ┌─────────────────────────────────────────────────────────────┐
          │                    PRESENTATION LAYER                       │
          │                                                              │
          │  /user/*         Agent Dashboard (14 pages)                  │
          │  /admin/*       Admin Dashboard (8 pages)                   │
          │  /superadmin/*  Superadmin Dashboard (11 pages)             │
          │  /auth/*        Authentication (3 pages)                    │
          │                                                              │
          │  + Shared Components (UI kit + Feature components)            │
          └──────────────────────────────────────────────────────────────┘
```

---

*This document is the architecture source of truth for RevRa. Update this file whenever the architecture changes.*