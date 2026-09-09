"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/routing";

type Props = {
  isAr: boolean;
  initialProfile: {
    name: string;
    email: string;
    phone: string;
    language: "ar" | "en";
  };
};

export function ProfileFormClient({ isAr, initialProfile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const completedFields = [
    form.name,
    initialProfile.email,
    form.phone,
    form.language,
  ].filter(Boolean).length;
  const completion = Math.round((completedFields / 4) * 100);
  const avatarLabel = form.name.trim().charAt(0) || (isAr ? "س" : "S");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "email") return;
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    // Email is immutable — always restore the server value before/around save.
    setForm((f) => ({ ...f, email: initialProfile.email }));

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          language: form.language,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        email?: string;
      };

      if (!response.ok || !payload.ok) {
        if (payload.code === "unauthorized") {
          setError(
            isAr
              ? "انتهت الجلسة. سجل الدخول مجدداً."
              : "Your session expired. Please sign in again.",
          );
        } else if (payload.code === "email_immutable") {
          setForm((f) => ({ ...f, email: initialProfile.email }));
          setError(
            isAr
              ? "لا يمكن تغيير البريد الإلكتروني من هذه الصفحة."
              : "Email address cannot be changed from this page.",
          );
        } else if (payload.code === "zoho") {
          setError(
            isAr
              ? "تم حفظ الملف، لكن تعذر تحديث جهة الاتصال في زوهو."
              : (payload.message ??
                "Profile saved, but Zoho CRM contact could not be updated."),
          );
        } else {
          setError(
            payload.message ??
              (isAr ? "تعذر حفظ التغييرات." : "Could not save changes."),
          );
        }
        return;
      }

      setForm((f) => ({
        ...f,
        email: payload.email || initialProfile.email,
      }));
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-settings-layout" onSubmit={handleSubmit} noValidate>
      <aside className="profile-summary-card dashboard-panel">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{avatarLabel.toUpperCase()}</div>
          <span className="profile-online-dot" />
        </div>
        <h2>{form.name || (isAr ? "عضو ساه" : "SAH Member")}</h2>
        <p>{initialProfile.email || (isAr ? "حساب شخصي" : "Personal account")}</p>
        <span className="profile-member-badge">{isAr ? "عضو نشط" : "Active member"}</span>

        <div className="profile-completion">
          <div>
            <span>{isAr ? "اكتمال الملف" : "Profile completion"}</span>
            <strong>{completion}%</strong>
          </div>
          <div className="profile-completion-track">
            <span style={{ width: `${completion}%` }} />
          </div>
          <small>
            {completion === 100
              ? isAr
                ? "ملفك مكتمل."
                : "Your profile is complete."
              : isAr
                ? "أكمل بياناتك للحصول على تجربة أفضل."
                : "Complete your details for a better experience."}
          </small>
        </div>
      </aside>

      <div className="profile-settings-main">
        <section className="profile-details-card dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                {isAr ? "التفاصيل الشخصية" : "Personal details"}
              </span>
              <h2>{isAr ? "معلومات الحساب" : "Account information"}</h2>
            </div>
          </div>

          <div className="profile-form">
            <label>
              {isAr ? "الاسم الكامل" : "Full Name"}
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={isAr ? "محمد الأحمد" : "Jane Smith"}
              />
            </label>

            <label>
              {isAr ? "البريد الإلكتروني" : "Email Address"}
              <input
                type="email"
                name="email"
                value={initialProfile.email}
                placeholder="you@example.com"
                readOnly
                disabled
                autoComplete="username"
                aria-readonly="true"
              />
            </label>

            <label>
              {isAr ? "رقم الجوال" : "Phone Number"}
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+966 5X XXX XXXX"
              />
            </label>

            <label>
              {isAr ? "اللغة المفضلة" : "Preferred Language"}
              <select name="language" value={form.language} onChange={handleChange}>
                <option value="ar">{isAr ? "العربية" : "Arabic"}</option>
                <option value="en">{isAr ? "الإنجليزية" : "English"}</option>
              </select>
            </label>
          </div>

          <div className="form-actions profile-form-actions">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving
                ? isAr
                  ? "جارٍ الحفظ..."
                  : "Saving…"
                : isAr
                  ? "حفظ التغييرات"
                  : "Save Changes"}
            </Button>
            {saved && (
              <span className="profile-save-success">
                ✓ {isAr ? "تم حفظ التغييرات" : "Changes saved"}
              </span>
            )}
            {error && (
              <span className="auth-error" role="alert">
                {error}
              </span>
            )}
          </div>
        </section>
      </div>
    </form>
  );
}
