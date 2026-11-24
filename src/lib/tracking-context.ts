/**
 * Per-submission tracking context, created in the browser and sent with a form.
 *
 * The `eventId` is the key Meta uses to recognise the browser Pixel event and
 * the server-side Conversions API event as ONE conversion. The browser fires
 * the Pixel with it after the server confirms; the server sends it to the
 * Conversions API. Without a shared id every lead would be counted twice.
 *
 * Its presence on a request is also the server's consent signal: it is only
 * created when analytics is enabled AND the visitor accepted cookies, so a
 * visitor who declined submits without it and the server sends Meta nothing.
 */

import { readConsent } from "@/lib/consent";
import { features } from "@/lib/features";

export type TrackingContext = {
  eventId: string;
  /** Sub-brand the visitor converted on — `<html data-theme>`, or `group`. */
  brand: string;
};

/** The sub-brand of the current page. Same fallback as PageSense's `brand`. */
export function currentBrand(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.documentElement.getAttribute("data-theme") || "group";
}

function newEventId(): string {
  try {
    // Available in every secure context (https and localhost).
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // Plain-http dev hosts (e.g. a LAN IP) lack randomUUID. Uniqueness, not
  // secrecy, is all an event id needs.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** `undefined` unless analytics is on and the visitor accepted cookies. */
export function createTrackingContext(): TrackingContext | undefined {
  if (typeof window === "undefined") return undefined;
  if (!features.analytics || readConsent() !== "accepted") return undefined;
  return { eventId: newEventId(), brand: currentBrand() ?? "group" };
}
