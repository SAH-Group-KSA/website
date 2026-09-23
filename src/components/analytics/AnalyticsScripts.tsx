"use client";

import Script from "next/script";
import { useEffect, useMemo } from "react";
import {
  getAnalyticsConfig,
  PAGESENSE_CONSENT_ACCEPTED,
  PAGESENSE_CONSENT_COOKIE_MAX_AGE,
  PAGESENSE_CONSENT_COOKIE_PREFIX,
  PAGESENSE_CONSENT_DECLINED,
} from "@/lib/analytics-config";
import { useConsent } from "@/lib/use-consent";
import { localeDirections, type Locale } from "@/types/locale";

/**
 * The single gate in front of every third-party tracking script.
 *
 * Nothing below this component renders — and therefore nothing is fetched,
 * no global is defined and no cookie is set — until `consent === "accepted"`.
 * Declining leaves the page in exactly the state it was in before.
 *
 * PostHog is the one provider loaded imperatively rather than via <Script>,
 * because it ships as an npm package. It is dynamically imported inside the
 * consent effect so its ~60 KB never enters the initial bundle and is never
 * fetched by a visitor who declines.
 */
export function AnalyticsScripts({ locale }: { locale: Locale }) {
  const { consent, hydrated } = useConsent();
  const config = useMemo(() => getAnalyticsConfig(), []);
  const accepted = hydrated && consent === "accepted";

  const { posthogKey, posthogHost, pageSenseProjectKey } = config;
  const localeDirection = localeDirections[locale];

  /**
   * A visitor who accepted and later declined would otherwise be left holding
   * PageSense's "consent granted" cookie for a year. The tag is not loaded
   * after a decline either way, so this is hygiene rather than gating.
   */
  useEffect(() => {
    if (!hydrated || consent !== "declined" || !pageSenseProjectKey) return;
    document.cookie =
      `${PAGESENSE_CONSENT_COOKIE_PREFIX}${pageSenseProjectKey}=${PAGESENSE_CONSENT_DECLINED}` +
      `; path=/; max-age=0; SameSite=Lax`;
  }, [hydrated, consent, pageSenseProjectKey]);

  useEffect(() => {
    if (!accepted || !posthogKey) return;

    let cancelled = false;

    void import("posthog-js").then(({ default: posthog }) => {
      if (cancelled || window.posthog?.__loaded) return;
      posthog.init(posthogKey, {
        api_host: posthogHost,
        // "history_change", not `true`: `true` is the legacy mode that only
        // captures a pageview on initial load, so App Router soft navigations
        // recorded nothing and session duration / bounce rate were wrong.
        capture_pageview: "history_change",
        // Pairs with the above — fires $pageleave on pagehide, which is what
        // PostHog needs to compute session duration and bounce rate.
        capture_pageleave: true,
        autocapture: true,
        disable_session_recording: false,
        persistence: "localStorage+cookie",
      });
      // posthog-js does NOT assign the global itself. `track()` dispatches via
      // `window.posthog`, so without this every PostHog event is silently
      // dropped while the SDK still loads and records sessions.
      window.posthog = posthog as unknown as NonNullable<Window["posthog"]>;
    });

    return () => {
      cancelled = true;
    };
  }, [accepted, posthogKey, posthogHost]);

  if (!accepted) return null;

  return (
    <>
      {/* ---------------------------------------------------------------- GA4 */}
      {config.ga4Id ? (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(config.ga4Id)}, { send_page_view: false });
            `.trim()}
          </Script>
        </>
      ) : null}

      {/* --------------------------------------------------------- Meta Pixel */}
      {config.metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(config.metaPixelId)});
fbq('track', 'PageView');
            `.trim()}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${encodeURIComponent(config.metaPixelId)}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}

      {/* ---------------------------------------------- LinkedIn Insight Tag */}
      {config.linkedInPartnerId ? (
        <>
          <Script id="linkedin-init" strategy="afterInteractive">
            {`
window._linkedin_partner_id = ${JSON.stringify(config.linkedInPartnerId)};
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
            `.trim()}
          </Script>
          <Script id="linkedin-src" strategy="afterInteractive">
            {`
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];
var b=document.createElement('script');b.type='text/javascript';b.async=true;
b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';
s.parentNode.insertBefore(b,s);})(window.lintrk);
            `.trim()}
          </Script>
        </>
      ) : null}

      {/* ---------------------------------------------------- Zoho PageSense */}
      {config.pageSenseSrc ? (
        <Script id="zoho-pagesense" strategy="afterInteractive">
          {`
window._ps_conf = window._ps_conf || { version: "1.0" };
${pageSenseConsentJs(pageSenseProjectKey)}
// The command queue. PageSense drains it on init and then replaces its \`push\`
// so later commands run immediately. Creating it here — inside the consent gate,
// before the tag — is what lets a conversion fired during those first seconds
// still be recorded, and what makes every PageSense call a no-op after a
// decline (see \`push()\` in adapters/zoho/pagesense.ts).
window.pagesense = window.pagesense || [];
window.pagesense.push(["trackUser", {
  locale: ${JSON.stringify(locale)},
  direction: ${JSON.stringify(localeDirection)},
  brand: document.documentElement.getAttribute("data-theme") || "human"
}]);
(function(d){
  var s = d.createElement("script");
  s.async = true;
  s.src = ${JSON.stringify(config.pageSenseSrc)};
  (d.head || d.getElementsByTagName("head")[0]).appendChild(s);
})(document);
          `.trim()}
        </Script>
      ) : null}
      {/*
        Zoho's own PageSense snippet wraps this in an "anti-flicker" loader that
        sets `opacity:0; visibility:hidden` on <html>/<body> until the script
        loads (or 10s elapses), so an A/B variant swaps in before first paint.
        That is deliberately NOT reproduced here: PageSense only loads after the
        visitor accepts cookies, by which point the page is already painted, so
        the wrapper would blank a visible page for up to 10 seconds.
        Consequence: if you run A/B tests, visitors may briefly see the original
        before the variant applies. That is inherent to consent-gating this tool,
        not a defect.
      */}

      {/* ------------------------------------------------------ Zoho SalesIQ */}
      {/*
        One brand serves both locales (the Zoho plan allows a single brand).
        The brand's chat language is set to "Website Language", so the widget
        follows `<html lang>`; the `language(locale)` call below states it
        explicitly as well.

        The widget reflects the locale of the page it first loaded on.
        Switching language client-side does not re-language the chat, because
        SalesIQ installs itself on `window` and cannot be cleanly
        re-initialised; it follows on the next full page load.
      */}
      {config.salesIqWidget ? (
        <>
          <Script id={`zoho-salesiq-init-${locale}`} strategy="afterInteractive">
            {`
window.$zoho = window.$zoho || {};
window.$zoho.salesiq = window.$zoho.salesiq || {};
// Belt-and-braces: the brand already carries the right language, but this also
// covers a brand that has several languages enabled.
window.$zoho.salesiq.ready = function(){
  try { window.$zoho.salesiq.language(${JSON.stringify(locale)}); } catch(e){}
};
// SalesIQ ships its own cookie banner. The visitor has already consented via
// our banner — which is the only reason this script is loading at all — so
// pass that consent straight through rather than asking them a second time.
window.$zoho.salesiq.afterReady = function(){
  try { window.$zoho.salesiq.privacy.updateCookieConsent(["analytics","performance"]); } catch(e){}
};
            `.trim()}
          </Script>
          <Script
            id={`zoho-salesiq-src-${locale}`}
            strategy="afterInteractive"
            src={`https://salesiq.zohopublic.sa/widget?wc=${encodeURIComponent(config.salesIqWidget)}`}
          />
        </>
      ) : null}
    </>
  );
}

