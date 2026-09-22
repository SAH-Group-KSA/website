/**
 * Cookie consent state — the single gate in front of every tracking script.
 *
 * Storage is `localStorage`, read/written only in the browser. Every access is
 * wrapped: Safari private mode and blocked site data both throw on access, and
 * a thrown read must degrade to "no choice yet", never to "accepted".
 *
 * Changes broadcast on a custom event so multiple listeners (banner, script
 * loader, attribution capture) react to one click without prop drilling —
 * same pattern as `src/lib/interactions.ts`.
 */

export const CONSENT_STORAGE_KEY = "sah-cookie-consent";

/** Broadcast when the visitor accepts, declines, or resets their choice. */
export const SAH_CONSENT_CHANGED = "sah:consent-changed";

export type ConsentValue = "accepted" | "declined";

/** `null` means the visitor has not chosen yet — show the banner, track nothing. */
export type ConsentState = ConsentValue | null;

function isConsentValue(value: string | null): value is ConsentValue {
  return value === "accepted" || value === "declined";
}

/** Read the stored choice. Returns `null` when unset, unreadable, or corrupt. */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return isConsentValue(stored) ? stored : null;
  } catch {
    // Storage blocked (private mode, cookie-blocking extension). Treat as
    // undecided: the banner reappears each visit and nothing is tracked.
    return null;
  }
}

/** Persist a choice and notify listeners. Broadcasts even if storage fails. */
export function writeConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Non-fatal: the choice applies to this page view, just isn't remembered.
  }
  notifyConsentChanged(value);
}

/** Clear the stored choice so the banner shows again (used by "Cookie settings"). */
export function resetConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
  notifyConsentChanged(null);
}

function notifyConsentChanged(value: ConsentState): void {
  window.dispatchEvent(
    new CustomEvent<ConsentState>(SAH_CONSENT_CHANGED, { detail: value }),
  );
}

/**
 * Subscribe to consent changes in this tab (custom event) and other tabs
 * (native `storage` event). Returns an unsubscribe function.
 */
export function subscribeConsent(listener: (value: ConsentState) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustom = (event: Event) => {
    listener((event as CustomEvent<ConsentState>).detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== CONSENT_STORAGE_KEY) return;
    listener(readConsent());
  };

  window.addEventListener(SAH_CONSENT_CHANGED, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(SAH_CONSENT_CHANGED, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
