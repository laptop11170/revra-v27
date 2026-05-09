API Reference
/
v1
base url
https://lunarolivia.com/api/v1/external
v1.0.0
Mission control
for the Olivia API.
Authenticate with an API key, mint connect links for clients, push leads into the platform. Built for partner integrations and automation.

REST
JSON
Single-tenant API keys
§001
Authentication
All API requests must include your API key in the x-api-key header. Create keys from the API Keys tab above — the raw value is shown exactly once.

HEADERCopy
x-api-key: oa_live_your_key_here
§002
Quick Start
Connect a Google Calendar to a client in four steps. Use the wizard below to mint a working link without leaving this page.

Step 01
Issue an API key.

Go to the API Keys tab. Create a key and tick the Mint Connect Links permission. Copy the raw key — it's only shown once.

Step 02
Pick a client and redirect URL.

Use the wizard below to choose which client the calendar attaches to and where the user lands after Google consent. Redirect URL is optional.

Step 03
Generate the link.

Click Generate link. You'll get a single-use URL that expires in 24 hours.

Step 04
Send the link.

Email it, embed it in your onboarding flow, or paste it into your CRM. The user clicks it, approves Google, and the calendar is bound to the selected client.





Connect Wizard
POST /v1/calendar/connect-link
Link generated
https://www.lunarolivia.com/external-connect/google?token=oa_xc_6ed41845d037d729f0283a28bbfe909c8da0068f610acd1029c006236aa39cf1
Copy
Expires 5/10/2026, 7:18:20 PM
Token oa_xc_6ed418
← Generate another
§003
Endpoints
8 endpoints. All paths relative to /api/v1/external.


E.01
POST
/leads
Create Lead
Create a new lead in your agency. Requires at least an email or phone number.

Required scopes
leads:write
Request body
Field	Type	Required	Description
first_name	string	optional	Lead's first name
last_name	string	optional	Lead's last name
email	string	optional	Email address (required if no phone)
phone	string	optional	Phone number (required if no email)
client_id	uuid	optional	Assign lead to a specific client
status	string	optional	Lead status: new, contacted, qualified, booked, converted, lost, dnc. Default: new
tags	string[]	optional	Array of tag strings
custom_fields	object	optional	Arbitrary key-value metadata
Example
Pre-fill client_id

Avi
Applied
×
cURL
JavaScript
Python
Copy
curl -X POST "https://lunarolivia.com/api/v1/external/leads" \
  -H "x-api-key: oa_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "tags": [
    "inbound",
    "high-priority"
  ],
  "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd"
}'
Response
201
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "source": "api",
  "tags": [
    "inbound",
    "high-priority"
  ],
  "custom_fields": {},
  "created_at": "2026-03-30T12:00:00.000Z"
}

javascript

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/leads`, {
  method: "POST",
  headers: {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "status": "new",
    "tags": [
        "inbound",
        "high-priority"
    ],
    "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd"
}),
});

const data = await response.json();
console.log(data);
Response
201
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "source": "api",
  "tags": [
    "inbound",
    "high-priority"
  ],
  "custom_fields": {},
  "created_at": "2026-03-30T12:00:00.000Z"
}

python

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
}

response = requests.post(
    f"{base_url}/leads",
    headers=headers,
    json={
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "status": "new",
    "tags": [
        "inbound",
        "high-priority"
    ],
    "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd"
},
)

print(response.json())
Response
201
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "source": "api",
  "tags": [
    "inbound",
    "high-priority"
  ],
  "custom_fields": {},
  "created_at": "2026-03-30T12:00:00.000Z"
}


E.02
GET
/leads
List Leads
Retrieve a paginated list of leads with optional filtering.

Required scopes
leads:read
Query parameters
Field	Type	Description
page	integer	Page number (default: 1)
limit	integer	Results per page, max 100 (default: 25)
client_id	uuid	Filter by client
status	string	Filter by lead status
search	string	Search by name, email, or phone
Example
Pre-fill client_id

Avi
Applied
×
cURL
JavaScript
Python
Copy
curl -X GET "https://lunarolivia.com/api/v1/external/leads?page=1&limit=25&client_id=58c01c29-c0c9-4e53-bd68-b15f2ad154bd" \
  -H "x-api-key: oa_live_your_key_here"
Response
200
Copy
{
  "leads": [
    {
      "id": "a1b2c3d4-...",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "status": "new",
      "source": "api",
      "created_at": "2026-03-30T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}

javascript

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/leads?page=1&limit=25&client_id=58c01c29-c0c9-4e53-bd68-b15f2ad154bd`, {
  headers: {
    "x-api-key": "oa_live_your_key_here",
  },
});

