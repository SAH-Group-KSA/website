"use client";

import { LocaleLink } from "@/components/ui/LocaleLink";
import { useConsent } from "@/lib/use-consent";
import type { Locale } from "@/types/locale";

const COPY = {
  ar: {
    label: "إشعار ملفات تعريف الارتباط",
    title: "نحن نستخدم ملفات تعريف الارتباط",
    body: "نستخدم ملفات تعريف الارتباط لفهم كيفية استخدام الموقع وتحسين تجربتك. لا يتم تشغيل أي أداة تحليلات قبل موافقتك.",
    policy: "سياسة الخصوصية",
    accept: "قبول الكل",
    decline: "رفض",
  },
  en: {
    label: "Cookie notice",
    title: "We use cookies",
    body: "We use cookies to understand how the site is used and to improve your experience. No analytics tools run before you agree.",
    policy: "Privacy Policy",
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
        <div className="ds-consent-copy">
          <p className="ds-consent-title">{t.title}</p>
          <p className="ds-consent-body">
            {t.body}{" "}
            <LocaleLink href="/privacy-policy" className="ds-consent-link">
              {t.policy}
            </LocaleLink>
          </p>
        </div>
        <div className="ds-consent-actions">
          <button
            type="button"
            className="button button-outline button-small ds-consent-decline"
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
  );
}
