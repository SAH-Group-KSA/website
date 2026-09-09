import { NextResponse } from "next/server";
import { z } from "zod";
import { features } from "@/lib/features";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase-server";
import { isZohoConfigured, splitName, updateCrmContact } from "@/lib/zoho";

const bodySchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    language: z.enum(["ar", "en"]),
  })
  .strict();

export async function POST(request: Request) {
  if (!features.auth) {
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }

  try {
    const raw = (await request.json()) as Record<string, unknown>;
    // Email is owned by auth.users and is immutable from the profile form.
    if ("email" in raw) {
      return NextResponse.json(
        {
          ok: false,
          code: "email_immutable",
          message: "Email address cannot be changed.",
        },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
    }

    const fullName = parsed.data.name.trim();
    const phone = parsed.data.phone.replace(/[^\d+]/g, "").trim();
    const locale = parsed.data.language;

    const admin = createSupabaseAdminClient();
    const authUpdate: {
      phone?: string;
      user_metadata: {
        full_name: string | null;
        phone: string | null;
        locale: "ar" | "en";
      };
    } = {
      user_metadata: {
        full_name: fullName || null,
        phone: phone || null,
        locale,
      },
    };

    if (phone !== (user.phone ?? "")) {
      authUpdate.phone = phone;
    }

    // Never pass `email` to Auth — profile edits cannot change auth.users.email.
    const { error: authError } = await admin.auth.admin.updateUserById(
      user.id,
      authUpdate,
    );
    if (authError) {
      return NextResponse.json(
        { ok: false, code: "upstream", message: authError.message },
        { status: 500 },
      );
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        locale,
      })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json(
        { ok: false, code: "upstream", message: profileError.message },
        { status: 500 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("zoho_crm_contact_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.zoho_crm_contact_id && isZohoConfigured()) {
      const { firstName, lastName } = splitName(fullName || user.email || "");
      const zohoResult = await updateCrmContact(profile.zoho_crm_contact_id, {
        First_Name: firstName,
        Last_Name: lastName,
        Phone: phone || null,
      });

      if (!zohoResult.ok) {
        console.error("[auth] Zoho CRM contact update failed:", zohoResult.error);
        return NextResponse.json(
          {
            ok: false,
            code: "zoho",
            message: "Profile saved, but Zoho CRM contact could not be updated.",
          },
          { status: 502 },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      email: user.email ?? "",
    });
  } catch (error) {
    console.error("[auth] Profile update failed:", error);
    return NextResponse.json(
      { ok: false, code: "upstream", message: "Profile update failed" },
      { status: 500 },
    );
  }
}
