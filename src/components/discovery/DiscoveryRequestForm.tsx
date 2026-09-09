"use client";

import { useState } from "react";
import { submitDiscoveryLead } from "@/adapters/zoho/forms";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types/locale";

type Labels = {
  name: string;
  email: string;
  phone: string;
  submit: string;
  success: string;
  error: string;
};

type Props = {
  pathwayTitle: string;
  audienceLabel: string;
  needLabel: string;
  labels: Labels;
  isRTL?: boolean;
  locale?: Locale;
  onSuccess?: () => void;
};

/**
 * Compact sidebar form for the discovery result step.
 * Shown only when the user clicks "Start this pathway".
 * Posts to `/api/zoho/discovery` (CRM) when FEATURE_ZOHO_FORMS=1 on the server.
 */
export function DiscoveryRequestForm({
  pathwayTitle,
  audienceLabel,
  needLabel,
  labels,
  isRTL = false,
  locale = "en",
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("submitting");

    const result = await submitDiscoveryLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      pathwayTitle,
      audienceLabel,
      needLabel,
      locale,
    });

    if (result.ok) {
      setStatus("success");
      onSuccess?.();
    } else {
      setStatus("error");
    }
  };

  const nextSteps = isRTL
    ? [
        { icon: "✓", label: "تم استلام طلبك" },
        { icon: "👁", label: "يراجع فريق سعة طلبك خلال يوم عمل" },
        { icon: "📅", label: "نحدد موعد جلسة الاكتشاف معك" },
        { icon: "🗺", label: "نصمم الحل والمسار معاً" },
      ]
    : [
        { icon: "✓", label: "Request received" },
        { icon: "👁", label: "SAH team reviews within 1 business day" },
        { icon: "📅", label: "Discovery session scheduled with you" },
        { icon: "🗺", label: "Solution & pathway designed together" },
      ];

  if (status === "success") {
    return (
      <div className="dreq-success" role="status">
        <span className="dreq-success-check" aria-hidden="true">✓</span>
        <b>{isRTL ? "تم استلام طلبك" : "Request received"}</b>
        <p>{labels.success}</p>
        <ol className="dreq-next-steps" aria-label={isRTL ? "الخطوات التالية" : "What happens next"}>
          {nextSteps.map((step, i) => (
            <li key={i} className="dreq-next-step" data-done={i === 0 ? "" : undefined}>
              <span className="dreq-next-icon" aria-hidden="true">{step.icon}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <form className="dreq-form" noValidate onSubmit={onSubmit}>
      <p className="dreq-intro">
        {isRTL
          ? "أترك بياناتك وسيتواصل معك فريق سعة."
          : "Leave your details and the SAH team will be in touch."}
      </p>

      <label className="dreq-label">
        <span>{labels.name}</span>
        <input
          autoComplete="name"
          name="name"
          required
          type="text"
          value={name}
          disabled={status === "submitting"}
          onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
        />
      </label>

      <label className="dreq-label">
        <span>{labels.email}</span>
        <input
          autoComplete="email"
          name="email"
          required
          type="email"
          value={email}
          disabled={status === "submitting"}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
        />
      </label>

      <label className="dreq-label">
        <span>
          {labels.phone}
          <span className="dreq-optional">
            {isRTL ? " (اختياري)" : " (optional)"}
          </span>
        </span>
        <input
          autoComplete="tel"
          name="phone"
          type="tel"
          value={phone}
          disabled={status === "submitting"}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      {/* Hidden pathway context — sent with form */}
      <input type="hidden" name="pathway" value={pathwayTitle} />
      <input type="hidden" name="audience" value={audienceLabel} />
      <input type="hidden" name="need" value={needLabel} />

      <Button
        type="submit"
        variant="gold"
        className="dreq-submit"
        disabled={status === "submitting"}
      >
        {status === "submitting"
          ? isRTL ? "جارٍ الإرسال…" : "Sending…"
          : labels.submit}
      </Button>

      {status === "error" ? (
        <p className="dreq-error" role="alert">
          {labels.error}
        </p>
      ) : null}
    </form>
  );
}
