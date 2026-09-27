import type { AnalyticsEvent, AnalyticsEventMap } from "@/adapters/analytics/events";
import { pageSenseTagRecording, pageSenseTrackGoal } from "@/adapters/zoho/pagesense";
import { salesIqCustomAction } from "@/adapters/zoho/salesiq";
import { features } from "@/lib/features";

/**
 * Typed analytics sink. No-op until FEATURE_ANALYTICS + a provider are enabled.
 * Call from adapters and important UI CTAs — never couple to a vendor SDK in components.
 *
 * Consent is enforced structurally rather than re-checked here: no vendor
 * script loads until the visitor accepts, so `window.gtag` / `fbq` / `posthog`
 * are all undefined for a visitor who declined and every branch below is a
 * no-op. That keeps this module free of storage reads and safe to call from
 * server-side adapter paths.
 */

/** GA4 event names, mapped from our vendor-neutral event vocabulary. */
const GA4_EVENT_NAMES: Record<AnalyticsEvent, string> = {
  lead_submitted: "generate_lead",
  newsletter_subscribed: "sign_up",
  auth_sign_in: "login",
  auth_sign_up: "sign_up",
  auth_reset_password: "password_reset",
  auth_sign_out: "logout",
  checkout_started: "begin_checkout",
  booking_confirmed: "purchase",
  wizard_step: "wizard_step",
  cta_click: "cta_click",
  chat_opened: "chat_opened",
};

/**
 * Events worth finding a session recording for.
 *
 * Tagging is cheap, but a tag on every event is the same as no tags at all —
 * these are the outcomes where watching what the visitor actually did pays for
 * the time. High-frequency signals (`cta_click`, `wizard_step`) are deliberately
 * absent: they still become goals and funnel steps, just not recording tags.
 */
const PAGESENSE_RECORDING_TAGS: ReadonlySet<AnalyticsEvent> = new Set([
  "lead_submitted",
  "newsletter_subscribed",
  "auth_sign_up",
  "checkout_started",
  "booking_confirmed",
  // Worth replaying for a different reason than the others: the recording shows
  // what the visitor was stuck on immediately before they asked for a human.
  "chat_opened",
]);

/**
 * Events an operator should see in the visitor's live activity feed.
 *
 * Only outcomes that change how you'd handle the conversation. Everything else
 * is omitted on purpose: SalesIQ already records navigation, and a feed padded
 * with page views and CTA clicks is one an operator stops reading.
 *
 * `chat_opened` is absent because the operator is looking at the feed *because*
 * the chat opened — restating it would be noise.
 */
const SALESIQ_ACTIONS: Partial<Record<AnalyticsEvent, string>> = {
  lead_submitted: "Submitted a lead form",
  newsletter_subscribed: "Subscribed to the newsletter",
  auth_sign_up: "Created an account",
  auth_sign_in: "Signed in",
  checkout_started: "Started checkout",
  booking_confirmed: "Confirmed a booking",
};

/**
 * The operator-facing sentence for an event, sharpened with whichever property
 * identifies *which* form or product — "Submitted the discovery form" is
 * actionable in a way that "Submitted a lead form" is not.
 */
function salesIqActionLabel(
  event: AnalyticsEvent,
  properties: Record<string, unknown>,
): string | undefined {
  const base = SALESIQ_ACTIONS[event];
  if (!base) return undefined;

  const detail =
    event === "lead_submitted"
      ? (properties.programId ?? properties.kind)
      : event === "checkout_started" || event === "booking_confirmed"
        ? (properties.productId ?? properties.kind)
        : undefined;

  return typeof detail === "string" && detail ? `${base}: ${detail}` : base;
}

/** Meta standard events. Anything absent is not sent to the Pixel. */
const META_EVENT_NAMES: Partial<Record<AnalyticsEvent, string>> = {
  lead_submitted: "Contact",
  newsletter_subscribed: "Lead",
  auth_sign_up: "CompleteRegistration",
  checkout_started: "InitiateCheckout",
  booking_confirmed: "Purchase",
  cta_click: "Contact",
};

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

  // Reachable from server-side adapter paths (payments, bookings).
  if (typeof window === "undefined") return;

  const properties = props as Record<string, unknown>;

  try {
    window.gtag?.("event", GA4_EVENT_NAMES[event], properties);
  } catch {
    // A failing vendor SDK must never break a form submission.
  }

  try {
    const metaEvent = META_EVENT_NAMES[event];
    if (metaEvent) window.fbq?.("track", metaEvent, properties);
  } catch {
    /* ignore */
  }

  try {
    window.posthog?.capture(event, properties);
  } catch {
    /* ignore */
  }

  // PageSense takes the event name only — it has no property bag. The name is
  // what a dashboard Goal and a funnel step match on, so it must stay stable;
  // renaming an event here silently detaches it from its Goal.
  pageSenseTrackGoal(event);
  if (PAGESENSE_RECORDING_TAGS.has(event)) pageSenseTagRecording(event);

  // Puts the conversion on the visitor's SalesIQ timeline, so an operator who
  // picks the chat up mid-journey can see what they already did instead of
  // asking. No-ops unless the widget is configured and consent was given.
  const action = salesIqActionLabel(event, properties);
  if (action) salesIqCustomAction(action);
}
