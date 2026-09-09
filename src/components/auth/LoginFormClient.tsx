"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/adapters/supabase/auth";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { FormField, FormShell } from "@/components/ui/FormField";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { useRouter } from "@/i18n/routing";
import { postAuthDestination, stripLocalePrefix } from "@/lib/dashboard-availability";

type FormState = "idle" | "submitting" | "error";

type Props = { isAr: boolean; siteName: string; logoAlt: string };

function authLinkErrorMessage(isAr: boolean, code: string, fromRecovery: boolean): string {
  const normalized = code.toLowerCase();
  if (
    normalized === "otp_expired" ||
    normalized === "access_denied" ||
    normalized === "invalid_callback" ||
    normalized.includes("expired")
  ) {
    return fromRecovery
      ? isAr
        ? "رابط إعادة تعيين كلمة المرور غير صالح أو منتهٍ. اطلب رابطاً جديداً."
        : "This password reset link is invalid or has expired. Please request a new one."
      : isAr
        ? "رابط البريد الإلكتروني غير صالح أو منتهٍ. حاول مرة أخرى."
        : "This email link is invalid or has expired. Please try again.";
  }
  if (normalized === "callback_failed") {
    return isAr
      ? "تعذر إكمال تسجيل الدخول من رابط البريد. حاول مرة أخرى."
      : "Could not complete sign-in from the email link. Please try again.";
  }
  if (normalized === "not_configured") {
    return isAr
      ? "المصادقة غير متاحة بعد — Supabase Auth لم يُفعَّل بعد."
      : "Authentication not yet active — Supabase Auth credentials pending setup.";
  }
  return isAr
    ? "حدث خطأ أثناء تسجيل الدخول عبر البريد الإلكتروني."
    : "Something went wrong while signing in from email.";
}

export function LoginFormClient({ isAr, siteName, logoAlt }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = useMemo(() => {
    const code = searchParams.get("error");
    if (!code) return null;
    const fromRecovery = searchParams.get("from") === "recovery";
    return {
      message: authLinkErrorMessage(isAr, code, fromRecovery),
      showForgotHint: fromRecovery || code.toLowerCase().includes("otp"),
    };
  }, [isAr, searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<FormState>(linkError ? "error" : "idle");
  const [error, setError] = useState(linkError?.message ?? "");
  const [showForgotHint, setShowForgotHint] = useState(
    Boolean(linkError?.showForgotHint),
  );

  useEffect(() => {
    if (!linkError) return;
    const clean = new URL(window.location.href);
    if (!clean.searchParams.has("error") && !clean.searchParams.has("from")) return;
    clean.searchParams.delete("error");
    clean.searchParams.delete("from");
    window.history.replaceState({}, "", clean.pathname + clean.search);
  }, [linkError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    setError("");
    setShowForgotHint(false);

    const result = await signIn({ email, password });
    if (result.ok) {
      const next = searchParams.get("next");
      const destination = stripLocalePrefix(
        postAuthDestination(next, window.location.pathname),
      );
      router.push(destination as "/");
      router.refresh();
      return;
    }
    setState("error");
    setError(
      result.code === "not_configured"
        ? isAr
          ? "المصادقة غير متاحة بعد — Supabase Auth لم يُفعَّل بعد."
          : "Authentication not yet active — Supabase Auth credentials pending setup."
        : result.message,
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-enter">
        <div className="auth-logo">
          <AppImage
            src="/logos/sah-group-logo.png"
            alt={logoAlt}
            width={200}
            height={74}
            sizes="200px"
          />
        </div>

        <h1 className="auth-title">{isAr ? "تسجيل الدخول" : "Sign In"}</h1>
        <p className="auth-subtitle">
          {isAr ? `مرحباً بك في ${siteName}` : `Welcome back to ${siteName}`}
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
            {showForgotHint ? (
              <>
                {" "}
                <LocaleLink href="/auth/forgot-password">
                  {isAr ? "إعادة إرسال الرابط" : "Request a new reset link"}
                </LocaleLink>
              </>
            ) : null}
          </div>
        )}

        <FormShell className="auth-form" onSubmit={handleSubmit}>
          <FormField label={isAr ? "البريد الإلكتروني" : "Email Address"}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={state === "error" ? "is-invalid" : ""}
            />
          </FormField>

          <FormField label={isAr ? "كلمة المرور" : "Password"}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder={isAr ? "••••••••" : "••••••••"}
              className={state === "error" ? "is-invalid" : ""}
            />
          </FormField>

          <div className="auth-forgot">
            <LocaleLink href="/auth/forgot-password">
              {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </LocaleLink>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={state === "submitting"}
          >
            {state === "submitting"
              ? isAr
                ? "جارٍ الدخول..."
                : "Signing in…"
              : isAr
                ? "تسجيل الدخول"
                : "Sign In"}
          </Button>
        </FormShell>

        <div className="auth-divider">{isAr ? "أو" : "or"}</div>

        <div className="auth-footer">
          {isAr ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <LocaleLink href="/auth/register">
            {isAr ? "إنشاء حساب جديد" : "Create an account"}
          </LocaleLink>
        </div>

        <div className="auth-footer">
          <LocaleLink href="/">
            ← {isAr ? "العودة إلى الرئيسية" : "Back to home"}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
