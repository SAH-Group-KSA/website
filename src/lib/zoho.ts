/**
 * Zoho API client — server-only.
 * Token cache + CRM (Phase 2) + Campaigns newsletter (Phase 3).
 */

import { env } from "@/lib/env";

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.sa/oauth/v2/token";

let cachedToken: { token: string; expiresAt: number; scope?: string } | null = null;

export type ZohoCrmResult = { ok: true; id?: string } | { ok: false; error: string };

export type ZohoCampaignsResult = { ok: true } | { ok: false; error: string };

export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? trimmed;
  const lastName = parts.slice(1).join(" ") || "-";
  return { firstName, lastName };
}

export function isZohoConfigured(): boolean {
  return Boolean(env.zohoClientId() && env.zohoClientSecret() && env.zohoRefreshToken());
}

export function isNewsletterConfigured(): boolean {
  return isZohoConfigured() && Boolean(env.zohoCampaignsListKey());
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = env.zohoClientId();
  const clientSecret = env.zohoClientSecret();
  const refreshToken = env.zohoRefreshToken();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho OAuth credentials are not configured");
  }

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const res = await fetch(ZOHO_ACCOUNTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    const zohoError = data.error ?? `HTTP ${res.status}`;
    console.error("[zoho] token refresh failed:", zohoError);
    throw new Error(`Failed to refresh Zoho access token (${zohoError})`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    scope: data.scope,
  };

  return cachedToken.token;
}

/** Preferred scope in API Console for newsletter listsubscribe. */
const CAMPAIGNS_CONTACT_SCOPE = "ZohoCampaigns.contact.ALL";

/** Scopes that satisfy listsubscribe (ALL is available in API Console). */
const CAMPAIGNS_SUBSCRIBE_SCOPES = [
  CAMPAIGNS_CONTACT_SCOPE,
  "ZohoCampaigns.contact.WRITE",
  "ZohoCampaigns.contact.CREATE-UPDATE",
  "ZohoCampaigns.contact.UPDATE",
] as const;

