"use client";

import { useState } from "react";
import { submitProgramInterest } from "@/adapters/zoho/forms";
import { Button } from "@/components/ui/Button";
import type { ProgramsSectionContent } from "@/content/types";
import type { Locale } from "@/types/locale";

type Props = {
  programId: string;
  programTitle: string;
  locale: Locale;
  /** Return link to the listing `#programs` section (group or company). */
  programsHref: string;
  /** Sidebar layout — single-column fields, hide redundant program lock. */
  compact?: boolean;
  labels: Pick<
    ProgramsSectionContent,
    | "registerTitle"
    | "registerLead"
    | "registerSubmit"
    | "registerSubmitting"
    | "registerSuccessTitle"
    | "registerSuccessBody"
    | "registerBackLabel"
    | "registerNameLabel"
    | "registerEmailLabel"
    | "registerPhoneLabel"
    | "registerOrgLabel"
    | "registerMessageLabel"
    | "registerConsent"
    | "registerProgramLabel"
    | "registerError"
  >;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function ProgramInterestFormClient({
  programId,
  programTitle,
  locale,
  labels,
  programsHref,
  compact = false,
}: Props) {
  const isAr = locale === "ar";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    org: "",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");

    const result = await submitProgramInterest({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      organization: form.org || undefined,
      programId,
      programTitle,
      message: form.message || undefined,
      locale,
    });

    if (result.ok) {
      setState("success");
    } else {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="apply-success" role="status">
        <div className="apply-success-icon" aria-hidden="true">
          ✓
        </div>
        <h3>
          {labels.registerSuccessTitle ??
            (isAr ? "شكراً لاهتمامك!" : "Thank you for your interest!")}
        </h3>
        <p>
          {labels.registerSuccessBody ??
            (isAr
              ? "استلمنا طلبك وسيتواصل معك فريقنا خلال 1-2 يوم عمل."
              : "We've received your request. Our team will contact you within 1–2 business days.")}
        </p>
        <a href={programsHref} className="button button-outline-dark button-small">
          {labels.registerBackLabel ??
            (isAr ? "استعرض البرامج" : "Browse programs")}
        </a>
      </div>
    );
  }

  return (
    <form
      className={compact ? "apply-form apply-form-compact" : "apply-form"}
      onSubmit={handleSubmit}
      noValidate
    >
      {!compact ? (
        <div className="program-interest-locked">
          <p className="text-small" style={{ margin: "0 0 4px", color: "var(--muted)" }}>
            {labels.registerProgramLabel ?? (isAr ? "البرنامج" : "Program")}
          </p>
          <p className="program-interest-locked-title">{programTitle}</p>
        </div>
      ) : null}

      <div className="apply-form-row">
        <label>
          {labels.registerNameLabel ?? (isAr ? "الاسم الكامل *" : "Full Name *")}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder={isAr ? "محمد الأحمد" : "Jane Smith"}
          />
        </label>
        <label>
          {labels.registerEmailLabel ??
            (isAr ? "البريد الإلكتروني *" : "Email Address *")}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="apply-form-row">
        <label>
          {labels.registerPhoneLabel ?? (isAr ? "رقم الجوال" : "Phone Number")}
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+966 5X XXX XXXX"
          />
        </label>
        <label>
          {labels.registerOrgLabel ??
            (isAr ? "الجهة / الشركة" : "Organisation / Company")}
          <input
            type="text"
            name="org"
            value={form.org}
            onChange={handleChange}
            placeholder={
              isAr ? "اسم جهتك (اختياري)" : "Your employer (optional)"
            }
          />
        </label>
      </div>

      <label>
        {labels.registerMessageLabel ??
          (isAr ? "ما الذي تأمل في تحقيقه؟" : "What do you hope to achieve?")}
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={
            isAr
              ? "شاركنا أهدافك بشكل مختصر..."
              : "Share your goals briefly…"
          }
        />
      </label>

      {state === "error" ? (
        <p className="program-interest-error" role="alert">
          {labels.registerError ??
            (isAr
              ? "حدث خطأ. يرجى المحاولة مرة أخرى."
              : "Something went wrong. Please try again.")}
        </p>
      ) : null}

      <div className="form-footer">
        <p>
          {labels.registerConsent ??
            (isAr
              ? "بإرسال هذا النموذج توافق على التواصل معك من قبل فريق سعة."
              : "By submitting you agree to being contacted by the SAH team.")}
        </p>
        <Button type="submit" variant="primary" disabled={state === "submitting"}>
          {state === "submitting"
            ? (labels.registerSubmitting ??
              (isAr ? "جارٍ الإرسال..." : "Sending…"))
            : (labels.registerSubmit ??
              (isAr ? "أرسل طلبي" : "Submit Request"))}
        </Button>
      </div>
    </form>
  );
}
