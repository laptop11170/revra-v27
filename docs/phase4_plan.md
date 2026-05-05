# Phase 4 Plan — RevRa CRM
*Build: Twilio Voice (Click-to-Call + WebRTC)*

---

## Phase 4 Goal

Implement outbound voice calling with Twilio. Users can click-to-call a lead, conduct the call in-browser via WebRTC, and have the call automatically summarized by AI.

---

## 4.1 Twilio Voice Architecture

```
User (Browser)                    Twilio                    Supabase
     │                              │                          │
     │  POST /api/calls/create       │                          │
     │  { lead_id }                 │                          │
     │──────────────────────────────►                          │
     │                              │                          │
     │  TwiML response              │                          │
     │  <Dial> + caller ID         │                          │
     │◄─────────────────────────────│                          │
     │                              │                          │
     │  POST /api/calls/twiml       │                          │
     │──────────────────────────────►                          │
     │                              │                          │
     │                              │  POST twilio.calls      │
     │                              │─────────────────────────►│
     │                              │                          │
     │◄─────────────────────────────│  Call SID                │
     │  Call connects               │                          │
     │                              │◄── Call events (webhook) │
     │                              │                          │
     │  Realtime: call_started      │                          │
     │◄─────────────────────────────│                          │
     │                              │  Insert call record      │
     │                              │                          │
     │  Call ends                   │                          │
     │                              │◄── Recording webhook     │
     │                              │                          │
     │                              │  POST /ai/summarize-call │
     │                              │──────────────────────────►│
     │                              │                          │
     │  Post-call form + AI summary │                          │
     │◄─────────────────────────────│                          │
```

---

## 4.2 TwiML Endpoint

**`GET /api/calls/twiml?call_sid=xxx`** — Returns TwiML for call routing

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- For outbound: dial to agent's registered phone or browser -->
  <Dial callerId="+15551234567" record="record-from-answer" timeout="30">
    <Client>agent-{{userId}}</Client>
  </Dial>
  <!-- Fallback to external phone if WebRTC unavailable -->
  <Dial callerId="+15551234567">
    {{ agentPhoneNumber }}
  </Dial>
</Response>
```

**`POST /api/calls/twiml`** — Twilio status callback
```
Handles: initiated, ringing, answered, completed, busy, no_answer, failed
Action: Update call record status
Trigger: If completed → enqueue AI summarization
```

---

## 4.3 Click-to-Call Flow

### 4.3.1 `POST /api/calls/create`

```typescript
// Input: { lead_id }
// Flow:
1. Get lead phone + assigned agent phone
2. Get workspace Twilio credentials
3. POST /api/calls/twiml to get TwiML URL
4. Call twilio.calls.create({
     from: workspace.twilio_phone_number,
     to: lead.phone,
     url: `${APP_URL}/api/calls/twiml?call_sid=${callSid}`
   })
5. Create call record in DB (status: 'initiated')
6. Return { call_sid, status }
```

### 4.3.2 UI: Call Button

In `LeadProfileSlideOver` and lead list:
```tsx
<Button onClick={() => placeCall(lead.id)}>
  <Phone size={14} /> Call
</Button>
```

### 4.3.3 `app/user/calls/active/page.tsx` Enhancement

Currently shows talking points UI. Wire to real Twilio client:
```tsx
// Initialize Twilio Client
useEffect(() => {
  const device = new Device(token); // token from /api/twilio/token
  device.on('ready', () => device.connect());
  device.on('call', (call) => { setActiveCall(call); });
  return () => device.destroy();
}, []);

// Handle call events
call.on('accept', () => setStatus('connected'));
call.on('disconnect', () => handlePostCall(call));
```

---

## 4.4 WebRTC Softphone

### 4.4.1 Token Endpoint

**`GET /api/twilio/token`** — Return Twilio capability token

```typescript
// Response: { token: "eyJ...", expiresIn: 86400 }
```

### 4.4.2 Softphone Component

**`components/features/calls/Softphone.tsx`**
```
Features:
  - Dial pad for manual number entry
  - Call timer
  - Mute / Hold / Transfer buttons
  - Note-taking during call
  - Disposition buttons (Interested, Not Interested, Callback, etc.)
  - Call recording playback
```

### 4.4.3 Active Call Page Enhancement

`app/user/calls/active/page.tsx` — add real Twilio connection:
```tsx
// Current: static talking points + notes
// Enhanced: WebRTC connection + real call state
```

---

## 4.5 Call Recording

### 4.5.1 Recording Storage

Twilio posts recording URL via webhook:
```
POST /api/webhooks/twilio-voice
  → Download from Twilio
  → Upload to Supabase Storage (private bucket)
  → Update calls.recording_url
```

### 4.5.2 Recording Playback

In call history (`/user/calls`):
```tsx
<audio controls src={call.recording_url} />
```

### 4.5.3 Storage Bucket

```sql
-- Supabase Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('call-recordings', 'call-recordings', false);
-- RLS policy: users can only access recordings for their workspace
```

---

## 4.6 AI Call Summarization

### 4.6.1 Summarization Endpoint

**`POST /api/ai/summarize-call`**
```
Input: { call_id }
Flow:
  1. Fetch recording URL from calls table
  2. Download audio (if not already transcribed)
  3. Call LLM with summarization prompt
  4. Update calls.ai_summary, calls.ai_disposition, calls.ai_next_steps
```

**Prompt:**
```
You are RevRa, an AI sales assistant. Summarize this insurance call:

Agent: [agent_name]
Lead: [lead_name]
Duration: [duration]

Transcript: [transcription or "Recording available"]

Provide:
1. Summary (2-3 sentences)
2. Disposition: interested | not_interested | callback | not_reachable
3. Next steps (1-2 action items)
4. Key topics discussed
```

### 4.6.2 Post-Call Form Enhancement

`PostCallForm` already exists. Wire to real data:
- Auto-fill disposition from AI
- Show AI summary
- Agent can edit before saving

---

## 4.7 Inbound Voice (Optional for Phase 4)

### 4.7.1 Twilio Inbound Route

Workspace gets a Twilio phone number. Inbound calls:
```
Twilio → POST /api/calls/inbound-twi ml
  → Lookup lead by caller ID
  → Route to assigned agent (WebRTC or forward to phone)
  → Return TwiML with <Dial>
```

---

## 4.8 What's Built at End of Phase 4

| Feature | Status |
|---------|--------|
| Click-to-call from lead | ✅ Built |
| TwiML endpoint | ✅ Built |
| Call status webhook | ✅ Built |
| WebRTC softphone | ✅ Built |
| Call recording | ✅ Built |
| Recording storage | ✅ Built |
| AI call summarization | ✅ Built |
| Post-call form (enhanced) | ✅ Built |
| Call history with recordings | ✅ Built |
| Call disposition analytics | ✅ Built |

---

## Deliverables

| File | Description |
|------|-------------|
| `lib/twilio/voice.ts` | Twilio Voice client |
| `app/api/calls/create/route.ts` | Create outbound call |
| `app/api/calls/twiml/route.ts` | TwiML generator |
| `app/api/webhooks/twilio-voice/route.ts` | Voice webhook |
| `app/api/twilio/token/route.ts` | WebRTC token |
| `app/api/ai/summarize-call/route.ts` | AI summarization |
| `components/features/calls/Softphone.tsx` | WebRTC dialer |
| `app/user/calls/active/page.tsx` (updated) | Real WebRTC integration |

---

## Dependencies

- Twilio account with Voice capability
- Twilio Client SDK (`twilio-client`)
- Supabase Storage bucket for recordings
- LLM API for summarization