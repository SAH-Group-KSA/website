import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AnalyticsEvent, AnalyticsEventMap } from "@/adapters/analytics/events";
import { META_EVENTS, metaCustomData } from "@/adapters/analytics/meta";
import { isMetaCapiConfigured, sendMetaServerEvent } from "@/adapters/meta/capi";
import type { ZohoCrmResult, ZohoCampaignsResult } from "@/lib/zoho";
import { isNewsletterConfigured, isZohoConfigured } from "@/lib/zoho";
import { features } from "@/lib/features";
import { env } from "@/lib/env";

export type ApiErrorCode = "validation" | "upstream" | "not_configured" | "duplicate";

export function validationError(): NextResponse {
  return NextResponse.json(
    { ok: false as const, code: "validation" as const },
    { status: 400 },
  );
}

export function upstreamError(message?: string): NextResponse {
  return NextResponse.json(
    {
      ok: false as const,
      code: "upstream" as const,
      message: message ?? "Upstream error",
    },
    { status: 500 },
  );
}

/**
 * A unique CRM field (e.g. Email) already holds this value. `field` is the
 * Zoho API name so the form can point at the right input.
 */
export function duplicateError(field?: string): NextResponse {
  return NextResponse.json(
    { ok: false as const, code: "duplicate" as const, field },
    { status: 409 },
  );
}

export function notConfiguredResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      ok: false as const,
      code: "not_configured" as const,
      message: message ?? "Zoho Forms is not enabled",
    },
    { status: 503 },
  );
}

export function successResponse(id?: string): NextResponse {
  return NextResponse.json({ ok: true as const, id });
}

export async function parseJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Gate CRM writes on the server. Client adapters always POST here —
 * `FEATURE_ZOHO_FORMS` is not available in the browser (non-NEXT_PUBLIC_).
 */
export function guardZohoConfigured(): NextResponse | null {
  if (!features.zohoForms) {
    return notConfiguredResponse("FEATURE_ZOHO_FORMS is off");
  }
  if (!isZohoConfigured()) {
    return upstreamError("Zoho CRM is not configured");
  }
  return null;
}

/**
 * Gate newsletter subscribe on the server — `FEATURE_NEWSLETTER` is not
 * available in the browser (non-NEXT_PUBLIC_).
 */
export function guardNewsletterConfigured(): NextResponse | null {
  if (!features.newsletter) {
    return notConfiguredResponse("FEATURE_NEWSLETTER is off");
  }
  if (!isNewsletterConfigured()) {
    return upstreamError("Zoho Campaigns is not configured");
  }
  return null;
}

export function handleCrmResult(result: ZohoCrmResult): NextResponse {
  if (result.ok) return successResponse(result.id);
  return upstreamError(result.error);
}

export function handleCampaignsResult(result: ZohoCampaignsResult): NextResponse {
  if (result.ok) return successResponse();
  return upstreamError(result.error);
}

export function joinDescription(message?: string, context?: string): string | undefined {
  const parts = [context, message].filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.join("\n\n");
}

/* -------------------------------------------------------------------------
   Lead attribution (first-touch acquisition)

   Two delivery mechanisms, deliberately:

   1. ALWAYS — appended to `Description` as a readable block. Requires no CRM
      configuration and therefore cannot break lead capture.
   2. OPT-IN — mapped to dedicated custom fields when ZOHO_ATTRIBUTION_FIELDS=1.
      Filterable and reportable, but Zoho's API REJECTS records containing
      unknown field API names, so enabling this before creating the fields
      would fail every submission. Off by default for that reason.
   ------------------------------------------------------------------------- */

export const attributionSchema = z
  .object({
    utmSource: z.string().max(255).optional(),
    utmMedium: z.string().max(255).optional(),
    utmCampaign: z.string().max(255).optional(),
    utmTerm: z.string().max(255).optional(),
    utmContent: z.string().max(255).optional(),
    clickId: z.string().max(255).optional(),
    referrer: z.string().max(255).optional(),
    landingPage: z.string().max(255).optional(),
    firstSeen: z.string().max(32).optional(),
  })
  .optional();

export type AttributionInput = z.infer<typeof attributionSchema>;

const ATTRIBUTION_LABELS: Array<[keyof NonNullable<AttributionInput>, string]> = [
  ["utmSource", "Source"],
  ["utmMedium", "Medium"],
  ["utmCampaign", "Campaign"],
  ["utmTerm", "Term"],
  ["utmContent", "Content"],
  ["clickId", "Click ID"],
  ["referrer", "Referrer"],
  ["landingPage", "Landing page"],
  ["firstSeen", "First seen"],
];

/**
 * Append a human-readable acquisition block to the lead description.
 * Always safe — writes to a field that already exists.
 */
export function withAttributionNote(
  description: string | undefined,
  attribution: AttributionInput,
): string | undefined {
  if (!attribution) return description;

  const lines = ATTRIBUTION_LABELS.filter(([key]) => attribution[key]).map(
    ([key, label]) => `${label}: ${attribution[key]}`,
  );
  if (lines.length === 0) return description;

  const block = ["— Acquisition —", ...lines].join("\n");
  return description ? `${description}\n\n${block}` : block;
}

