import { NextRequest, NextResponse } from "next/server";
import type { ZohoCrmResult, ZohoCampaignsResult } from "@/lib/zoho";
import { isNewsletterConfigured, isZohoConfigured } from "@/lib/zoho";
import { features } from "@/lib/features";

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

export function joinDescription(
  message?: string,
  context?: string,
): string | undefined {
  const parts = [context, message].filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.join("\n\n");
}
