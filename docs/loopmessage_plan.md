# LoopMessages Integration Plan — Phase 3.1

---

## What LoopMessages Does

LoopMessages is a multi-channel messaging API that unifies **iMessage, SMS, RCS, and WhatsApp** into a single platform. You connect one API, send to any channel, and receive all inbound messages and delivery statuses via webhooks.

- **Send**: POST to `https://a.loopmessage.com/api/v1/message/send/`
- **Receive inbound / delivery events**: Webhooks POST to your server
- **Status check**: GET `https://a.loopmessage.com/v1/message/status/{id}/`
- **Bulk campaigns**: POST to `https://a.loopmessage.com/api/v1/campaigns/new/`
- **Audience management**: GET/DELETE contacts, message history
- **Sender management**: List sender names, check plans, order new senders

---

## What You Need Before We Start Coding

### 1. LoopMessages API Key
Get it from your LoopMessages account dashboard. You'll store it in the `integrations` table per workspace. We'll call it `api_key` inside the `credentials` JSONB.

### 2. Webhook URL
Configure in LoopMessages dashboard to point to:
```
https://app.letsrevra.com/api/webhooks/loopmessages
```
LoopMessages also supports a `webhook_header` — we recommend setting one so your webhook handler can verify every request is genuinely from LoopMessages.

### 3. Sender Names
LoopMessages works on a **sender name** model. You need at least one sender name (phone number for SMS/iMessage, email address, or WhatsApp Business number) provisioned in your LoopMessages organization. Without a sender, you can only reply to contacts who've messaged you first (opt-in rule).

### 4. Environment Variables
```env
# .env.local — for non-sensitive runtime config
NEXT_PUBLIC_APP_URL=https://app.letsrevra.com

# Server-side only — store in Supabase or env
LOOPMESSAGE_WEBHOOK_SECRET=your_webhook_auth_header_value
```

---

## Database Changes Needed

### `messages` table — add LoopMessages-specific fields

Current columns (already there):
- `id`, `workspace_id`, `lead_id`, `agent_id`, `conversation_id`, `channel`, `direction`, `body`, `media_url`, `external_id`, `external_status`, `ai_generated`, `ai_context`, `sent_at`, `created_at`

**Needed additions** (via ALTER):
```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS loopmessage_message_id TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS loopmessage_channel   TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_name          TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id            TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS effect                TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id           TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS language_code         TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS speech_text           TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read               BOOLEAN DEFAULT FALSE;
```

### `conversations` table — add tracking fields
```sql
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS thread_id   TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;
```

### `integrations` table — already has credentials JSONB, no schema change needed
Store LoopMessages config as:
```json
{
  "api_key": "lm_xxxxx",
  "webhook_header": "optional_custom_header_value",
  "default_sender": "sender_name_id_or_phone",
  "rcs_enabled": true,
  "whatsapp_enabled": false
}
```

---

## Files to Build

### 1. `lib/loopmessages/client.ts` — Core API client
Handles all outbound communication with LoopMessages.
- `sendMessage(params)` — single text message
- `sendVoiceMessage(contact, mediaUrl)` — audio message
- `sendReaction(contact, messageId, reaction)` — tapback reaction
- `showTyping(contact, sender, seconds)` — typing indicator
- `getMessageStatus(messageId)` — poll for delivery status
- `createCampaign(params)` — bulk campaign scheduling
- `getAudienceList(page, perPage)` — list contacts
- `checkAudienceStatus(contact)` — opt-in status
- `getMessageHistory(contact, page)` — full conversation history
- `getSenders()` — list sender names
- `getSenderPlans()` — available pricing plans

### 2. `app/api/webhooks/loopmessages/route.ts` — Webhook receiver
Handles all inbound events from LoopMessages.
- `POST` — receives all webhook events
- `message_inbound` → insert message record, update conversation, trigger Supabase realtime
- `message_delivered` → update message status
- `message_failed` → update message status + error code, log for review
- `message_reaction` → store reaction on message record
- `opt-in` → mark lead as opted-in / increase engagement score

