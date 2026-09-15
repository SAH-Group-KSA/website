"use client";

import { useState } from "react";
import { resetPassword } from "@/adapters/supabase/auth";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormField";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { getEmailError } from "@/lib/email";
import { requiredLabel } from "@/lib/form-labels";

type FormState = "idle" | "submitting" | "sent";
type Props = { isAr: boolean; logoAlt: string };

export function ForgotPasswordFormClient({ isAr, logoAlt }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = getEmailError(email, isAr);
    if (emailError) {
      setState("idle");
      setError(emailError);
      return;
    }

    setState("submitting");
    setError("");
    const trimmedEmail = email.trim();
    const result = await resetPassword({ email: trimmedEmail });
    if (result.ok) {
      setEmail(trimmedEmail);
      setState("sent");
    } else {
      setState("idle");
      setError(
        result.code === "not_configured"
          ? isAr
            ? "استعادة كلمة المرور غير متاحة حالياً."
            : "Password recovery is not currently available."
          : result.message,
      );
    }
  };

  if (state === "sent") {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card-enter text-center">
          <div className="empty-state-icon mb-4">📧</div>
          <h1 className="auth-title">{isAr ? "تحقق من بريدك" : "Check Your Email"}</h1>
          <p className="auth-subtitle">
            {isAr
              ? `أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}`
              : `We've sent a password reset link to ${email}`}
          </p>
          <div className="auth-footer">
            <LocaleLink href="/auth/login">
              ← {isAr ? "العودة إلى تسجيل الدخول" : "Back to sign in"}
            </LocaleLink>
          </div>
        </div>
      </div>
    );
  }

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

        <h1 className="auth-title">{isAr ? "نسيت كلمة المرور؟" : "Forgot Password?"}</h1>
        <p className="auth-subtitle">
          {isAr
            ? "أدخل بريدك الإلكتروني وسنرسل إليك رابط إعادة التعيين."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {error ? <FormError>{error}</FormError> : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            {requiredLabel(isAr ? "البريد الإلكتروني" : "Email Address")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={state === "submitting"}
          >
            {state === "submitting"
              ? isAr
                ? "جارٍ الإرسال..."
                : "Sending…"
              : isAr
                ? "إرسال رابط الاسترداد"
                : "Send Reset Link"}
          </Button>
        </form>

        <div className="auth-footer">
          <LocaleLink href="/auth/login">
            ← {isAr ? "العودة إلى تسجيل الدخول" : "Back to sign in"}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
