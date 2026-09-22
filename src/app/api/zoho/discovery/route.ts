import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardZohoConfigured,
  handleCrmResult,
  parseJsonBody,
  validationError,
  attributionSchema,
  attributionFields,
  withAttributionNote,
} from "@/app/api/zoho/_helpers";
import { createCrmLeadWithOptionalFields, splitName } from "@/lib/zoho";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().optional(),
  pathwayTitle: z.string().trim().min(1),
  audienceLabel: z.string().trim().min(1),
  needLabel: z.string().trim().min(1),
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
  const { firstName, lastName } = splitName(d.name);

  const result = await createCrmLeadWithOptionalFields(
    {
      First_Name: firstName,
      Last_Name: lastName,
      Email: d.email,
      Phone: d.phone,
      Description: withAttributionNote(undefined, d.attribution),
      Lead_Source: "Discovery",
      Source_Page: "/discovery",
      Locale: d.locale,
      Pathway_Title: d.pathwayTitle,
      Audience_Label: d.audienceLabel,
      Need_Label: d.needLabel,
    },
    attributionFields(d.attribution),
  );

  return handleCrmResult(result);
}
