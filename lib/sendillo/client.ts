// lib/sendillo/client.ts
// Sendillo Bulk SMS API client — reads SENDILLO_API_KEY from env

const BASE_URL = "https://www.sendillo.com";

export class SendilloAPIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "SendilloAPIError";
  }
}

export interface SendilloMessage {
  from: string;
  to: string;
  body: string;
  clientRef?: string;
}

export interface SendilloBulkMessageItem extends SendilloMessage {
  clientRef: string;
}

export interface SendilloBulkResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    clientRef: string;
    success: boolean;
    error?: string;
  }>;
}

export interface PurchasedNumber {
  phoneNumber: string;
  label?: string;
  active: boolean;
}

export interface Brand {
  id: number;
  name: string;
}

export interface SendilloCampaign {
  id: number;
  name: string;
  status: string;
}

function getApiKey(): string {
  const key = process.env.SENDILLO_API_KEY;
  if (!key) throw new SendilloAPIError("SENDILLO_API_KEY is not set", 500, "MISSING_API_KEY");
  return key;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new SendilloAPIError(
      body || `Sendillo API error: ${response.status}`,
      response.status,
      `HTTP_${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

// ── Messaging ────────────────────────────────────────────────────────────────

export async function sendSMS(message: SendilloMessage): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/messages", {
    method: "POST",
    body: JSON.stringify(message),
  });
}

export async function sendBulkSMS(
  messages: SendilloBulkMessageItem[]
): Promise<SendilloBulkResult> {
  return request<SendilloBulkResult>("/api/v1/messages/bulk", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}

export async function sendMMS(
  message: SendilloMessage & { mediaUrls: string[] }
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/messages/mms", {
    method: "POST",
    body: JSON.stringify(message),
  });
}

// ── Purchased Numbers ─────────────────────────────────────────────────────────

export async function listPurchasedNumbers(): Promise<PurchasedNumber[]> {
  return request<PurchasedNumber[]>("/api/v1/numbers/purchased");
}

// ── Brands ───────────────────────────────────────────────────────────────────

export async function listBrands(): Promise<Brand[]> {
  return request<Brand[]>("/api/v1/brands");
}

// ── Campaigns (Sendillo-side, read-only) ─────────────────────────────────────

export async function listSendilloCampaigns(): Promise<SendilloCampaign[]> {
  return request<SendilloCampaign[]>("/api/v1/campaigns");
}

export async function getSendilloCampaign(
  campaignId: number
): Promise<SendilloCampaign> {
  return request<SendilloCampaign>(`/api/v1/campaigns/${campaignId}`);
}
