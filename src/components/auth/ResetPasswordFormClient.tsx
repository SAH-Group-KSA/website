"use client";

import { useEffect, useState } from "react";
import { updatePassword } from "@/adapters/supabase/auth";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormField";
import { LocaleLink } from "@/components/ui/LocaleLink";
import {
  isStrongPassword,
  PASSWORD_MIN_LENGTH,
  passwordPlaceholder,
  passwordRequirementsMessage,
} from "@/lib/password";
import { requiredLabel } from "@/lib/form-labels";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Props = { isAr: boolean; logoAlt: string };
type FormState = "checking" | "idle" | "submitting" | "success" | "error" | "invalid";

export function ResetPasswordFormClient({ isAr, logoAlt }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<FormState>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        setState("invalid");
        setError(
          isAr
            ? "رابط إعادة التعيين غير صالح أو منتهٍ. اطلب رابطاً جديداً."
            : "This reset link is invalid or has expired. Please request a new one.",
        );
        return;
      }
      setState("idle");
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [isAr]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setState("error");
      setError(isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }
    if (!isStrongPassword(password)) {
      setState("error");
      setError(passwordRequirementsMessage(isAr));
      return;
    }

    setState("submitting");
    setError("");
    const result = await updatePassword({ password });
    if (result.ok) {
      setState("success");
      return;
    }
    setState("error");
    setError(result.message);
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
        <h1 className="auth-title">
          {isAr ? "تعيين كلمة مرور جديدة" : "Set a New Password"}
        </h1>

        {state === "checking" ? (
          <p className="auth-subtitle" role="status">
            {isAr ? "جارٍ التحقق من الرابط…" : "Verifying reset link…"}
          </p>
        ) : state === "invalid" ? (
          <>
            <FormError>{error}</FormError>
            <Button href="/auth/forgot-password" variant="primary" className="w-full">
              {isAr ? "طلب رابط جديد" : "Request a new link"}
            </Button>
          </>
        ) : state === "success" ? (
          <>
            <p className="auth-subtitle">
              {isAr ? "تم تحديث كلمة المرور بنجاح." : "Your password has been updated."}
            </p>
            <Button href="/auth/login" variant="primary" className="w-full">
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Button>
          </>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error ? <FormError>{error}</FormError> : null}
            <label>
              {requiredLabel(isAr ? "كلمة المرور الجديدة" : "New Password")}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={PASSWORD_MIN_LENGTH}
                required
                autoComplete="new-password"
                placeholder={passwordPlaceholder(isAr)}
              />
            </label>
            <label>
              {requiredLabel(isAr ? "تأكيد كلمة المرور" : "Confirm Password")}
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                minLength={PASSWORD_MIN_LENGTH}
                required
                autoComplete="new-password"
                placeholder={isAr ? "أعد كتابة كلمة المرور" : "Re-enter password"}
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
                  ? "جارٍ التحديث..."
                  : "Updating…"
                : isAr
                  ? "تحديث كلمة المرور"
                  : "Update Password"}
            </Button>
          </form>
        )}

        <div className="auth-footer">
          <LocaleLink href="/">
            ← {isAr ? "العودة إلى الرئيسية" : "Back to home"}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
