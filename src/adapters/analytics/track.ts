import type { AnalyticsEvent, AnalyticsEventMap } from "@/adapters/analytics/events";
import { features } from "@/lib/features";

/**
 * Typed analytics sink. No-op until FEATURE_ANALYTICS + a provider are enabled.
 * Call from adapters and important UI CTAs — never couple to a vendor SDK in components.
 */
export function track<E extends AnalyticsEvent>(
  event: E,
  props: AnalyticsEventMap[E],
): void {
  if (!features.analytics) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug(`[analytics:noop] ${event}`, props);
    }
    return;
  }
  // Future: GTM / Zoho Analytics provider dispatch
  void event;
  void props;
}
