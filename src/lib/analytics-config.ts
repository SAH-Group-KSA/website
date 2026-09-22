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

export function getAnalyticsConfig(): AnalyticsConfig {
  const on = features.analytics;

  return {
    ga4Id: on ? env.ga4MeasurementId() : undefined,
    posthogKey: on ? env.posthogKey() : undefined,
    posthogHost: env.posthogHost(),
    metaPixelId: on ? env.metaPixelId() : undefined,
    linkedInPartnerId: on ? env.linkedInPartnerId() : undefined,
    pageSenseSrc: on ? safePageSenseSrc(env.zohoPageSenseSrc()) : undefined,
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
