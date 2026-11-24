import "server-only";

import { createHash } from "node:crypto";
import type { AdapterResult } from "@/domain/lead";
import { notConfiguredResult } from "@/adapters/errors";
import { validMetaPixelId } from "@/lib/analytics-config";
import { env } from "@/lib/env";
import { features } from "@/lib/features";
import { normalizeSaudiMobile } from "@/lib/phone";

/**
 * Meta Conversions API — the server-side half of the Meta Pixel.
 *
 * The browser Pixel misses conversions to ad blockers, iOS tracking limits and
 * tabs closed before the success callback runs. Sending the same event from
 * the server, with the same `event_id`, lets Meta fill those gaps while still
 * counting each conversion once.
 *
 * Runs only when `FEATURE_ANALYTICS=1`, the Pixel id is valid and
 * `META_CAPI_ACCESS_TOKEN` is set — otherwise `not_configured`, never a throw.
 * Consent is enforced by the caller (`reportConversion` in
 * `app/api/zoho/_helpers.ts`), which only calls this when the visitor
 * accepted cookies.
 *
 * Bump the Graph API version deliberately; Meta supports each for ~2 years.
 */
const GRAPH_API_VERSION = "v26.0";

/** A slow Meta response must never hold a serverless function open. */
const REQUEST_TIMEOUT_MS = 5_000;

export type MetaUserInput = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIp?: string;
  userAgent?: string;
  /** `_fbp` cookie — Meta's browser id. Sent as-is (not hashed). */
  fbp?: string;
  /** `_fbc` cookie, or one built from an `fbclid`. Sent as-is (not hashed). */
  fbc?: string;
};

export type MetaServerEvent = {
  eventName: string;
  /** Same value the browser passed to `fbq(..., { eventID })`. */
  eventId: string;
  eventSourceUrl?: string;
  user: MetaUserInput;
  customData?: Record<string, string>;
};

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Meta's normalisation: trimmed, lowercase, then SHA-256. */
function hashText(value: string | undefined): string[] | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized ? [sha256(normalized)] : undefined;
}

/**
 * Meta wants digits only, with the country code. Saudi local formats
 * (`05…`) are expanded to `9665…`; anything already international is kept.
 * A number that cannot be normalised is omitted rather than sent wrong.
 */
function hashPhone(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const e164 = normalizeSaudiMobile(value);
  const digits = e164?.replace(/^\+/, "");
  return digits ? [sha256(digits)] : undefined;
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(
    features.analytics &&
    validMetaPixelId(env.metaPixelId()) &&
    env.metaCapiAccessToken(),
  );
}

export async function sendMetaServerEvent(
  event: MetaServerEvent,
): Promise<AdapterResult> {
  const pixelId = validMetaPixelId(env.metaPixelId());
  const accessToken = env.metaCapiAccessToken();
  if (!features.analytics || !pixelId || !accessToken) {
    return notConfiguredResult("Meta Conversions API");
  }

  const { user } = event;
  const userData = {
    em: hashText(user.email),
    ph: hashPhone(user.phone),
    fn: hashText(user.firstName),
    ln: hashText(user.lastName),
    client_ip_address: user.clientIp,
    client_user_agent: user.userAgent,
    fbp: user.fbp,
    fbc: user.fbc,
  };

  const testEventCode = env.metaCapiTestEventCode();
  const body = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: event.eventSourceUrl,
        user_data: userData,
        custom_data: event.customData,
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
    // In the body, not the query string, so it stays out of URL logs.
    access_token: accessToken,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      // Meta's error message names the problem (bad token, bad field) and
      // never echoes user data, so it is safe to surface in logs.
      const detail = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      return {
        ok: false,
        code: "upstream",
        message: `Meta CAPI ${res.status}: ${detail?.error?.message ?? "request failed"}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      code: "upstream",
      message: error instanceof Error ? error.message : "Meta CAPI request failed",
    };
  }
}
