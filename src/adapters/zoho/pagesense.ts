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
 * Note: loading the tag is necessary but not sufficient. The project is set to
 * "ask for consent", so PageSense stays dormant until the `zpc<projectKey>`
 * cookie records an answer — `AnalyticsScripts` writes it from our own banner.
 * Removing that write silently stops all PageSense data without any error.
 *
 * Note: PageSense overlaps with PostHog on heatmaps and session recording.
 * Both are enabled deliberately; either can be switched off by unsetting its
 * env var, with no code change.
 */
export function getPageSenseScriptSrc(): string | null {
  return getAnalyticsConfig().pageSenseSrc ?? null;
}

/**
 * Push a command onto the PageSense queue.
 *
 * Deliberately does NOT create `window.pagesense` when it is missing. The queue
 * is created by the consent-gated inline script in `AnalyticsScripts`, so its
 * absence means "the visitor declined, or PageSense is not configured" and every
 * call below becomes a no-op — the same structural consent guarantee that
 * `track()` relies on for gtag/fbq/posthog.
 *
 * Never throws: an analytics failure must not break a form submission.
 */
function push(command: PageSenseCommand): void {
  try {
    window.pagesense?.push(command);
  } catch {
    /* ignore */
  }
}

/**
 * Record a named conversion.
 *
 * This feeds three things at once: a Goal (if one of type "Custom/JS event" with
 * this exact name exists in the PageSense project), a funnel step, and a trigger
 * that can launch a poll or popup. The funnel step and trigger work immediately;
 * the Goal only starts counting once it is created in the dashboard with a
 * matching name — no code change needed at that point.
 */
export function pageSenseTrackGoal(name: string): void {
  push(["trackEvent", name]);
}

/**
 * Tag the visitor's session recording so it can be found later.
 *
 * Without tags, finding the session where someone submitted a lead means
 * scrubbing recordings by hand. Reserve this for outcomes worth replaying.
 */
export function pageSenseTagRecording(tag: string): void {
  push(["tagRecording", tag]);
}

/**
 * Attach attributes to the visitor, for segmenting heatmaps, funnels and
 * recordings.
 *
 * `locale` matters more here than on most sites: an Arabic (RTL) and an English
 * (LTR) view of the same page are mirror images, so pooling their heatmaps
 * averages two opposite layouts into noise.
 */
export function pageSenseSetUser(attributes: PageSenseAttributes): void {
  push(["trackUser", attributes]);
}

/** Attach a stable id to the visitor, so sessions across devices join up. */
export function pageSenseIdentify(userId: string): void {
  push(["identifyUser", userId]);
}
