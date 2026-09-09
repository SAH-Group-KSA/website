import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { postAuthDestination } from "@/lib/dashboard-availability";
import { features } from "@/lib/features";
import { onboardUser } from "@/lib/onboard-user";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const SAFE_NEXT_PATH =
  /^\/(?:en\/)?(?:dashboard(?:\/.*)?|auth\/reset-password)$/;

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function safeNextPath(requested: string | null): string {
  if (!requested) return postAuthDestination(null, "/");
  if (requested === "/" || requested === "/en") return requested;
  if (SAFE_NEXT_PATH.test(requested)) {
    return postAuthDestination(requested, requested);
  }
  return postAuthDestination(null, requested);
}

function loginPathFor(next: string): string {
  return next.startsWith("/en/") ? "/en/auth/login" : "/auth/login";
}

function redirectToLogin(
  request: NextRequest,
  next: string,
  errorCode: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = loginPathFor(next);
  url.search = "";
  url.searchParams.set("error", errorCode);
  if (next.includes("reset-password")) {
    url.searchParams.set("from", "recovery");
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const typeParam = url.searchParams.get("type");
  const otpType =
    typeParam && OTP_TYPES.has(typeParam as EmailOtpType)
      ? (typeParam as EmailOtpType)
      : null;
  const authError =
    url.searchParams.get("error_code") ||
    url.searchParams.get("error") ||
    url.searchParams.get("error_description");

  if (!features.auth) {
    return redirectToLogin(request, next, "not_configured");
  }

  if (authError) {
    const normalized = (url.searchParams.get("error_code") ||
      url.searchParams.get("error") ||
      "callback_failed")
      .toLowerCase()
      .replace(/\s+/g, "_");
    return redirectToLogin(request, next, normalized);
  }

  // Hash-based redirects cannot be read on the server — finish in the browser.
  if (!code && !tokenHash) {
    const completeUrl = request.nextUrl.clone();
    completeUrl.pathname = "/auth/callback/complete";
    completeUrl.search = "";
    completeUrl.searchParams.set("next", next);
    return NextResponse.redirect(completeUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else if (tokenHash && otpType) {
      const { error } = await supabase.auth.verifyOtp({
        type: otpType,
        token_hash: tokenHash,
      });
      if (error) throw error;
    } else {
      return redirectToLogin(request, next, "invalid_callback");
    }

    if (next.includes("/dashboard") || next === "/" || next === "/en") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) await onboardUser(user);
    }

    url.pathname = next;
    url.search = "";
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[auth] Callback failed:", error);
    const message =
      error instanceof Error ? error.message.toLowerCase() : "";
    const errorCode =
      message.includes("expired") || message.includes("otp")
        ? "otp_expired"
        : "callback_failed";
    return redirectToLogin(request, next, errorCode);
  }
}
