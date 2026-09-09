import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardZohoConfigured,
  handleCrmResult,
  parseJsonBody,
  validationError,
} from "@/app/api/zoho/_helpers";
import { createCrmLead, splitName } from "@/lib/zoho";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  pathwayTitle: z.string().min(1),
  audienceLabel: z.string().min(1),
  needLabel: z.string().min(1),
  locale: z.enum(["ar", "en"]),
});

export async function POST(req: NextRequest) {
  const guard = guardZohoConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const d = parsed.data;
  const { firstName, lastName } = splitName(d.name);

  const result = await createCrmLead({
    First_Name: firstName,
    Last_Name: lastName,
    Email: d.email,
    Phone: d.phone,
    Lead_Source: "Discovery",
    Source_Page: "/discovery",
    Locale: d.locale,
    Pathway_Title: d.pathwayTitle,
    Audience_Label: d.audienceLabel,
    Need_Label: d.needLabel,
  });

  return handleCrmResult(result);
}
