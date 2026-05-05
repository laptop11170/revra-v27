# Phase 5 Plan — RevRa CRM
*Build: Google Calendar + Lead Marketplace*

---

## Phase 5 Goal

Implement Google Calendar two-way sync and build the superadmin lead marketplace where platform operators can upload leads and distribute them to workspaces.

---

## 5.1 Google Calendar Integration

### 5.1.1 OAuth2 Setup

Each workspace connects Google Calendar via OAuth2:
```typescript
// lib/google/calendar.ts
interface GoogleCalendarConfig {
  client_id: string;       // from workspace.integrations
  client_secret: string;  // from workspace.integrations
  refresh_token: string;  // stored encrypted
  access_token: string;   // refreshed automatically
}
```

**Scopes needed:**
- `https://www.googleapis.com/auth/calendar.events` — read/write events

### 5.1.2 OAuth Flow

```
Workspace Admin → Clicks "Connect Google Calendar"
  → Redirect to Google OAuth
  → Callback → Store tokens in integrations table
  → Test sync
```

**`GET /api/integrations/google/connect`** — Initiate OAuth
**`GET /api/integrations/google/callback`** — Handle OAuth callback

### 5.1.3 Calendar Sync Endpoint

**`POST /api/calendar/sync`** — Sync workspace calendar

```typescript
// For each workspace with Google Calendar connected:
1. Refresh access token if expired
2. GET https://www.googleapis.com/calendar/v3/calendars/primary/events
   ?timeMin=now&timeMax=now+30d&singleEvents=true
3. Upsert into appointments table (match by google_event_id)
4. Detect deletions → mark appointments as cancelled
5. Update last_sync_at in integrations table
```

### 5.1.4 Create Event from Appointment

When user creates appointment in app (`POST /api/appointments`):

```typescript
1. Insert into appointments table
2. If workspace.google_calendar_enabled:
   a. Refresh access token
   b. POST https://www.googleapis.com/calendar/v3/calendars/primary/events
   c. Update appointments.google_event_id
   d. Update appointments.google_meet_link if meet created
3. If lead has email: send invite via SendGrid
```

### 5.1.5 Calendar UI Updates

**`app/user/calendar/page.tsx`** — already has month grid
```
Enhancements:
  - Real events from appointments table
  - Click event → Edit/Delete modal
  - Create event → Modal with lead selector + time picker
  - Google Meet link display
  - Color-coded by event type
```

---

## 5.2 Lead Marketplace

### 5.2.1 The Concept

Superadmin uploads leads → assigns to workspaces → workspaces see purchased leads in their pool.

### 5.2.2 Database Additions

```sql
-- New table: marketplace_leads
CREATE TABLE marketplace_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  phone_formatted TEXT,
  lead_type TEXT CHECK (lead_type IN ('medicare', 'aca', 'final_expense', 'life', 'other')),
  source TEXT,  -- 'google_ads', 'meta_ads', 'referral', 'cold_import'
  price DECIMAL(10,2) DEFAULT 0,  -- cost per lead
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'assigned', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace assignments
CREATE TABLE marketplace_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_lead_id UUID NOT NULL REFERENCES marketplace_leads(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  price_paid DECIMAL(10,2),
  UNIQUE(marketplace_lead_id, workspace_id)
);
```

### 5.2.3 Superadmin Marketplace UI

**`app/superadmin/marketplace/page.tsx`** — NEW page

Features:
- Upload CSV of leads (name, phone, email, type, source, price)
- View all marketplace leads with status
- Assign leads to workspaces (bulk or individual)
- Pricing management
- Analytics: leads sold, revenue, by source

### 5.2.4 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `GET /api/marketplace/leads` | GET | List marketplace leads |
| `POST /api/marketplace/leads` | POST | Upload leads (CSV parse) |
| `POST /api/marketplace/leads/assign` | POST | Assign to workspace |
| `GET /api/marketplace/analytics` | GET | Revenue, sales stats |
| `PATCH /api/marketplace/leads/[id]` | PATCH | Update lead status |

