import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardZohoConfigured,
  handleCrmResult,
  parseJsonBody,
  duplicateError,
  successResponse,
  upstreamError,
  validationError,
  attributionSchema,
  withAttributionNote,
  reportConversion,
  trackingSchema,
} from "@/app/api/zoho/_helpers";
import {
  COACH_FIELD_LIMITS,
  COACH_FORM_MIN_FILL_MS,
  COACH_LANGUAGE_IDS,
  COACH_LANGUAGES,
  COACH_SPECIALISATION_IDS,
  COACH_SPECIALISATIONS,
  isLinkedInUrl,
} from "@/lib/coach-application";
import { normalizeSaudiMobile } from "@/lib/phone";
import { createCrmCoachApplication, splitName } from "@/lib/zoho";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

const schema = z.object({
  name: z.string().trim().min(1).max(COACH_FIELD_LIMITS.name),
  email: z.string().trim().email(),
  phone: z.string().transform((v, ctx) => {
    const normalized = normalizeSaudiMobile(v);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Invalid phone" });
      return z.NEVER;
    }
    return normalized;
  }),
  city: z.string().trim().min(1).max(COACH_FIELD_LIMITS.city),
  specialisation: z.enum(COACH_SPECIALISATION_IDS),
  yearsExperience: z.coerce.number().int().min(0).max(COACH_FIELD_LIMITS.maxYears),
  certifications: optionalText(COACH_FIELD_LIMITS.certifications),
  linkedinUrl: optionalText(2048).refine((v) => !v || isLinkedInUrl(v)),
  language: z.enum(COACH_LANGUAGE_IDS),
  bio: z.string().trim().min(1).max(COACH_FIELD_LIMITS.bio),
  consent: z.literal(true),
  locale: z.enum(["ar", "en"]),
  attribution: attributionSchema,
  tracking: trackingSchema,
  // Spam signals — see the check below.
  website: z.string().optional(),
  startedAt: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const guard = guardZohoConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const d = parsed.data;

  // Honeypot filled, or submitted faster than a person could type: answer as
  // if it worked so the bot learns nothing, but never write to CRM.
  const tooFast =
    d.startedAt === undefined || Date.now() - d.startedAt < COACH_FORM_MIN_FILL_MS;
  if (d.website || tooFast) {
    console.warn(
      "[zoho] coach application dropped as spam:",
      d.website ? "honeypot" : "too fast",
    );
    return successResponse();
  }

  const result = await createCrmCoachApplication({
    Name: d.name,
    Email: d.email,
    Mobile: d.phone,
    City: d.city,
    Specialisation: COACH_SPECIALISATIONS.find((s) => s.id === d.specialisation)?.zoho,
    Years_of_Experience: d.yearsExperience,
    Certifications: d.certifications,
    LinkedIn_URL: d.linkedinUrl,
    Coaching_Language: COACH_LANGUAGES.find((l) => l.id === d.language)?.zoho,
    // The custom module has no Description field; the acquisition block is
    // appended to Bio, the free-text field a reviewer already reads.
    Bio: withAttributionNote(d.bio, d.attribution),
    Consent: true,
    Locale: d.locale,
    Status: "Pending Review",
  });

  if (!result.ok) {
    console.error("[zoho] coach application failed:", result.error, result.code);
    if (result.code === "DUPLICATE_DATA") return duplicateError(result.field);
    // Generic message: the raw CRM error is for the logs, not the applicant.
    return upstreamError();
  }

  // Below the spam check on purpose: a dropped bot submission returns early
  // above and is never reported as a conversion.
  const { firstName, lastName } = splitName(d.name);
  reportConversion(req, {
    event: "coach_application_submitted",
    props: { locale: d.locale },
    tracking: d.tracking,
    attribution: d.attribution,
    user: { email: d.email, phone: d.phone, firstName, lastName },
  });

  return handleCrmResult(result);
}
