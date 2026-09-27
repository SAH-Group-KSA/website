"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/adapters/analytics/track";
import {
  ensureSalesIqBridge,
  salesIqIdentify,
  salesIqOnChatButtonClick,
  salesIqSetDepartments,
  salesIqSetInfo,
} from "@/adapters/zoho/salesiq";
import { getAttribution } from "@/lib/attribution";
import { normalizeAppPath, resolveBrandTheme } from "@/lib/brand-themes";
import { features } from "@/lib/features";
import { localeDirections, type Locale } from "@/types/locale";

/**
 * Everything the SalesIQ widget knows about the visitor beyond what Zoho can
 * see for itself.
 *
 * Zoho already tracks IP, geography and the URL sequence. What it cannot know
 * is which of six sub-brands a page belongs to, which language the visitor
 * chose, which campaign introduced them, and whether they are a signed-in
 * customer. Those four are the difference between a generic greeting and a
 * routed, informed conversation — and they are exactly what proactive-chat
 * triggers and bot scripts key on in the SalesIQ console.
 *
 * Rendered only by `AnalyticsScripts`, inside its consent gate and only when a
 * widget code is configured, so this component never has to read consent
 * itself. Every call below additionally no-ops if the widget never loads.
 */
export function SalesIqVisitorContext({
  locale,
  departments,
}: {
  locale: Locale;
  /** Brand id → SalesIQ department name. Empty disables department routing. */
  departments: Record<string, string>;
}) {
  const pathname = usePathname();

  /**
   * The float-button handler is registered once but fires much later, by which
   * point the visitor may have navigated. A ref keeps it reading the brand of
   * the page they are actually on without re-registering on every route change.
   */
  const brandRef = useRef<string>("group");

  useEffect(() => {
    // Effects run in declaration order, so this one call covers the two below
    // as well — it therefore has to happen before the `pathname` guard, not
    // after. Safe here and only here: this component renders inside the consent
    // gate (see the module comment).
    ensureSalesIqBridge();
    if (!pathname) return;

    // Resolved from the path rather than read back off `<html data-theme>`:
    // `BrandTheme` writes that attribute from its own effect, and two effects
    // on the same render have no guaranteed order — reading it here would
    // intermittently report the previous page's brand.
    const brand = resolveBrandTheme(normalizeAppPath(pathname));
    brandRef.current = brand;

    const attribution = getAttribution();

    // Keys are referenced verbatim by bot scripts and trigger rules in the
    // SalesIQ console (`%visitor.custominfo.brand%`), so they are lowercase,
    // stable, and only present when they carry a value — an empty string shows
    // up as a blank row in the operator's panel.
    salesIqSetInfo({
      locale,
      direction: localeDirections[locale],
      brand,
      page: window.location.pathname,
      ...(attribution?.utmSource ? { utm_source: attribution.utmSource } : {}),
      ...(attribution?.utmMedium ? { utm_medium: attribution.utmMedium } : {}),
      ...(attribution?.utmCampaign ? { utm_campaign: attribution.utmCampaign } : {}),
      ...(attribution?.clickId ? { click_id: attribution.clickId } : {}),
      ...(attribution?.referrer ? { referrer: attribution.referrer } : {}),
      ...(attribution?.landingPage ? { landing_page: attribution.landingPage } : {}),
      ...(attribution?.firstSeen ? { first_seen: attribution.firstSeen } : {}),
    });

    // Opt-in: absent unless `NEXT_PUBLIC_ZOHO_SALESIQ_DEPARTMENTS` maps this
    // brand to a department that exists in the console.
    const department = departments[brand];
    if (department) salesIqSetDepartments([department]);
  }, [pathname, locale, departments]);

  useEffect(() => {
    // `chatbutton.click()` registers a handler; calling it again on every route
    // change would stack duplicates and double-count the event.
    salesIqOnChatButtonClick(() => {
      track("chat_opened", { locale, brand: brandRef.current });
    });
  }, [locale]);

  useEffect(() => {
    if (!features.auth) return;

    let cancelled = false;

    // Dynamically imported so `@supabase/ssr` stays out of the initial bundle
    // of every marketing page — the same reason PostHog is imported lazily in
    // `AnalyticsScripts`. `getSession()` reads the stored token; it does not
    // hit the network unless that token needs refreshing.
    void (async () => {
      try {
        const { createSupabaseBrowserClient } = await import("@/lib/supabase");
        const { data } = await createSupabaseBrowserClient().auth.getSession();
        const user = data.session?.user;
        if (cancelled || !user) return;

        const fullName = user.user_metadata?.full_name;

        salesIqIdentify({
          // The Supabase user id, not the email: it is stable across an email
          // change, and SalesIQ shows previous conversations for whatever id is
          // passed — a reused or guessable id would expose them to the wrong
          // person.
          id: user.id,
          email: user.email,
          name: typeof fullName === "string" ? fullName : undefined,
        });
      } catch {
        // Not signed in, Supabase not configured, or storage blocked. Chat
        // still works, just anonymously.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
