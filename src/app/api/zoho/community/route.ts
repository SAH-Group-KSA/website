import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardZohoConfigured,
  handleCrmResult,
  parseJsonBody,
  validationError,
  attributionSchema,
  withAttributionNote,
} from "@/app/api/zoho/_helpers";
import { createCrmApplication } from "@/lib/zoho";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().optional(),
  communityId: z.enum(["impact", "lego"]),
  profession: z.string().optional(),
  motivation: z.string().trim().min(1),
  experience: z.string().optional(),
  locale: z.enum(["ar", "en"]),
  attribution: attributionSchema,
});

export async function POST(req: NextRequest) {
  const guard = guardZohoConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const d = parsed.data;

  // No attribution custom fields here: the Applications module has no UTM
  // fields, and Zoho rejects unknown field API names. The acquisition detail
  // is appended to Motivation instead.
  const result = await createCrmApplication({
    Name: d.name,
    Email: d.email,
    Phone: d.phone,
    Community: d.communityId,
    Profession: d.profession,
    // Applications has no Description field; the acquisition block is appended
    // to Motivation, which is the free-text field an assessor already reads.
    Motivation: withAttributionNote(d.motivation, d.attribution),
    Experience: d.experience,
    Locale: d.locale,
    Status: "Pending Review",
  });

  return handleCrmResult(result);
}
