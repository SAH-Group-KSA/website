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
  organization: z.string().optional(),
  programId: z.string().min(1),
  programTitle: z.string().optional(),
  message: z.string().optional(),
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
    Company: d.organization,
    Description: d.message,
    Lead_Source: "Program Interest",
    Source_Page: `/program/${d.programId}`,
    Locale: d.locale,
    Program_Interest: d.programTitle ?? d.programId,
  });

  return handleCrmResult(result);
}
