const BASE_URL = "https://lunarolivia.com/api/v1/external";

export interface EmmaClientRecord {
  id: string;
  name: string;
  slug?: string;
  status: string;
  industry?: string;
  website?: string;
  timezone: string;
  created_at: string;
}

export interface EmmaLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
}

export interface EmmaMessagingConnectLink {
  link: string;
  expires_at: string;
  token_prefix: string;
}

export interface EmmaCalendarConnectLink {
  link: string;
  expires_at: string;
  token_prefix: string;
}

export interface EmmaPhoneNumber {
  id: string;
  agency_id: string;
  client_id: string;
  phone_number: string;
  provider: string;
  external_phone_id: string;
  is_active: boolean;
  created_at: string;
}

export class EmmaAPIError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "EmmaAPIError";
    this.code = code;
    this.status = status;
  }
}

type LeadParams = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  client_id?: string;
  status?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
};

export class EmmaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      return this.request<T>(path, options);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new EmmaAPIError(
        (body as { error?: string }).error ?? "Emma API error",
        (body as { code?: string }).code ?? "unknown",
        res.status
      );
    }

    if (res.status === 204) return {} as T;
    return res.json() as T;
  }

  // ── Clients ─────────────────────────────────────────────────────────────

  listClients(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ clients: EmmaClientRecord[]; total: number; page: number; limit: number }> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    return this.request(`/clients?${qs}`);
  }

  createClient(params: {
    name: string;
    slug?: string;
    status?: string;
    industry?: string;
    website?: string;
    timezone?: string;
    clone_from_client_id?: string;
  }): Promise<EmmaClientRecord & { clone_summary?: unknown }> {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  getClient(clientId: string): Promise<EmmaClientRecord> {
    return this.request(`/clients/${clientId}`);
  }

  // ── Leads ───────────────────────────────────────────────────────────────

  createLead(params: LeadParams): Promise<EmmaLead> {
    return this.request("/leads", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  getLead(leadId: string): Promise<EmmaLead> {
    return this.request(`/leads/${leadId}`);
  }

  listLeads(params?: {
    page?: number;
    limit?: number;
    client_id?: string;
    status?: string;
    search?: string;
  }): Promise<{ leads: EmmaLead[]; total: number; page: number; limit: number }> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.client_id) qs.set("client_id", params.client_id);
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    return this.request(`/leads?${qs}`);
  }

  updateLead(
    leadId: string,
    params: Partial<LeadParams>
  ): Promise<EmmaLead> {
    return this.request(`/leads/${leadId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
    });
  }

  // ── Phone Numbers ───────────────────────────────────────────────────────

  createPhoneNumber(params: {
    client_id: string;
    phone_number: string;
    termination_uri: string;
    sip_trunk_auth_username?: string;
    sip_trunk_auth_password?: string;
    nickname?: string;
  }): Promise<EmmaPhoneNumber> {
    return this.request("/phone-numbers", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // ── Connect Links ───────────────────────────────────────────────────────

  mintMessagingConnectLink(params: {
    client_id: string;
    platform: "instagram" | "whatsapp" | "facebook_messenger" | "telegram";
    redirect_url?: string;
    expires_in_seconds?: number;
  }): Promise<EmmaMessagingConnectLink> {
    return this.request("/integrations/messaging/connect-link", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  mintCalendarConnectLink(params: {
    client_id: string;
    redirect_url?: string;
    expires_in_seconds?: number;
    provider?: string;
  }): Promise<EmmaCalendarConnectLink> {
    return this.request("/calendar/connect-link", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}

let _client: EmmaClient | null = null;

export function getEmmaClient(): EmmaClient {
  const apiKey = process.env.EMMA_API_KEY;
  if (!apiKey) {
    throw new EmmaAPIError(
      "EMMA_API_KEY is not configured. Set the EMMA_API_KEY environment variable.",
      "not_configured",
      500
    );
  }
  if (!_client) _client = new EmmaClient(apiKey);
  return _client;
}
