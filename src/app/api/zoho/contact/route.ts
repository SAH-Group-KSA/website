import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardZohoConfigured,
  handleCrmResult,
  joinDescription,
  parseJsonBody,
  validationError,
  attributionSchema,
  attributionFields,
  withAttributionNote,
  reportConversion,
  trackingSchema,
} from "@/app/api/zoho/_helpers";
import { createCrmLeadWithOptionalFields, splitName } from "@/lib/zoho";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  message: z.string().trim().min(1),
  context: z.string().optional(),
  locale: z.enum(["ar", "en"]),
  attribution: attributionSchema,
  tracking: trackingSchema,
});

export async function POST(req: NextRequest) {
  const guard = guardZohoConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const d = parsed.data;
  const { firstName, lastName } = splitName(d.name);
  const description = joinDescription(d.message, d.context);

  const result = await createCrmLeadWithOptionalFields(
    {
      First_Name: firstName,
      Last_Name: lastName,
      Email: d.email,
      Phone: d.phone,
      Company: d.organization,
      Description: withAttributionNote(description, d.attribution),
      Lead_Source: "Contact Form",
      Source_Page: "/",
      Locale: d.locale,
    },
    attributionFields(d.attribution),
  );

  if (result.ok) {
    reportConversion(req, {
      event: "lead_submitted",
      props: { kind: "contact", locale: d.locale },
      tracking: d.tracking,
      attribution: d.attribution,
      user: { email: d.email, phone: d.phone, firstName, lastName },
    });
  }

  return handleCrmResult(result);
}
