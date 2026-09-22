import type {
  CommunityApplication,
  ContactLead,
  DiscoveryLead,
  GroupInterestLead,
  NewsletterSubscribe,
  ProgramInterestLead,
  AdapterResult,
} from "@/domain/lead";
import type {
  AnalyticsEvent,
  AnalyticsEventMap,
} from "@/adapters/analytics/events";
import { track } from "@/adapters/analytics/track";
import { getAttribution } from "@/lib/attribution";

/**
 * Zoho CRM / Campaigns submissions via Route Handlers.
 * Always POST — `FEATURE_ZOHO_FORMS` / `FEATURE_NEWSLETTER` are gated on the
 * server (non-NEXT_PUBLIC_ env vars are not available in the browser).
 */

type ApiResponse =
  | { ok: true; id?: string }
  | {
      ok: false;
      code: "validation" | "upstream" | "not_configured";
      message?: string;
    };

async function postZohoForm(
  path: string,
  body: unknown,
): Promise<AdapterResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as ApiResponse;
    if (data.ok) return { ok: true, id: data.id };
    return {
      ok: false,
      code: data.code ?? "upstream",
      message: data.message ?? "Submission failed",
    };
  } catch {
    return {
      ok: false,
      code: "upstream",
      message: "Network error",
    };
  }
}

/**
 * POST, then fire the analytics event only if the submission succeeded.
 * Firing on attempt would count validation failures, upstream errors and
 * offline submissions as conversions.
 */
async function postAndTrack<E extends AnalyticsEvent>(
  path: string,
  body: object,
  event: E,
  props: AnalyticsEventMap[E],
): Promise<AdapterResult> {
  // First-touch acquisition, when the visitor consented and arrived with a
  // campaign or referrer. `getAttribution()` returns undefined otherwise, so
  // the key is simply absent and the payload is unchanged.
  const attribution = getAttribution();
  const payload = attribution ? { ...body, attribution } : body;

  const result = await postZohoForm(path, payload);
  if (result.ok) track(event, props);
  return result;
}

export async function submitDiscoveryLead(
  payload: DiscoveryLead,
): Promise<AdapterResult> {
  return postAndTrack("/api/zoho/discovery", payload, "lead_submitted", {
    kind: "discovery",
    locale: payload.locale,
  });
}

export async function submitContactLead(
  payload: ContactLead,
): Promise<AdapterResult> {
  return postAndTrack("/api/zoho/contact", payload, "lead_submitted", {
    kind: "contact",
    locale: payload.locale,
  });
}

export async function submitGroupInterest(
  payload: GroupInterestLead,
): Promise<AdapterResult> {
  return postAndTrack("/api/zoho/group", payload, "lead_submitted", {
    kind: "group",
    locale: payload.locale,
  });
}

export async function submitProgramInterest(
  payload: ProgramInterestLead,
): Promise<AdapterResult> {
  return postAndTrack("/api/zoho/program", payload, "lead_submitted", {
    kind: "program",
    locale: payload.locale,
    programId: payload.programId,
  });
}

export async function submitCommunityApplication(
  payload: CommunityApplication,
): Promise<AdapterResult> {
  return postAndTrack("/api/zoho/community", payload, "lead_submitted", {
    kind: "community",
    locale: payload.locale,
  });
}

export async function subscribeNewsletter(
  payload: NewsletterSubscribe,
): Promise<AdapterResult> {
  return postAndTrack("/api/newsletter", payload, "newsletter_subscribed", {
    locale: payload.locale,
    source: payload.source,
  });
}
