import { NextRequest } from "next/server";
import { z } from "zod";
import {
  guardZohoConfigured,
  handleCrmResult,
  parseJsonBody,
  validationError,
} from "@/app/api/zoho/_helpers";
import { createCrmApplication } from "@/lib/zoho";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  communityId: z.enum(["impact", "lego"]),
  profession: z.string().optional(),
  motivation: z.string().min(1),
  experience: z.string().optional(),
  locale: z.enum(["ar", "en"]),
});

export async function POST(req: NextRequest) {
  const guard = guardZohoConfigured();
  if (guard) return guard;

  const body = await parseJsonBody(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError();

  const d = parsed.data;

  const result = await createCrmApplication({
    Name: d.name,
    Email: d.email,
    Phone: d.phone,
    Community: d.communityId,
    Profession: d.profession,
    Motivation: d.motivation,
    Experience: d.experience,
    Locale: d.locale,
    Status: "Pending Review",
  });

  return handleCrmResult(result);
}
