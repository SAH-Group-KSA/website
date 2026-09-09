import type {
  CommunityApplication,
  ContactLead,
  DiscoveryLead,
  GroupInterestLead,
  NewsletterSubscribe,
  ProgramInterestLead,
  AdapterResult,
} from "@/domain/lead";
import { track } from "@/adapters/analytics/track";

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

export async function submitDiscoveryLead(
  payload: DiscoveryLead,
): Promise<AdapterResult> {
  track("lead_submitted", { kind: "discovery", locale: payload.locale });
  return postZohoForm("/api/zoho/discovery", payload);
}

export async function submitContactLead(
  payload: ContactLead,
): Promise<AdapterResult> {
  track("lead_submitted", { kind: "contact", locale: payload.locale });
  return postZohoForm("/api/zoho/contact", payload);
}

export async function submitGroupInterest(
  payload: GroupInterestLead,
): Promise<AdapterResult> {
  track("lead_submitted", { kind: "group", locale: payload.locale });
  return postZohoForm("/api/zoho/group", payload);
}

export async function submitProgramInterest(
  payload: ProgramInterestLead,
): Promise<AdapterResult> {
  track("lead_submitted", {
    kind: "program",
    locale: payload.locale,
    programId: payload.programId,
  });
  return postZohoForm("/api/zoho/program", payload);
}

export async function submitCommunityApplication(
  payload: CommunityApplication,
): Promise<AdapterResult> {
  track("lead_submitted", { kind: "community", locale: payload.locale });
  return postZohoForm("/api/zoho/community", payload);
}

export async function subscribeNewsletter(
  payload: NewsletterSubscribe,
): Promise<AdapterResult> {
  track("newsletter_subscribed", {
    locale: payload.locale,
    source: payload.source,
  });
  return postZohoForm("/api/newsletter", payload);
}
