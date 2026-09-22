import { getAnalyticsConfig } from "@/lib/analytics-config";

/**
 * SalesIQ widget — gated by `features.salesIq` + `env.zohoSalesIqWidgetCode()`
 * (both resolved in `analytics-config.ts`) AND cookie consent.
 *
 * One brand serves both locales: the brand's chat language is set to
 * "Website Language", so the widget follows `<html lang>` on each page.
 *
 * The widget is injected by `src/components/analytics/AnalyticsScripts.tsx`,
 * which owns the consent gate. This accessor exists so server-side callers can
 * ask whether the widget is configured without duplicating the flag logic.
 */
export function getSalesIqWidgetCode(): string | null {
  return getAnalyticsConfig().salesIqWidget ?? null;
}

/** @deprecated Use `getSalesIqWidgetCode()`; the widget is no longer injected as raw HTML. */
export function getSalesIqSnippet(): string | null {
  return null;
}
