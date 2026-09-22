import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ZohoCrmResult, ZohoCampaignsResult } from "@/lib/zoho";
import { isNewsletterConfigured, isZohoConfigured } from "@/lib/zoho";
import { features } from "@/lib/features";
import { env } from "@/lib/env";

export type ApiErrorCode = "validation" | "upstream" | "not_configured";

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
