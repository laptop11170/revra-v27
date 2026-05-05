# Phase 2 Plan — RevRa CRM
*Build: Database Foundation + Real Data*

---

## Phase 2 Goal

Create the actual Supabase database schema (migrations), seed with demo data, and wire every API route to real database queries. Eliminate all mock data fallbacks.

---

## 2.1 Database Migrations

### `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Workspaces ────────────────────────────────────────────────────────────
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  mrr INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  leads_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own workspace members" ON users FOR ALL
  USING (workspace_id = (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Leads ─────────────────────────────────────────────────────────────────
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  assigned_agent_id UUID REFERENCES users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  phone_formatted TEXT,
  lead_type TEXT CHECK (lead_type IN ('medicare', 'aca', 'final_expense', 'life', 'other')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  pipeline_stage TEXT DEFAULT 'new_lead',
  source TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  last_call_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  last_ai_briefing_at TIMESTAMPTZ,
  enrichment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own workspace leads" ON leads FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Pipeline Stages ───────────────────────────────────────────────────────
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

-- Default stages for new workspaces
-- new_lead, contacted, qualified, quote_sent, won, lost

-- ─── Calls ─────────────────────────────────────────────────────────────────
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'initiated',
  duration_seconds INTEGER,
  outcome TEXT,
  ai_summary TEXT,
  ai_disposition TEXT,
  recording_url TEXT,
  twilio_call_sid TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Calls scoped to workspace" ON calls FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Messages ───────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  agent_id UUID REFERENCES users(id),
  conversation_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'imessage', 'whatsapp', 'rcs', 'email')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  media_url TEXT,
  external_id TEXT,
  external_status TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages scoped to workspace" ON messages FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Tasks ─────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  lead_id UUID REFERENCES leads(id),
  assigned_agent_id UUID NOT NULL REFERENCES users(id),
  type TEXT CHECK (type IN ('call', 'email', 'sms', 'follow_up', 'schedule', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks scoped to workspace" ON tasks FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Appointments ────────────────────────────────────────────────────────────
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  lead_id UUID REFERENCES leads(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  google_event_id TEXT,
  google_meet_link TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Appointments scoped to workspace" ON appointments FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Campaigns ──────────────────────────────────────────────────────────────
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'multi')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaigns scoped to workspace" ON campaigns FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Workflows ──────────────────────────────────────────────────────────────
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  nodes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT FALSE,
  runs INTEGER DEFAULT 0,
  effectiveness INTEGER DEFAULT 0,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workflows scoped to workspace" ON workflows FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Integrations ────────────────────────────────────────────────────────────
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  initials TEXT,
  color TEXT,
  color_var TEXT,
  credentials JSONB,
  settings JSONB DEFAULT '{}',
  is_connected BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Integrations scoped to workspace or public" ON integrations FOR ALL
  USING (workspace_id IS NULL OR workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Channels (Team Chat) ────────────────────────────────────────────────────
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Channels scoped to workspace" ON channels FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid()));

-- ─── Channel Messages ─────────────────────────────────────────────────────────
CREATE TABLE channel_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pipeline Moves (Audit) ─────────────────────────────────────────────────
CREATE TABLE pipeline_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  moved_by UUID NOT NULL REFERENCES users(id),
  note TEXT,
  moved_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pipeline_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pipeline moves scoped to workspace" ON pipeline_moves FOR ALL
  USING (lead_id IN (SELECT id FROM leads WHERE workspace_id IN (SELECT workspace_id FROM users WHERE clerk_user_id = auth.uid())));

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_leads_workspace ON leads(workspace_id);
CREATE INDEX idx_leads_agent ON leads(assigned_agent_id);
CREATE INDEX idx_leads_stage ON leads(pipeline_stage);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_calls_lead ON calls(lead_id);
CREATE INDEX idx_calls_agent ON calls(agent_id);
CREATE INDEX idx_messages_lead ON messages(lead_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_tasks_agent ON tasks(assigned_agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_appointments_agent ON appointments(agent_id);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_workflows_workspace ON workflows(workspace_id);
```

### `supabase/migrations/002_seed_data.sql`

Seed demo workspace, users, leads, and data so the app looks populated on first use.

### `supabase/migrations/003_default_pipeline_stages.sql`

Insert default pipeline stages for each workspace on creation.

---

## 2.2 API Route Updates

Every API route needs to be tested against the real schema. Expected changes:

| Route | Change |
|-------|--------|
| `GET /api/leads` | Add pagination, search, stage filter — query `leads` table |
| `POST /api/leads` | Insert into `leads` table |
| `GET /api/leads/[id]` | Join `assigned_agent` users, `calls`, `messages` |
| `POST /api/leads/[id]/messages` | Insert into `messages` table |
| `GET /api/calls` | Join `lead_id` → leads for lead_name |
| `POST /api/calls` | Insert into `calls` table |
| `POST /api/tasks` | Insert into `tasks` table |
| `POST /api/appointments` | Insert into `appointments` table |
| `POST /api/campaigns` | Insert into `campaigns` table |
| `GET /api/conversations` | Group `messages` by lead_id → conversation |
| `POST /api/conversations/[id]/messages` | Insert into `messages` |
| `GET /api/admin/performance` | Aggregate from `calls` + `messages` + `leads` |
| `GET /api/admin/lead-pool` | Paginate `leads` with assigned_agent join |
| `GET /api/superadmin/performance` | Use `pipeline_moves` table for funnel |

---

## 2.3 What's Built at End of Phase 2

- All Supabase tables created with proper types
- RLS policies enforced on every table
- Real data flowing through all API routes
- No mock data fallbacks needed
- Demo data seeded for showcase

---

## Deliverables

| File | Description |
|------|-------------|
| `supabase/migrations/001_initial_schema.sql` | All table definitions |
| `supabase/migrations/002_seed_data.sql` | Demo data |
| `supabase/migrations/003_default_pipeline_stages.sql` | Stage defaults |
| Updated API routes | All queries to real tables |

---

## Owner

This phase requires Supabase access + schema design decisions.
Contact: Backend/DB team