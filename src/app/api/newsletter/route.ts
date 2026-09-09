import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardNewsletterConfigured,
  handleCampaignsResult,
  parseJsonBody,
  validationError,
} from "@/app/api/zoho/_helpers";
import { subscribeToCampaignsList } from "@/lib/zoho";

const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email(),
  locale: z.enum(["ar", "en"]),
  source: z.enum(["footer", "inline", "default"]).optional(),
});

export async function POST(req: NextRequest) {
  const guard = guardNewsletterConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const { firstName, lastName, email, locale } = parsed.data;
  const result = await subscribeToCampaignsList({
    firstName,
    lastName,
    email,
    locale,
  });
  return handleCampaignsResult(result);
}
