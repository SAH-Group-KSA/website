import type { AnalyticsEvent } from "@/adapters/analytics/events";

/**
 * How our vendor-neutral events appear in Meta.
 *
 * Shared by the browser Pixel (`track()`) and the server-side Conversions API
 * (`reportConversion()` in `app/api/zoho/_helpers.ts`). Meta deduplicates a
 * browser + server pair only when BOTH the event name and the event id match,
 * so the two sides must never derive the name independently — that is the
 * whole reason this lives in one module.
 *
 * `custom: true` sends via `fbq('trackCustom')` / a non-standard `event_name`.
 */
export type MetaEventSpec = { name: string; custom: boolean };

/** Anything absent is never sent to Meta. */
export const META_EVENTS: Partial<Record<AnalyticsEvent, MetaEventSpec>> = {
  // The event Meta lead campaigns optimise for. All five lead forms.
  lead_submitted: { name: "Lead", custom: false },
  coach_application_submitted: { name: "SubmitApplication", custom: false },
  // Custom, not `Lead`: a subscriber is not a sales lead, and counting them as
  // one would teach lead campaigns to find newsletter readers. Still usable for
  // audiences and Custom Conversions in Events Manager.
  newsletter_subscribed: { name: "NewsletterSignup", custom: true },
  auth_sign_up: { name: "CompleteRegistration", custom: false },
  // Email-link clicks. `Contact` is exactly Meta's meaning for this; it is
  // harmless now that real form leads are `Lead` rather than `Contact`.
  cta_click: { name: "Contact", custom: false },
  // Booking/payment flows are stubbed (see CLAUDE.md) and never fire today.
  checkout_started: { name: "InitiateCheckout", custom: false },
  booking_confirmed: { name: "Purchase", custom: false },
  // `chat_opened` and `wizard_step` are intent signals, not conversions —
  // sending them would inflate ad-reported results.
};

export type MetaCustomData = Record<string, string>;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

/**
 * Meta `custom_data` for an event.
 *
 * Uses Meta's own parameter names (`content_category`, `content_name`) so the
 * values are filterable in Custom Conversions without extra setup. `brand` is
 * the sub-brand (`<html data-theme>`, or `group`) — the one Pixel serves all
 * six sub-brands, and this is how per-brand conversions are told apart.
 *
 * Deliberately an allowlist per event rather than forwarding the property bag:
 * Meta restricts what some business categories may send, and the bag can carry
 * things Meta has no use for (e.g. `emailDomain` on auth events).
 */
export function metaCustomData(
  event: AnalyticsEvent,
  props: Record<string, unknown>,
  brand?: string,
): MetaCustomData {
  const data: Record<string, string | undefined> = { brand };

  switch (event) {
    case "lead_submitted":
      data.content_category = str(props.kind);
      data.content_name = str(props.programId);
      data.language = str(props.locale);
      break;
    case "coach_application_submitted":
      data.content_category = "coach_application";
      data.language = str(props.locale);
      break;
    case "newsletter_subscribed":
      data.content_category = str(props.source) ?? "default";
      data.language = str(props.locale);
      break;
    case "cta_click":
      data.content_name = str(props.id);
      break;
    case "checkout_started":
      data.content_category = str(props.kind);
      data.content_name = str(props.productId);
      break;
    default:
      break;
  }

  const out: MetaCustomData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value) out[key] = value;
  }
  return out;
}
