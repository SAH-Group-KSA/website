import { getAnalyticsConfig } from "@/lib/analytics-config";

/**
 * Zoho PageSense — heatmaps, scroll maps, funnels and A/B testing.
 *
 * Gated by `FEATURE_ANALYTICS` + `NEXT_PUBLIC_ZOHO_PAGESENSE_SRC` (resolved and
 * URL-validated in `analytics-config.ts`) AND cookie consent. The tag itself is
 * injected by `src/components/analytics/AnalyticsScripts.tsx`, which owns the
 * consent gate; this accessor mirrors `salesiq.ts` so both Zoho tags are
 * reachable through the adapter layer.
 *
 * Note: PageSense overlaps with PostHog on heatmaps and session recording.
 * Both are enabled deliberately; either can be switched off by unsetting its
 * env var, with no code change.
 */
export function getPageSenseScriptSrc(): string | null {
  return getAnalyticsConfig().pageSenseSrc ?? null;
}
