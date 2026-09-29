"use client";

import { LocaleLink } from "@/components/ui/LocaleLink";
import { useConsent } from "@/lib/use-consent";
import type { Locale } from "@/types/locale";

const COPY = {
  ar: {
    label: "إشعار ملفات تعريف الارتباط",
    title: "نحن نقدّر خصوصيتك",
    body: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتحليل حركة الزيارات، وتطوير خدماتنا.",
    policyPrefix: "راجع ",
    policy: "سياسة ملفات تعريف الارتباط",
    policySuffix: " لمزيد من المعلومات.",
    accept: "قبول الكل",
    decline: "رفض",
  },
  en: {
    label: "Cookie notice",
    title: "We Value Your Privacy",
    body: "We use cookies to enhance your browsing experience, analyze site traffic, and improve our services.",
    policyPrefix: "See our ",
    policy: "Cookie Policy",
    policySuffix: " for more information.",
    accept: "Accept All",
    decline: "Decline",
  },
} as const;

/**
 * Bottom-anchored cookie notice. Renders only when the visitor has not yet
 * chosen, and only after hydration (see `useConsent`).
 *
 * Deliberately NOT a focus-trapping dialog: it does not block the page, so
 * trapping keyboard users inside it would be worse for accessibility than
 * letting them read the content and tab into the banner when ready. It is a
 * labelled landmark region announced politely instead.
 */
export function CookieConsentBanner({ locale }: { locale: Locale }) {
  const { consent, hydrated, accept, decline } = useConsent();
  const t = COPY[locale];

  if (!hydrated || consent !== null) return null;

  return (
    <div className="ds-consent" role="region" aria-label={t.label} aria-live="polite">
      <div className="ds-consent-inner">
        <span className="ds-consent-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M18 10.6a1.6 1.6 0 0 1-2.1-1.5 1.6 1.6 0 0 0-1.9-1.9 1.6 1.6 0 0 1-1.9-1.9 1.6 1.6 0 0 0-2.4-1.4A8 8 0 1 0 18 10.6Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="7.2" cy="9" r="0.9" fill="currentColor" />
            <circle cx="10.5" cy="13" r="0.9" fill="currentColor" />
            <circle cx="8" cy="13.2" r="0.6" fill="currentColor" />
            <circle cx="12.5" cy="10" r="0.6" fill="currentColor" />
          </svg>
        </span>
        <div className="ds-consent-copy">
          <p className="ds-consent-title">{t.title}</p>
          <p className="ds-consent-body">
            {t.body}{" "}
            {t.policyPrefix}
            <LocaleLink href="/cookie-policy" className="ds-consent-link">
              {t.policy}
            </LocaleLink>
            {t.policySuffix}
          </p>
          <div className="ds-consent-actions">
            <button
              type="button"
              className="button button-ghost button-small ds-consent-decline"
              onClick={decline}
            >
              {t.decline}
            </button>
            <button
              type="button"
              className="button button-gold button-small"
              onClick={accept}
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