**Critical behavior**: Must return 200 immediately and defer DB work to avoid LoopMessages timeout (15s limit).

### 3. `app/api/messages/send/route.ts` — Send message (user-facing)
- `POST` — authenticated user sends to a lead
- Validates body, channel, sender
- Calls `lib/loopmessages/client.ts` to send
- Stores message in `messages` table with `external_id` (LoopMessage message_id)
- Returns message_id for the client to poll/status

### 4. `app/api/conversations/[id]/messages/route.ts` — Enhance existing
- Already exists — update to also call LoopMessages history sync if needed
- Add support for reactions, voice messages

### 5. `app/api/loopmessages/senders/route.ts` — Sender management
- `GET` — list available sender names for workspace's LoopMessages account
- `POST` — order new sender (reaches LoopMessages API on behalf of workspace)

### 6. `app/api/loopmessages/audience/route.ts` — Audience sync
- `GET` — sync contact list from LoopMessages into our `leads` table
- `POST` — trigger opt-in URL generation

### 7. Supabase Realtime — Live message updates
On the frontend pages (`conversations/page.tsx`, `texts/page.tsx`):
- Subscribe to `messages` table for the active lead/conversation
- When webhook inserts a row, Supabase Realtime pushes to the UI instantly

---

## Implementation Order

```
Step 1  ── Database ALTER statements (run in Supabase SQL Editor)
Step 2  ── lib/loopmessages/client.ts  (core API client)
Step 3  ── app/api/webhooks/loopmessages/route.ts  (webhook handler)
Step 4  ── app/api/messages/send/route.ts  (send message endpoint)
Step 5  ── Frontend: wire send button to new API
Step 6  ── Supabase Realtime subscription on conversation/message pages
Step 7  ── app/api/loopmessages/senders/route.ts  (sender list + order)
Step 8  ── app/api/loopmessages/audience/route.ts  (contact sync)
Step 9  ── Optional: bulk campaigns via LoopMessages campaigns API
```

---

## Channel Behavior Summary

| Channel | Can initiate? | Supports text | Supports media | Supports effects | Supports reactions |
|---------|-------------|--------------|----------------|-----------------|-------------------|
| iMessage | No (opt-in only) | ✅ | ✅ (images/audio) | ✅ (14 effects) | ✅ (tapbacks) |
| SMS | No (opt-in only) | ✅ | ✅ (MMS only) | ❌ | ❌ |
| RCS | No (opt-in only) | ✅ | ✅ (full rich) | ❌ | ❌ |
| WhatsApp | Yes (if enabled) | ✅ | ✅ | ❌ | ❌ |

**Critical constraint**: LoopMessages cannot cold-message. The contact must have first sent a message to your sender (opt-in). This is an Apple/Telco policy, not a LoopMessages limitation.

---

## Error Handling Priority

When LoopMessages returns errors or webhook delivers `message_failed`, map the `error_code` to human-readable messages:

| Code | Meaning | Action |
|------|---------|--------|
| 500 | Contact opted out | Stop sending, mark lead status |
| 520 | No opt-in yet | Queue message, send opt-in link |
| 540 | Rate limited | Back off, retry with delay |
| 1020 | Not delivered (blocked) | Stop campaign to this contact |
| Others | Retry once after 30s | Log and alert |

---

## Prerequisite: Run This SQL First

Before any code is deployed, run these ALTER statements in Supabase SQL Editor:

```sql
-- messages table — LoopMessages extensions
ALTER TABLE messages ADD COLUMN IF NOT EXISTS loopmessage_message_id TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS loopmessage_channel   TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_name          TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id            TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS effect                TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id           TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS language_code         TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS speech_text           TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read               BOOLEAN DEFAULT FALSE;

-- conversations table — tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS sender_name   TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS thread_id      TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS unread_count    INTEGER DEFAULT 0;
```