const data = await response.json();
console.log(data);
Response
200
Copy
{
  "leads": [
    {
      "id": "a1b2c3d4-...",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "status": "new",
      "source": "api",
      "created_at": "2026-03-30T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}

python

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {"x-api-key": "oa_live_your_key_here"}

response = requests.get(
    f"{base_url}/leads?page=1&limit=25&client_id=58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
    headers=headers,
)

print(response.json())
Response
200
Copy
{
  "leads": [
    {
      "id": "a1b2c3d4-...",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "status": "new",
      "source": "api",
      "created_at": "2026-03-30T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}


E.03
GET
/leads/:id
Get Lead

Retrieve a single lead by its ID.

Required scopes
leads:read
Example
cURL
JavaScript
Python
Copy
curl -X GET "https://lunarolivia.com/api/v1/external/leads/{lead_id}" \
  -H "x-api-key: oa_live_your_key_here"
Response
200
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "source": "api",
  "tags": [
    "inbound"
  ],
  "custom_fields": {},
  "created_at": "2026-03-30T12:00:00.000Z"
}


javascript

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/leads/${leadId}`, {
  headers: {
    "x-api-key": "oa_live_your_key_here",
  },
});

const data = await response.json();
console.log(data);
Response
200
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "source": "api",
  "tags": [
    "inbound"
  ],
  "custom_fields": {},
  "created_at": "2026-03-30T12:00:00.000Z"
}

python

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {"x-api-key": "oa_live_your_key_here"}

response = requests.get(
    f"{base_url}/leads/{lead_id}",
    headers=headers,
)

print(response.json())
Response
200
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "status": "new",
  "source": "api",
  "tags": [
    "inbound"
  ],
  "custom_fields": {},
  "created_at": "2026-03-30T12:00:00.000Z"
}


E.04
GET
/clients
List Clients
Retrieve a paginated list of clients in your agency. Filtered by status and free-text search across name + slug.

Required scopes
clients:read
Query parameters
Field	Type	Description
page	integer	Page number (default: 1)
limit	integer	Results per page, max 100 (default: 25)
status	string	Filter by status: "active" | "paused" | "archived"
search	string	Search by name or slug (case-insensitive)
Example
cURL
JavaScript
Python
Copy
curl -X GET "https://lunarolivia.com/api/v1/external/clients?page=1&limit=25" \
  -H "x-api-key: oa_live_your_key_here"
Response
200
Copy
{
  "clients": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active",
      "industry": "saas",
      "website": "https://acme.com",
      "timezone": "America/New_York",
      "created_at": "2026-03-30T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}

javascript:

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/clients?page=1&limit=25`, {
  headers: {
    "x-api-key": "oa_live_your_key_here",
  },
});

const data = await response.json();
console.log(data);
Response
200
Copy
{
  "clients": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active",
      "industry": "saas",
      "website": "https://acme.com",
      "timezone": "America/New_York",
      "created_at": "2026-03-30T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}

python:

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {"x-api-key": "oa_live_your_key_here"}

response = requests.get(
    f"{base_url}/clients?page=1&limit=25",
    headers=headers,
)

print(response.json())
Response
200
Copy
{
  "clients": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active",
      "industry": "saas",
      "website": "https://acme.com",
      "timezone": "America/New_York",
      "created_at": "2026-03-30T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}

E.05
POST
/clients
Create Client
Create a new client. Optionally pass clone_from_client_id to copy voice config + agents + workflows from an existing client in your agency. Returns clone_summary on success or clone_error on partial failure.

Required scopes
clients:write
Request body
Field	Type	Required	Description
name	string	required	Display name (1..255 chars)
slug	string	optional	URL-safe slug; auto-derived from name if omitted
status	string	optional	Initial status: "active" | "paused" | "archived" (default: active)
industry	string	optional	Free-form industry label
website	string	optional	Valid URL
timezone	string	optional	IANA timezone (default: America/New_York)
clone_from_client_id	uuid	optional	Source client UUID. When set, voice config + agents + workflows are copied. Source must be in your agency.
Example
cURL
JavaScript
Python
Copy
curl -X POST "https://lunarolivia.com/api/v1/external/clients" \
  -H "x-api-key: oa_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Acme Corp",
  "timezone": "America/New_York",
  "clone_from_client_id": "00000000-0000-0000-0000-000000000000"
}'
Response
201
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "status": "active",
  "industry": null,
  "website": null,
  "timezone": "America/New_York",
  "created_at": "2026-05-05T12:00:00.000Z",
  "clone_summary": {
    "agents_copied": 3,
    "workflows_copied": 5,
    "voice_config_cloned": true,
    "source_name": "Source Client"
  }
}

javascript:

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/clients`, {
  method: "POST",
  headers: {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "name": "Acme Corp",
    "timezone": "America/New_York",
    "clone_from_client_id": "00000000-0000-0000-0000-000000000000"
}),
});

const data = await response.json();
console.log(data);
Response
201
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "status": "active",
  "industry": null,
  "website": null,
  "timezone": "America/New_York",
  "created_at": "2026-05-05T12:00:00.000Z",
  "clone_summary": {
    "agents_copied": 3,
    "workflows_copied": 5,
    "voice_config_cloned": true,
    "source_name": "Source Client"
  }
}

python:

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
}

response = requests.post(
    f"{base_url}/clients",
    headers=headers,
    json={
    "name": "Acme Corp",
    "timezone": "America/New_York",
    "clone_from_client_id": "00000000-0000-0000-0000-000000000000"
},
)

print(response.json())
Response
201
Copy
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "status": "active",
  "industry": null,
  "website": null,
  "timezone": "America/New_York",
  "created_at": "2026-05-05T12:00:00.000Z",
  "clone_summary": {
    "agents_copied": 3,
    "workflows_copied": 5,
    "voice_config_cloned": true,
    "source_name": "Source Client"
  }
}


E.06
POST
/phone-numbers
Import Phone Number
Import a phone number into a client via Retell + Twilio SIP (BYOC). Requires an active payment method on your agency.

Required scopes
phones:write
Request body
Field	Type	Required	Description
client_id	uuid	required	Client this phone attaches to
phone_number	string	required	E.164 format (e.g. +15551234567)
termination_uri	string	required	Twilio SIP termination URI
sip_trunk_auth_username	string	optional	Twilio SIP auth username
sip_trunk_auth_password	string	optional	Twilio SIP auth password
nickname	string	optional	Display label (max 255 chars)
Example
Pre-fill client_id

Avi
Applied
×
cURL
JavaScript
Python
Copy
curl -X POST "https://lunarolivia.com/api/v1/external/phone-numbers" \
  -H "x-api-key: oa_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
  "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
  "phone_number": "+15551234567",
  "termination_uri": "olivia.pstn.twilio.com",
  "nickname": "Acme main line"
}'
Response
201
Copy
{
  "id": "p1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "agency_id": "agency-uuid",
  "client_id": "00000000-0000-0000-0000-000000000000",
  "phone_number": "+15551234567",
  "provider": "twilio",
  "external_phone_id": "+15551234567",
  "is_active": true,
  "created_at": "2026-05-05T12:00:00.000Z"
}

javascript:

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/phone-numbers`, {
  method: "POST",
  headers: {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
    "phone_number": "+15551234567",
    "termination_uri": "olivia.pstn.twilio.com",
    "nickname": "Acme main line"
}),
});

const data = await response.json();
console.log(data);
Response
201
Copy
{
  "id": "p1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "agency_id": "agency-uuid",
  "client_id": "00000000-0000-0000-0000-000000000000",
  "phone_number": "+15551234567",
  "provider": "twilio",
  "external_phone_id": "+15551234567",
  "is_active": true,
  "created_at": "2026-05-05T12:00:00.000Z"
}

python:

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
}

response = requests.post(
    f"{base_url}/phone-numbers",
    headers=headers,
    json={
    "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
    "phone_number": "+15551234567",
    "termination_uri": "olivia.pstn.twilio.com",
    "nickname": "Acme main line"
},
)

print(response.json())
Response
201
Copy
{
  "id": "p1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "agency_id": "agency-uuid",
  "client_id": "00000000-0000-0000-0000-000000000000",
  "phone_number": "+15551234567",
  "provider": "twilio",
  "external_phone_id": "+15551234567",
  "is_active": true,
  "created_at": "2026-05-05T12:00:00.000Z"
}

E.07
POST
/calendar/connect-link
Mint Calendar Connect Link
Mint a single-use link the user clicks to connect a Google Calendar to a specific client. Defaults to a 24h TTL; pass expires_in_seconds to customize, or null to mint a never-expiring link (still single-use). After Google consent, the user is redirected to your supplied redirect_url with ?status=connected (or ?status=error&reason=...).

Required scopes
integrations:connect
Request body
Field	Type	Required	Description
client_id	uuid	required	Client UUID this calendar attaches to
redirect_url	string	optional	Where to send the user after Google consent. Must be https (http://localhost in dev).
provider	string	optional	Calendar provider. v1: only "google_calendar" (default)
expires_in_seconds	integer | null	optional	TTL in seconds. Omit for the 24h default. Pass null for a never-expiring link (still single-use, stops working when consumed). Capped at 31536000 (1 year).
Example
Pre-fill client_id

Avi
Applied
×
cURL
JavaScript
Python
Copy
curl -X POST "https://lunarolivia.com/api/v1/external/calendar/connect-link" \
  -H "x-api-key: oa_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
  "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
  "redirect_url": "https://your-tool.example.com/calendar-connected",
  "expires_in_seconds": 604800
}'
Response
201
Copy
{
  "link": "https://lunarolivia.com/external-connect/google?token=oa_xc_...",
  "expires_at": "2026-05-12T20:30:00.000Z",
  "token_prefix": "oa_xc_8a4f2c"
}

javascript:


const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/calendar/connect-link`, {
  method: "POST",
  headers: {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
    "redirect_url": "https://your-tool.example.com/calendar-connected",
    "expires_in_seconds": 604800
}),
});

const data = await response.json();
console.log(data);
Response
201
Copy
{
  "link": "https://lunarolivia.com/external-connect/google?token=oa_xc_...",
  "expires_at": "2026-05-12T20:30:00.000Z",
  "token_prefix": "oa_xc_8a4f2c"
}

python:
import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
}

response = requests.post(
    f"{base_url}/calendar/connect-link",
    headers=headers,
    json={
    "client_id": "58c01c29-c0c9-4e53-bd68-b15f2ad154bd",
    "redirect_url": "https://your-tool.example.com/calendar-connected",
    "expires_in_seconds": 604800
},
)

print(response.json())
Response
201
Copy
{
  "link": "https://lunarolivia.com/external-connect/google?token=oa_xc_...",
  "expires_at": "2026-05-12T20:30:00.000Z",
  "token_prefix": "oa_xc_8a4f2c"
}


E.08
POST
/integrations/messaging/connect-link
Mint Messaging Connect Link
Mint a single-use link the user clicks to connect Instagram, WhatsApp, Facebook Messenger, or Telegram via Zernio's OAuth. Defaults to a 24h TTL; pass expires_in_seconds: null to mint a never-expiring link (still single-use). After Zernio consent the user is redirected to your supplied redirect_url with ?status=connected (or ?status=error&reason=...).

Required scopes
integrations:connect
Request body
Field	Type	Required	Description
client_id	uuid	required	Client UUID this messaging account attaches to
platform	string	required	One of: "instagram" | "whatsapp" | "facebook_messenger" | "telegram"
redirect_url	string	optional	Where to send the user after Zernio consent. https only (http://localhost in dev).
expires_in_seconds	integer | null	optional	TTL in seconds. Omit for the 24h default. Pass null for a never-expiring link (single-use, stops working when consumed). Capped at 31536000 (1 year).
Example

Pre-fill client_id

Avi
Apply
cURL
JavaScript
Python
Copy
curl -X POST "https://lunarolivia.com/api/v1/external/integrations/messaging/connect-link" \
  -H "x-api-key: oa_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
  "client_id": "00000000-0000-0000-0000-000000000000",
  "platform": "instagram",
  "redirect_url": "https://your-tool.example.com/messaging-connected"
}'
Response
201
Copy
{
  "link": "https://lunarolivia.com/external-connect/messaging?token=oa_xc_...",
  "expires_at": "2026-05-06T20:30:00.000Z",
  "token_prefix": "oa_xc_8a4f2c"
}

javascript:

const baseUrl = "https://lunarolivia.com/api/v1/external";

const response = await fetch(`${baseUrl}/integrations/messaging/connect-link`, {
  method: "POST",
  headers: {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "client_id": "00000000-0000-0000-0000-000000000000",
    "platform": "instagram",
    "redirect_url": "https://your-tool.example.com/messaging-connected"
}),
});

const data = await response.json();
console.log(data);
Response
201
Copy
{
  "link": "https://lunarolivia.com/external-connect/messaging?token=oa_xc_...",
  "expires_at": "2026-05-06T20:30:00.000Z",
  "token_prefix": "oa_xc_8a4f2c"
}

python:

import requests

base_url = "https://lunarolivia.com/api/v1/external"
headers = {
    "x-api-key": "oa_live_your_key_here",
    "Content-Type": "application/json",
}

response = requests.post(
    f"{base_url}/integrations/messaging/connect-link",
    headers=headers,
    json={
    "client_id": "00000000-0000-0000-0000-000000000000",
    "platform": "instagram",
    "redirect_url": "https://your-tool.example.com/messaging-connected"
},
)

print(response.json())
Response
201
Copy
{
  "link": "https://lunarolivia.com/external-connect/messaging?token=oa_xc_...",
  "expires_at": "2026-05-06T20:30:00.000Z",
  "token_prefix": "oa_xc_8a4f2c"
}


§004
Errors
Errors return JSON with an error message and (when applicable) a machine-readable code.

400
Bad Request
Invalid or missing parameters.

401
Unauthorized
Invalid, revoked, or expired API key.

403
Forbidden
API key missing required scope.

404
Not Found
Resource does not exist in your agency.

409
Conflict
Duplicate lead (same email/phone for client).

429
Too Many Requests
Rate limit reached. Back off and retry.

500
Internal Error
Something went wrong on our end.

502
Bad Gateway
An upstream service is unavailable.

Error response shape
JSONCopy
{
  "error": "Lead not found",
  "code": "not_found"
}