/**
 * Dedicated CRM fields for attribution, for the LEADS module only.
 *
 * Deliberately limited to the three UTM fields that exist on Leads and are
 * owned by marketing. The Leads module also has `Referrer`, `First Page
 * Visited`, `First Visit`, `Visitor Score`, `Days Visited` and similar — those
 * belong to the Zoho SalesIQ visitor-tracking integration, which populates
 * them automatically. Writing to them would compete with SalesIQ, and the URL
 * and DateTime types would reject these values anyway. That data still reaches
 * CRM through the Description note.
 *
 * The Applications module has no UTM fields, so community applications get the
 * Description-style note only.
 *
 * Returns `{}` unless ZOHO_ATTRIBUTION_FIELDS=1. Even when enabled,
 * `createCrmLeadWithOptionalFields` retries without these on a field error, so
 * a wrong API name degrades to a plain lead rather than a failed submission.
 */
export function attributionFields(
  attribution: AttributionInput,
): Record<string, unknown> {
  if (!attribution || !env.zohoAttributionFieldsEnabled()) return {};
  return {
    UTM_Source: attribution.utmSource,
    UTM_Medium: attribution.utmMedium,
    UTM_Campaign: attribution.utmCampaign,
  };
}

/* -------------------------------------------------------------------------
   Server-side conversions (Meta Conversions API)

   The browser Pixel fires after a successful submission; this sends the same
   event from the server with the same event id, so Meta still sees leads the
   browser lost (ad blockers, iOS, closed tabs) without counting any twice.
   ------------------------------------------------------------------------- */

/**
 * Sent by the client only when analytics is on and the visitor accepted
 * cookies (`createTrackingContext()`), so its presence is the consent signal.
 *
 * `.catch(undefined)`: a malformed value drops tracking for that request — it
 * must never fail validation and lose the lead itself.
 */
export const trackingSchema = z
  .object({
    eventId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
    brand: z
      .string()
      .regex(/^[a-z]{1,32}$/)
      .optional(),
  })
  .optional()
  .catch(undefined);

export type TrackingInput = z.infer<typeof trackingSchema>;

type ConversionUser = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
};

/** First hop of `x-forwarded-for` — the visitor, as set by Vercel's edge. */
function clientIp(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || undefined;
}

/**
 * `_fbc` when the Pixel set it; otherwise built from the `fbclid` the
 * attribution tracker captured. The fallback matters: a visitor who lands from
 * an ad and accepts cookies on a later page has no `_fbc` (the Pixel loaded
 * after the `fbclid` left the URL), but first-touch attribution kept it.
 */
function clickIdCookie(
  req: NextRequest,
  attribution: AttributionInput,
): string | undefined {
  const cookie = req.cookies.get("_fbc")?.value;
  if (cookie) return cookie;
  const clickId = attribution?.clickId;
  if (!clickId?.startsWith("fbclid:")) return undefined;
  const fbclid = clickId.slice("fbclid:".length);
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

/** The page the form was submitted from. Same-origin fetches send it in full. */
function sourceUrl(req: NextRequest): string | undefined {
  const referer = req.headers.get("referer");
  return referer && /^https?:\/\//.test(referer) ? referer : undefined;
}

/**
 * Report a confirmed conversion to Meta from the server.
 *
 * Call ONLY after the CRM / Campaigns write succeeded. Pass the same `props`
 * the client passes to `track()` for this event, so both sides build the same
 * Meta event. Runs after the response is sent (`after()`), so it adds no
 * latency, and every failure is logged and swallowed — a Meta outage can never
 * affect a submission.
 */
export function reportConversion<E extends AnalyticsEvent>(
  req: NextRequest,
  input: {
    event: E;
    props: AnalyticsEventMap[E];
    tracking: TrackingInput;
    attribution?: AttributionInput;
    user: ConversionUser;
  },
): void {
  try {
    const { event, props, tracking, attribution, user } = input;
    // No tracking context = no consent (or analytics off): send nothing.
    if (!tracking) return;
    const spec = META_EVENTS[event];
    if (!spec || !isMetaCapiConfigured()) return;

    const payload = {
      eventName: spec.name,
      eventId: tracking.eventId,
      eventSourceUrl: sourceUrl(req),
      customData: metaCustomData(event, props as Record<string, unknown>, tracking.brand),
      user: {
        ...user,
        clientIp: clientIp(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
        fbp: req.cookies.get("_fbp")?.value,
        fbc: clickIdCookie(req, attribution),
      },
    };

    after(async () => {
      const result = await sendMetaServerEvent(payload);
      if (!result.ok) {
        console.error(`[meta] ${spec.name} not sent:`, result.message);
      }
    });
  } catch (error) {
    console.error("[meta] conversion not scheduled:", error);
  }
}
