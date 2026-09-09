"use client";

import { useEffect, useState } from "react";
import { updatePassword } from "@/adapters/supabase/auth";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
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
            <div className="auth-error" role="alert">
              {error}
            </div>
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
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <label>
              {isAr ? "كلمة المرور الجديدة" : "New Password"}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            <label>
              {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
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
