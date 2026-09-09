import { NextResponse } from "next/server";
import { features } from "@/lib/features";
import { onboardUser } from "@/lib/onboard-user";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  if (!features.auth) {
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
    }

    await onboardUser(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth] User onboarding failed:", error);
    return NextResponse.json(
      { ok: false, code: "upstream", message: "Profile setup failed" },
      { status: 500 },
    );
  }
}
