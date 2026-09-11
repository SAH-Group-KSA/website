"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { submitContactLead } from "@/adapters/zoho/forms";
import type { SiteContent } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SAH_OPEN_CONTACT } from "@/lib/interactions";
import type { Locale } from "@/types/locale";

type Audience = "individual" | "organization";
type FormStatus = "idle" | "submitting" | "success" | "error";

type Props = {
  data: SiteContent["contact"];
};

export function ContactSection({ data }: Props) {
  const locale = useLocale() as Locale;
  const isRTL = locale === "ar";

  const [audience, setAudience] = useState<Audience>("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [context, setContext] = useState(data.defaultContext);
  const [status, setStatus] = useState<FormStatus>("idle");

  useEffect(() => {
    const onOpen = (event: Event) => {
      const next = (event as CustomEvent<{ context?: string }>).detail?.context;
      if (next) setContext(next);
    };
    window.addEventListener(SAH_OPEN_CONTACT, onOpen);
    return () => window.removeEventListener(SAH_OPEN_CONTACT, onOpen);
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !name.trim() ||
      !message.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const result = await submitContactLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      organization: org.trim() || undefined,
      message: message.trim(),
      context,
      locale,
    });

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  const nextSteps = isRTL
    ? [
        { icon: "✓", label: "تم استلام طلبك" },
        { icon: "1", label: "يراجع فريق سعة طلبك خلال يوم عمل" },
        { icon: "2", label: "نحدد موعد جلسة الاكتشاف معك" },
        { icon: "3", label: "نصمم الحل والمسار معاً" },
      ]
    : [
        { icon: "✓", label: "Request received" },
        { icon: "1", label: "SAH team reviews within 1 business day" },
        { icon: "2", label: "Discovery session scheduled with you" },
        { icon: "3", label: "Solution & pathway designed together" },
      ];

  const emailDisplay = data.emailDisplay ?? data.emailTo;

  return (
    <Section
      aria-labelledby="contact-title"
      className="contact"
      tone="dark"
      id="contact"
    >
      <Container>
        <div className="contact-layout">
          {/* Left copy */}
          <div className="contact-copy reveal">
            <p className="eyebrow eyebrow-light">{data.eyebrow}</p>
            <h2 id="contact-title" className="contact-main-title">
              {data.titleLines?.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h2>
            <p className="contact-intro">{data.intro}</p>

            <div className="contact-meta">
              <a className="contact-meta-item" href={`mailto:${emailDisplay}`}>
                <span className="contact-meta-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="1.5"
                      y="3"
                      width="13"
                      height="10"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M2 4.5l6 4.5 6-4.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {emailDisplay}
              </a>
              {data.location ? (
                <span className="contact-meta-item">
                  <span className="contact-meta-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 14s5-4.2 5-7.5A5 5 0 0 0 3 6.5C3 9.8 8 14 8 14z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="8"
                        cy="6.5"
                        r="1.6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </span>
                  {data.location}
                </span>
              ) : null}
            </div>
          </div>

          {/* Right form */}
          {status === "success" ? (
            <div className="contact-form contact-success reveal" role="status">
              <span className="contact-success-check" aria-hidden="true">
                ✓
              </span>
              <b>{isRTL ? "تم استلام طلبك" : "Request received"}</b>
              <p>{data.success}</p>
              <ol
                className="contact-next-steps"
                aria-label={isRTL ? "الخطوات التالية" : "What happens next"}
              >
                {nextSteps.map((step, i) => (
                  <li
                    key={step.label}
                    className={`contact-next-step${i === 0 ? " is-done" : ""}`}
                  >
                    <span className="contact-next-icon" aria-hidden="true">
                      {step.icon}
                    </span>
                    <span>{step.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <form
              className="contact-form reveal"
              data-delay="100"
              noValidate
              onSubmit={onSubmit}
            >
              <div
                aria-label={data.audienceAriaLabel}
                className="form-segment"
                role="radiogroup"
              >
                <label>
                  <input
                    checked={audience === "individual"}
                    name="clientType"
                    type="radio"
                    value={data.mailLabels.individualValue}
                    disabled={status === "submitting"}
                    onChange={() => setAudience("individual")}
                  />
                  <span>{data.individualLabel}</span>
                </label>
                <label>
                  <input
                    checked={audience === "organization"}
                    name="clientType"
                    type="radio"
                    value={data.mailLabels.organizationValue}
                    disabled={status === "submitting"}
                    onChange={() => setAudience("organization")}
                  />
                  <span>{data.organizationLabel}</span>
                </label>
              </div>

              <div className="form-grid">
                <label>
                  {data.fields.name}
                  <input
                    autoComplete="name"
                    name="name"
                    required
                    type="text"
                    value={name}
                    disabled={status === "submitting"}
                    onChange={(e) => {
                      setName(e.target.value);
                      setStatus("idle");
                    }}
                  />
                </label>
                <label>
                  {data.fields.email}
                  <input
                    autoComplete="email"
                    name="email"
                    required
                    type="email"
                    value={email}
                    disabled={status === "submitting"}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setStatus("idle");
                    }}
                  />
                </label>
                <label>
                  {data.fields.phone}
                  <input
                    autoComplete="tel"
                    name="phone"
                    type="tel"
                    value={phone}
                    disabled={status === "submitting"}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label>
                  {data.fields.org}
                  <input
                    autoComplete="organization"
                    name="organization"
                    type="text"
                    value={org}
                    disabled={status === "submitting"}
                    onChange={(e) => setOrg(e.target.value)}
                  />
                </label>
              </div>

              <label className="contact-message">
                {data.fields.message}
                <textarea
                  name="challenge"
                  placeholder={data.placeholders.message}
                  required
                  rows={3}
                  value={message}
                  disabled={status === "submitting"}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setStatus("idle");
                  }}
                />
              </label>

              <input name="context" type="hidden" value={context} />

              <div className="form-footer">
                <p>{data.note}</p>
                <Button
                  variant="gold"
                  type="submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? isRTL
                      ? "جارٍ الإرسال…"
                      : "Sending…"
                    : data.submit}
                </Button>
              </div>
              {status === "error" ? (
                <p className="form-status form-status-error" role="alert">
                  {data.error}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
