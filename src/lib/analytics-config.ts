/**
 * Which tracking providers are actually enabled.
 *
 * A provider loads only when all three hold:
 *   1. its feature flag is on (`FEATURE_ANALYTICS`, or `FEATURE_SALESIQ` for chat),
 *   2. its ID / URL env var is set,
 *   3. the visitor has accepted cookies (enforced by the consumer, not here).
 *
 * This module owns (1) and (2) so there is exactly one place to reason about
 * gating. Consent is enforced in `AnalyticsScripts` — nothing here reads it.
 */

import { env } from "@/lib/env";
import { features } from "@/lib/features";

export type AnalyticsConfig = {
  ga4Id?: string;
  posthogKey?: string;
  posthogHost: string;
  metaPixelId?: string;
  linkedInPartnerId?: string;
  pageSenseSrc?: string;
  /**
   * PageSense project key, parsed out of `pageSenseSrc`
   * (`https://<cdn>/js/<portal>/<projectKey>.js`).
   *
   * Needed because PageSense gates its own tracking on a `zpc<projectKey>`
   * cookie — see `PAGESENSE_CONSENT_COOKIE_*` below.
   */
  pageSenseProjectKey?: string;
  /**
   * SalesIQ brand widget code. One brand serves both locales — the brand's
   * language is set to "Website Language" so the widget follows `<html lang>`,
   * and `AnalyticsScripts` also calls `$zoho.salesiq.language(locale)`.
   */
  salesIqWidget?: string;
};

/**
 * PageSense is injected as a `<script src>` built from an env var, so a bad
 * value would be an injection vector. Accept only https URLs on a Zoho
 * PageSense CDN host.
 */
function safePageSenseSrc(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:") return undefined;
  const host = url.hostname.toLowerCase();
  const allowed =
    host === "cdn.pagesense.io" ||
    host.endsWith(".pagesense.io") ||
    host.endsWith(".pagesense.zoho.com") ||
    host.endsWith(".pagesense.zoho.sa") ||
    host.endsWith(".pagesense.zoho.eu");
  return allowed ? url.toString() : undefined;
}

/**
 * Name prefix of the cookie PageSense reads to decide whether it may track.
 * The full name is `zpc` + the project key.
 */
export const PAGESENSE_CONSENT_COOKIE_PREFIX = "zpc";

/** Cookie values PageSense understands. Anything else is treated as "no answer". */
export const PAGESENSE_CONSENT_ACCEPTED = "2";
export const PAGESENSE_CONSENT_DECLINED = "3";

/** PageSense's own lifetime for that cookie: 365 days. */
export const PAGESENSE_CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * `https://cdn-sa.pagesense.io/js/<portal>/<projectKey>.js` → `<projectKey>`.
 *
 * Derived from the URL rather than taken from a second env var so the two can
 * never drift apart — a key that doesn't match the loaded script would write a
 * cookie PageSense never reads, which is exactly the bug this guards against.
 */
function pageSenseProjectKeyFrom(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const file = new URL(src).pathname.split("/").pop();
  if (!file?.endsWith(".js")) return undefined;
  const key = file.slice(0, -".js".length);
  return /^[a-zA-Z0-9]+$/.test(key) ? key : undefined;
}

export function getAnalyticsConfig(): AnalyticsConfig {
  const on = features.analytics;
  const pageSenseSrc = on ? safePageSenseSrc(env.zohoPageSenseSrc()) : undefined;

  return {
    ga4Id: on ? env.ga4MeasurementId() : undefined,
    posthogKey: on ? env.posthogKey() : undefined,
    posthogHost: env.posthogHost(),
    metaPixelId: on ? env.metaPixelId() : undefined,
    linkedInPartnerId: on ? env.linkedInPartnerId() : undefined,
    pageSenseSrc,
    pageSenseProjectKey: pageSenseProjectKeyFrom(pageSenseSrc),
    // Chat keeps its own flag — it is a support tool, not an analytics tool,
    // and may be wanted independently.
    salesIqWidget: features.salesIq ? env.zohoSalesIqWidgetCode() : undefined,
  };
}

/** True when at least one provider would load, given consent. */
export function hasAnyProvider(config: AnalyticsConfig): boolean {
  return Boolean(
    config.ga4Id ||
    config.posthogKey ||
    config.metaPixelId ||
    config.linkedInPartnerId ||
    config.pageSenseSrc ||
    config.salesIqWidget,
  );
}
