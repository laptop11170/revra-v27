# Phase 3 Plan — RevRa CRM
*Build: Communications (SMS, Email, Multi-Channel)*

---

## Phase 3 Goal

Implement real SMS/email sending and receiving via Twilio, LoopMessages, and SendGrid. Users can send individual and bulk messages, and inbound messages appear in real-time.

---

## 3.1 Twilio SMS Integration

### 3.1.1 API Routes

**`POST /api/messages/send`** — Send outbound SMS via Twilio
```
Input: { lead_id, body, channel? }
Flow:
  1. Get lead phone from leads table
  2. Get workspace Twilio credentials
  3. Call Twilio Messages API
  4. Store in messages table with external_id
  5. Return message record
```

**`POST /api/webhooks/twilio-sms`** — Receive inbound SMS
```
Flow:
  1. Verify Twilio signature
  2. Lookup lead by phone number
  3. Create message record (inbound)
  4. Publish to Supabase Realtime
  5. Return 200 OK
```

### 3.1.2 What's Needed

| Item | File |
|------|------|
| Twilio account setup | `.env.local` |
| Outbound send function | `lib/twilio/sms.ts` |
| Webhook verification | `lib/twilio/webhook.ts` |
| Send route | `app/api/messages/send/route.ts` |
| Webhook handler | `app/api/webhooks/twilio-sms/route.ts` |

### 3.1.3 Twilio Config in Supabase

```sql
-- Add to workspaces table (already in schema)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT;
```

---

## 3.2 LoopMessages Integration

### 3.2.1 Supported Channels

| Channel | Provider | Notes |
|---------|----------|-------|
| iMessage | LoopMessages | Primary for Apple users |
| SMS | LoopMessages / Twilio | Fallback |
| WhatsApp | LoopMessages | Opt-in |
| RCS | LoopMessages | Android with RCS |

### 3.2.2 API Routes

**`POST /api/messages/send-loop`** — Send via LoopMessages
**`POST /api/webhooks/loopmessages`** — Receive inbound

### 3.2.3 Channel Routing Logic

```typescript
// lib/messaging/channel-routing.ts
async function sendMessage(params: {
  lead_id: string;
  body: string;
  channel?: "auto" | "sms" | "imessage" | "whatsapp" | "rcs";
}) {
  // 1. Check lead's preferred channel from enrichment data
  // 2. Auto-detect iMessage availability via LoopMessages lookup
  // 3. Route to appropriate provider
  // 4. Fall back to SMS if primary fails
}
```

---

## 3.3 SendGrid Email

### 3.3.1 API Routes

**`POST /api/messages/send-email`** — Send email via SendGrid
```
Input: { lead_id, template_id?, subject, body }
Flow:
  1. Get lead email from leads table
  2. Get workspace SendGrid API key
  3. Call SendGrid Mail Send API
  4. Store as messages with channel='email'
```

**`POST /api/webhooks/sendgrid`** — Email events
```
Events: delivered, opened, clicked, bounced, dropped
Action: Update message record external_status
```

### 3.3.2 Email Templates

| Template ID | Purpose | Trigger |
|-------------|---------|---------|
| `appointment-confirmed` | Calendar booking | `POST /api/appointments` |
| `call-summary` | Post-call follow-up | Call marked completed |
| `lead-intro` | Welcome sequence | Lead created |
| `task-reminder` | Daily digest | Scheduled job |
| `campaign-reply` | Auto-reply to campaign response | Inbound from campaign |

---

## 3.4 Bulk Campaigns

### 3.4.1 Enhanced Campaign API

**`POST /api/campaigns/[id]/send`** — Execute campaign
```
Flow:
  1. Fetch campaign recipients (leads matching filter)
  2. For SMS: batch via Twilio/LoopMessages
  3. For Email: batch via SendGrid
  4. Update campaign.sent_count
  5. Track delivery status via webhooks
```

**Campaign Filters:**
```sql
-- Build lead query from campaign criteria
WHERE workspace_id = ?
  AND pipeline_stage IN (?)      -- target stages
  AND lead_type IN (?)           -- medicare/aca/etc
  AND last_message_at < NOW() - interval '30 days'  -- no recent contact
```

### 3.4.2 Campaign Queue Job

For large campaigns (>100 recipients), queue via background job:
- Use Supabase Edge Function or external queue (BullMQ)
- Process in batches of 50
- Rate limit to avoid carrier blocks

---

## 3.5 Real-Time Messaging

### 3.5.1 Supabase Realtime Subscriptions

```typescript
// In conversation/message pages
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `workspace_id=eq.${workspaceId}`
  }, (payload) => {
    // Add message to conversation in real-time
  })
  .subscribe();
```

### 3.5.2 UI Updates

- **Text/Inbox pages**: Live message insertion without refresh
- **Conversations**: Real-time thread updates
- **Campaign status**: Live sent/delivered counters

---

## 3.6 Message UI Enhancements

### Bulk SMS Modal (`app/user/leads/page.tsx`)
- Already has `BulkSMSModal` component
- Wire to `POST /api/messages/send` for each selected lead
- Show sending progress

### Message Thread (`app/user/conversations/page.tsx`)
- Already has conversation UI
- Wire to real Supabase realtime
- Add typing indicators

### Campaign Manager (`app/user/campaigns/page.tsx`)
- Already has campaign list UI
- Add "Send Now" button → `POST /api/campaigns/[id]/send`
- Show live delivery stats

---

## 3.7 What's Built at End of Phase 3

| Feature | Status |
|---------|--------|
| Outbound SMS via Twilio | ✅ Built |
| Outbound SMS via LoopMessages | ✅ Built |
| Outbound Email via SendGrid | ✅ Built |
| Inbound SMS webhook | ✅ Built |
| Inbound email/webhook | ✅ Built |
| Real-time message updates | ✅ Built |
| Bulk campaign sending | ✅ Built |
| Channel routing (iMessage/SMS/WhatsApp/RCS) | ✅ Built |
| Message delivery tracking | ✅ Built |

---

## Deliverables

| File | Description |
|------|-------------|
| `lib/twilio/sms.ts` | Twilio SMS client |
| `lib/twilio/webhook.ts` | Webhook verification |
| `lib/loopmessages/client.ts` | LoopMessages API client |
| `lib/sendgrid/client.ts` | SendGrid API client |
| `lib/messaging/channel-routing.ts` | Smart routing logic |
| `app/api/messages/send/route.ts` | Send outbound message |
| `app/api/webhooks/twilio-sms/route.ts` | Twilio SMS webhook |
| `app/api/webhooks/loopmessages/route.ts` | LoopMessages webhook |
| `app/api/webhooks/sendgrid/route.ts` | SendGrid webhook |
| `app/api/campaigns/[id]/send/route.ts` | Execute campaign |

---

## Dependencies

- Twilio account with SMS capability
- LoopMessages API key
- SendGrid API key
- Supabase Realtime enabled on messages table