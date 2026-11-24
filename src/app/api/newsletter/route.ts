import { NextRequest } from "next/server";
import { z } from "zod";
import {
  attributionSchema,
  guardNewsletterConfigured,
  handleCampaignsResult,
  parseJsonBody,
  reportConversion,
  trackingSchema,
  validationError,
} from "@/app/api/zoho/_helpers";
import { subscribeToCampaignsList } from "@/lib/zoho";

const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  locale: z.enum(["ar", "en"]),
  source: z.enum(["footer", "inline", "default"]).optional(),
  // Rejects a missing or false value, so a caller bypassing the UI cannot
  // subscribe anyone who has not granted marketing consent.
  marketingConsent: z.literal(true),
  // Read only to recover a Meta click id for the Conversions API — never
  // written to Campaigns, whose list has no fields for it. `.catch` because
  // this route used to ignore the key: a malformed value must not start
  // rejecting subscriptions that previously went through.
  attribution: attributionSchema.catch(undefined),
  tracking: trackingSchema,
});

export async function POST(req: NextRequest) {
  const guard = guardNewsletterConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const { firstName, lastName, email, locale, source, attribution, tracking } =
    parsed.data;
  const result = await subscribeToCampaignsList({
    firstName,
    lastName,
    email,
    locale,
  });
  if (result.ok) {
    reportConversion(req, {
      event: "newsletter_subscribed",
      props: { locale, source },
      tracking,
      attribution,
      user: { email, firstName, lastName },
    });
  }

  return handleCampaignsResult(result);
}