### 5.2.5 CSV Upload

**`POST /api/marketplace/leads`** — Parse CSV
```typescript
Input: multipart/form-data with CSV file
CSV columns: first_name, last_name, email, phone, lead_type, source, price

Flow:
  1. Parse CSV with Papaparse
  2. Validate rows (required: first_name, phone)
  3. Insert into marketplace_leads
  4. Return { imported: N, failed: M, errors: [...] }
```

### 5.2.6 Workspace Lead Pool

**`app/admin/lead-pool/page.tsx`** — Add "Marketplace" tab

```tsx
// Tabs: All | My Leads | Unassigned | Marketplace
// Marketplace tab shows leads assigned from marketplace
```

---

## 5.3 Lead Enrichment API

### 5.3.1 Enrichment Endpoint

**`POST /api/leads/[id]/enrich`**

```typescript
// Input: { lead_id }
// Flow:
1. Get lead phone/email
2. Call enrichment API (Clearbit, Apollo, or custom)
3. Update leads.enrichment_data with:
   - company_data (if business)
   - social_profiles
   - other_phones
   - email_verification
   - inferred_demographics
4. Recalculate lead score based on enrichment
5. Return { enrichment_data, new_score }
```

### 5.3.2 Auto-Enrichment Trigger

On lead creation:
```typescript
// If email provided → enrich immediately
// If only phone → enrich in background (async)
```

---

## 5.4 Multi-Workspace Per User (Phase 2 Ready)

### 5.4.1 Database Change

Replace `users.workspace_id` with `workspace_members` junction table:

```sql
-- Remove single workspace reference
ALTER TABLE users DROP COLUMN IF EXISTS workspace_id;

-- New junction table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);
```

### 5.4.2 Middleware Update

```typescript
// middleware.ts — check from workspace_members
const { data: membership } = await supabase
  .from("workspace_members")
  .select("role")
  .eq("user_id", user.id)
  .eq("workspace_id", currentWorkspaceId)
  .single();
```

### 5.4.3 Workspace Switcher UI

**In Shell sidebar** — add workspace switcher:
```tsx
// Current workspace shown in sidebar header
// Click → dropdown of all user's workspaces
// Switch → update context, reload data for new workspace
```

---

## 5.5 What's Built at End of Phase 5

| Feature | Status |
|---------|--------|
| Google Calendar OAuth2 | ✅ Built |
| Calendar two-way sync | ✅ Built |
| Create event → Google Calendar | ✅ Built |
| Send Google Meet invite | ✅ Built |
| Lead marketplace CSV upload | ✅ Built |
| Assign leads to workspaces | ✅ Built |
| Marketplace analytics | ✅ Built |
| Lead enrichment API | ✅ Built |
| Multi-workspace per user | ✅ Built |
| Workspace switcher UI | ✅ Built |

---

## Deliverables

| File | Description |
|------|-------------|
| `lib/google/calendar.ts` | Google Calendar API client |
| `app/api/calendar/sync/route.ts` | Sync calendar |
| `app/api/integrations/google/connect/route.ts` | OAuth init |
| `app/api/integrations/google/callback/route.ts` | OAuth callback |
| `app/superadmin/marketplace/page.tsx` | NEW marketplace page |
| `app/api/marketplace/leads/route.ts` | Marketplace lead CRUD |
| `app/api/marketplace/leads/assign/route.ts` | Assign to workspace |
| `app/api/marketplace/analytics/route.ts` | Marketplace stats |
| `app/api/leads/[id]/enrich/route.ts` | Lead enrichment |
| `supabase/migrations/004_workspace_members.sql` | Multi-workspace migration |
| `supabase/migrations/005_marketplace.sql` | Marketplace tables |

---

## Dependencies

- Google Cloud Console project with Calendar API enabled
- Papaparse for CSV parsing (already in project?)
- Clearbit or Apollo API key (optional)