/**
 * JS that tells PageSense the visitor has consented, emitted immediately before
 * the tag is injected.
 *
 * A PageSense project configured with "ask for consent" (`privacy_value: 3`)
 * never calls its internal `startTracking()` — so it sends no pageview, heatmap,
 * funnel or recording data at all — unless the cookie `zpc<projectKey>` already
 * records an answer. Left to itself it instead injects Zoho's own cookie bar
 * (`zcookiebar.js`) and waits for a click on that: a second banner asking a
 * question our banner has already asked, and the reason the PageSense dashboard
 * stayed empty.
 *
 * This is emitted only in the accepted branch, so it writes that same answer in
 * the exact cookie shape PageSense writes itself (`2` = accepted, 365 days).
 * PageSense then takes its "consent already given" branch, starts tracking
 * straight away, and never loads the duplicate bar.
 *
 * It is inlined into the same <script> that appends the tag — rather than run
 * from an effect or a preceding <Script> — because the cookie must exist before
 * the tag executes, and next/script does not guarantee order between two tags.
 *
 * Returns "" when the project key could not be parsed out of the script URL, so
 * a non-standard URL degrades to the previous behaviour rather than breaking.
 */
function pageSenseConsentJs(projectKey: string | undefined): string {
  if (!projectKey) return "";
  const cookie = `${PAGESENSE_CONSENT_COOKIE_PREFIX}${projectKey}=${PAGESENSE_CONSENT_ACCEPTED}; path=/; max-age=${PAGESENSE_CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
  return (
    `document.cookie = ${JSON.stringify(cookie)}` +
    ` + (location.protocol === "https:" ? "; Secure" : "");`
  );
}
