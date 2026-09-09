import { notConfiguredResult } from "@/adapters/errors";
import type { AdapterResult } from "@/domain/lead";
import { features } from "@/lib/features";
import { track } from "@/adapters/analytics/track";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export type SignInInput = { email: string; password: string };
export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
};
export type ResetPasswordInput = { email: string };
export type UpdatePasswordInput = { password: string };

function localePrefix(): "" | "/en" {
  return typeof window !== "undefined" &&
    (window.location.pathname === "/en" || window.location.pathname.startsWith("/en/"))
    ? "/en"
    : "";
}

function callbackUrl(next: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

function upstreamResult(error: unknown): AdapterResult {
  return {
    ok: false,
    code: "upstream",
    message: error instanceof Error ? error.message : "Authentication failed",
  };
}

export async function signIn(input: SignInInput): Promise<AdapterResult> {
  track("auth_sign_in", { emailDomain: input.email.split("@")[1] });
  if (!features.auth) return notConfiguredResult("Supabase Auth");
  try {
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword(input);
    if (error) return upstreamResult(error);
    return { ok: true };
  } catch (error) {
    return upstreamResult(error);
  }
}

export async function signUp(input: SignUpInput): Promise<AdapterResult> {
  track("auth_sign_up", { emailDomain: input.email.split("@")[1] });
  if (!features.auth) return notConfiguredResult("Supabase Auth");
  try {
    const prefix = localePrefix();
    const { data, error } = await createSupabaseBrowserClient().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: callbackUrl(`${prefix || "/"}`),
        data: {
          full_name: input.fullName,
          locale: prefix ? "en" : "ar",
        },
      },
    });
    if (error) return upstreamResult(error);

    if (data.session) {
      const response = await fetch("/api/auth/onboard", { method: "POST" });
      if (!response.ok) {
        return upstreamResult(new Error("Account created, but profile setup failed"));
      }
    }

    return { ok: true, id: data.user?.id };
  } catch (error) {
    return upstreamResult(error);
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<AdapterResult> {
  track("auth_reset_password", { emailDomain: input.email.split("@")[1] });
  if (!features.auth) return notConfiguredResult("Supabase Auth");
  try {
    const prefix = localePrefix();
    const { error } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(
      input.email,
      {
        redirectTo: callbackUrl(`${prefix}/auth/reset-password`),
      },
    );
    if (error) return upstreamResult(error);
    return { ok: true };
  } catch (error) {
    return upstreamResult(error);
  }
}

export async function signOut(): Promise<AdapterResult> {
  track("auth_sign_out", {});
  if (!features.auth) return notConfiguredResult("Supabase Auth");
  try {
    const { error } = await createSupabaseBrowserClient().auth.signOut();
    if (error) return upstreamResult(error);
    return { ok: true };
  } catch (error) {
    return upstreamResult(error);
  }
}

export async function updatePassword(input: UpdatePasswordInput): Promise<AdapterResult> {
  if (!features.auth) return notConfiguredResult("Supabase Auth");
  try {
    const { error } = await createSupabaseBrowserClient().auth.updateUser({
      password: input.password,
    });
    if (error) return upstreamResult(error);
    return { ok: true };
  } catch (error) {
    return upstreamResult(error);
  }
}

export async function getSession(): Promise<{
  user: { id: string; email?: string } | null;
}> {
  if (!features.auth) return { user: null };
  const {
    data: { user },
  } = await createSupabaseBrowserClient().auth.getUser();
  return {
    user: user ? { id: user.id, email: user.email } : null,
  };
}
