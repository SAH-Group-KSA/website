import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

const tagMap: Record<string, string> = {
  coach: "coaches",
  course: "courses",
  homePage: "home",
  siteSettings: "site-settings",
  pageSeo: "seo",
  companyPage: "companies",
  program: "programs",
};

/**
 * Sanity publish/unpublish webhook → on-demand ISR.
 *
 * Sanity Manage → API → Webhooks → Create:
 *   Name: Next.js revalidate
 *   URL:  {SITE_URL}/api/revalidate?secret={SANITY_REVALIDATE_SECRET}
 *         (must be a public URL — not localhost; use Vercel staging/production)
 *   Dataset: staging and/or production (one webhook per dataset, or filter)
 *   Trigger on: Create, Update, Delete
 *   Filter: _type in ["coach", "course", "homePage", "pageSeo", "companyPage", "program"]
 *   Projection: {_type}
 *   HTTP method: POST
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = env.sanityRevalidateSecret();

  if (!expected) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not set on this deployment" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const type = extractType(body);
  if (!type) {
    return NextResponse.json({ message: "Missing _type" }, { status: 400 });
  }

  const tag = tagMap[type];
  if (!tag) {
    // Unknown types are ignored (200) so Sanity does not retry endlessly.
    return NextResponse.json({
      revalidated: false,
      message: `No tag for type: ${type}`,
    });
  }

  // Immediate expire for CMS webhooks (Next.js 16 requires a profile / expire option).
  revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: true, tag, type });
}

function extractType(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;

  if (typeof record._type === "string" && record._type.length > 0) {
    return record._type;
  }

  // Some webhook shapes nest the document under `result` / `document`.
  for (const key of ["result", "document", "payload"] as const) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const t = (nested as Record<string, unknown>)._type;
      if (typeof t === "string" && t.length > 0) return t;
    }
  }

  return undefined;
}
