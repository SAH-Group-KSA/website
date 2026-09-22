"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/use-consent";

/**
 * Fires a pageview on client-side route changes.
 *
 * GA4 is initialised with `send_page_view: false` and Meta/LinkedIn only fire
 * on script load, so without this an App Router soft navigation records
 * nothing. PostHog handles its own SPA pageviews and is deliberately absent.
 *
 * Uses `usePathname` from `next/navigation`, NOT `@/i18n/routing` — the
 * next-intl version strips the locale prefix, which would make `/courses`
 * (Arabic) and `/en/courses` (English) indistinguishable in every report.
 *
 * Deliberately does not use `useSearchParams`: it would force a Suspense
 * boundary and opt the whole statically-generated tree into client rendering.
 * The query string is still reported — it is read from `window.location`
 * inside the effect. The only loss is that a query-only change (same path,
 * different params) does not fire a new pageview, which this site has no
 * faceted-navigation case for.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { consent, hydrated } = useConsent();
  const lastPath = useRef<string | null>(null);

  const accepted = hydrated && consent === "accepted";

  useEffect(() => {
    if (!accepted || !pathname) return;

    const url = window.location.pathname + window.location.search;
    if (lastPath.current === url) return;

    const isFirst = lastPath.current === null;
    lastPath.current = url;

    window.gtag?.("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });

    // Meta and LinkedIn already fire once on script load — only report
    // subsequent soft navigations to avoid double-counting the entry page.
    if (!isFirst) {
      window.fbq?.("track", "PageView");
      window.lintrk?.("track");
    }
  }, [accepted, pathname]);

  return null;
}
