import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { createCrmContact, isZohoConfigured, splitName } from "@/lib/zoho";

export async function onboardUser(user: User): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: readError } = await admin
    .from("profiles")
    .select("zoho_crm_contact_id")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) throw readError;
  if (existing?.zoho_crm_contact_id) return;

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const locale = user.user_metadata.locale === "en" ? "en" : "ar";
  let zohoCrmContactId: string | null = existing?.zoho_crm_contact_id ?? null;

  if (user.email && isZohoConfigured()) {
    const { firstName, lastName } = splitName(fullName || user.email);
    const result = await createCrmContact({
      First_Name: firstName,
      Last_Name: lastName,
      Email: user.email,
    });

    if (result.ok) {
      zohoCrmContactId = result.id ?? null;
    } else {
      console.error("[auth] Zoho CRM contact creation failed:", result.error);
    }
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName || null,
      locale,
      zoho_crm_contact_id: zohoCrmContactId,
    },
    { onConflict: "id" },
  );

  if (upsertError) throw upsertError;
}