function parseZohoTokenScopes(scope: string): Set<string> {
  return new Set(
    scope
      .split(/[, ]+/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function hasCampaignsSubscribeScope(scope?: string): boolean {
  if (!scope) return false;
  const parsed = parseZohoTokenScopes(scope);
  if (CAMPAIGNS_SUBSCRIBE_SCOPES.some((s) => parsed.has(s))) return true;
  // Fallback when Zoho returns scopes without clean comma separation.
  return CAMPAIGNS_SUBSCRIBE_SCOPES.some((s) => scope.includes(s));
}

async function getTokenScope(): Promise<string | undefined> {
  if (cachedToken?.scope) return cachedToken.scope;
  await getAccessToken();
  return cachedToken?.scope;
}

type ZohoRecordResponse = {
  data?: Array<{
    code?: string;
    details?: { id?: string };
    message?: string;
    status?: string;
  }>;
};

async function createCrmRecord(
  module: string,
  fields: Record<string, unknown>,
): Promise<ZohoCrmResult> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${env.zohoApiBase()}/crm/v3/${module}`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [fields] }),
    });

    const body = (await res.json()) as ZohoRecordResponse;

    if (!res.ok) {
      console.error(`[zoho] CRM ${module} POST failed:`, res.status, body);
      return { ok: false, error: `CRM API error (${res.status})` };
    }

    const record = body.data?.[0];
    if (record?.status === "success" || record?.code === "SUCCESS") {
      return { ok: true, id: record.details?.id };
    }

    console.error(`[zoho] CRM ${module} unexpected response:`, body);
    return {
      ok: false,
      error: record?.message ?? "Unexpected CRM response",
    };
  } catch (err) {
    console.error(`[zoho] CRM ${module} request error:`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function createCrmLead(
  fields: Record<string, unknown>,
): Promise<ZohoCrmResult> {
  return createCrmRecord("Leads", fields);
}

export async function createCrmApplication(
  fields: Record<string, unknown>,
): Promise<ZohoCrmResult> {
  return createCrmRecord("Applications", fields);
}

export async function createCrmContact(
  fields: Record<string, unknown>,
): Promise<ZohoCrmResult> {
  return createCrmRecord("Contacts", fields);
}

async function updateCrmRecord(
  module: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<ZohoCrmResult> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${env.zohoApiBase()}/crm/v3/${module}`, {
      method: "PUT",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [{ id, ...fields }] }),
    });

    const body = (await res.json()) as ZohoRecordResponse;

    if (!res.ok) {
      console.error(`[zoho] CRM ${module} PUT failed:`, res.status, body);
      return { ok: false, error: `CRM API error (${res.status})` };
    }

    const record = body.data?.[0];
    if (record?.status === "success" || record?.code === "SUCCESS") {
      return { ok: true, id: record.details?.id ?? id };
    }

    console.error(`[zoho] CRM ${module} unexpected update response:`, body);
    return {
      ok: false,
      error: record?.message ?? "Unexpected CRM response",
    };
  } catch (err) {
    console.error(`[zoho] CRM ${module} update error:`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateCrmContact(
  id: string,
  fields: Record<string, unknown>,
): Promise<ZohoCrmResult> {
  return updateCrmRecord("Contacts", id, fields);
}

type CampaignsSubscribeResponse = {
  status?: string;
  message?: string;
  code?: string;
};

function campaignsSubscribeError(
  data: CampaignsSubscribeResponse,
  tokenScope?: string,
): string {
  const code = String(data.code ?? (data as { Code?: string }).Code ?? "");
  if (code === "1007") {
    if (!tokenScope) {
      return (
        "Campaigns authorization failed (1007). Regenerate ZOHO_REFRESH_TOKEN " +
        `with ${CAMPAIGNS_CONTACT_SCOPE} (keep existing CRM scopes), verify ` +
        "ZOHO_CAMPAIGNS_LIST_KEY, and set ZOHO_CAMPAIGNS_API_BASE to " +
        "campaigns.zoho.sa for SA accounts."
      );
    }
    if (!hasCampaignsSubscribeScope(tokenScope)) {
      return (
        `Campaigns token scope is "${tokenScope}" but listsubscribe requires ` +
        `${CAMPAIGNS_CONTACT_SCOPE}. Add it in Zoho API Console, regenerate ` +
        "ZOHO_REFRESH_TOKEN, then restart the dev server."
      );
    }
    const campaignsBase = env.zohoCampaignsApiBase();
    return (
      "Campaigns authorization failed (1007). Zoho returns this for wrong " +
      "datacenter — verify ZOHO_CAMPAIGNS_API_BASE matches your account " +
      `(currently ${campaignsBase}), ZOHO_CAMPAIGNS_LIST_KEY, and that the list ` +
      "belongs to the same Campaigns account as the OAuth token."
    );
  }
  if (code === "1001" || code === "2002" || code === "2102" || code === "2501") {
    return "Invalid Campaigns list key. Copy List Key from Contacts → your list → Setup.";
  }
  return data.message ?? "Campaigns subscribe failed";
}
function isDuplicateSubscriberResponse(data: CampaignsSubscribeResponse): boolean {
  const message = (data.message ?? "").toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("already subscribed") ||
    message.includes("duplicate")
  );
}

export async function subscribeToCampaignsList(contact: {
  firstName: string;
  lastName: string;
  email: string;
  locale: "ar" | "en";
}): Promise<ZohoCampaignsResult> {
  const listKey = env.zohoCampaignsListKey();
  if (!listKey) {
    return { ok: false, error: "Campaigns list key is not configured" };
  }

  const { firstName, lastName, email, locale } = contact;

  try {
    const token = await getAccessToken();
    const url = new URL(`${env.zohoCampaignsApiBase()}/api/v1.1/json/listsubscribe`);
    // Zoho's documented JSON sample uses unquoted `{Contact Email:x}` in the query string.
    url.searchParams.set("resfmt", "JSON");
    url.searchParams.set("listkey", listKey);
    url.searchParams.set(
      "contactinfo",
      `{First Name:${firstName},Last Name:${lastName},Contact Email:${email},Locale:${locale}}`,
    );
    url.searchParams.set("source", "sah-website");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const raw = await res.text();
    let data: CampaignsSubscribeResponse;
    try {
      data = JSON.parse(raw) as CampaignsSubscribeResponse;
    } catch {
      console.error(
        "[zoho] Campaigns listsubscribe non-JSON response:",
        res.status,
        raw.slice(0, 200),
      );
      return {
        ok: false,
        error: `Campaigns API returned non-JSON (${res.status})`,
      };
    }

    if (data.status === "success" || isDuplicateSubscriberResponse(data)) {
      return { ok: true };
    }

    const tokenScope = await getTokenScope();
    console.error("[zoho] Campaigns listsubscribe failed:", res.status, data, {
      tokenScope,
    });
    return {
      ok: false,
      error: campaignsSubscribeError(data, tokenScope),
    };
  } catch (err) {
    console.error("[zoho] Campaigns request error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
