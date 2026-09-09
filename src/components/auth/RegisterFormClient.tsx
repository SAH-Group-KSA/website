"use client";

import { useState } from "react";
import { signUp } from "@/adapters/supabase/auth";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";

type FormState = "idle" | "submitting" | "error" | "sent";
type Props = { isAr: boolean; siteName: string; logoAlt: string };

export function RegisterFormClient({ isAr, siteName, logoAlt }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setState("error");
      setError(isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setState("error");
      setError(
        isAr ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل." : "Password must be at least 8 characters.",
      );
      return;
    }

    setState("submitting");
    setError("");

    try {
      const result = await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.name.trim(),
      });
      if (result.ok) {
        setState("sent");
        return;
      }
      setState("error");
      setError(
        result.code === "not_configured"
          ? isAr
            ? "إنشاء الحساب غير متاح بعد — Supabase Auth لم يُفعَّل بعد."
            : "Account creation not yet active — Supabase Auth credentials pending setup."
          : result.message,
      );
    } catch {
      setState("error");
      setError(
        isAr
          ? "حدث خطأ غير متوقع. حاول مرة أخرى."
          : "Something went wrong. Please try again.",
      );
    }
  };

  if (state === "sent") {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card-enter text-center">
          <div className="auth-logo">
            <AppImage
              src="/logos/sah-group-logo.png"
              alt={logoAlt}
              width={200}
              height={74}
              sizes="200px"
            />
          </div>
          <h1 className="auth-title">{isAr ? "تحقق من بريدك" : "Check Your Email"}</h1>
          <p className="auth-subtitle">
            {isAr
              ? `أرسلنا رابط تأكيد الحساب إلى ${form.email}`
              : `We sent an account confirmation link to ${form.email}.`}
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

        <h1 className="auth-title">{isAr ? "إنشاء حساب جديد" : "Create an Account"}</h1>
        <p className="auth-subtitle">
          {isAr
            ? `انضم إلى ${siteName} واحصل على وصول كامل`
            : `Join ${siteName} for full access`}
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            {isAr ? "الاسم الكامل" : "Full Name"}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder={isAr ? "محمد الأحمد" : "Jane Smith"}
            />
          </label>

          <label>
            {isAr ? "البريد الإلكتروني" : "Email Address"}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            {isAr ? "كلمة المرور" : "Password"}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={8}
              placeholder={isAr ? "8 أحرف على الأقل" : "At least 8 characters"}
            />
          </label>

          <label>
            {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder={isAr ? "أعد كتابة كلمة المرور" : "Re-enter password"}
              className={error && error.includes("match") ? "is-invalid" : ""}
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
                ? "جارٍ الإنشاء..."
                : "Creating account…"
              : isAr
                ? "إنشاء الحساب"
                : "Create Account"}
          </Button>
        </form>

        <div className="auth-footer">
          {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <LocaleLink href="/auth/login">{isAr ? "تسجيل الدخول" : "Sign in"}</LocaleLink>
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
