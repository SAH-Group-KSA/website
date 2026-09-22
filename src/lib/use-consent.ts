"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readConsent,
  resetConsent,
  subscribeConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

export type UseConsentResult = {
  /** `null` until the visitor chooses. Always `null` during SSR. */
  consent: ConsentState;
  /**
   * `false` during SSR and the hydrating render, `true` afterwards.
   * Consumers MUST render nothing while false: `localStorage` is unreadable on
   * the server, so a returning visitor would otherwise see the banner flash
   * before their stored choice is known.
   */
  hydrated: boolean;
  accept: () => void;
  decline: () => void;
  reset: () => void;
};

/** Server snapshot: no storage, so no choice is known. */
function serverConsent(): ConsentState {
  return null;
}

const subscribeNever = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

/**
 * Reads cookie consent as external state, staying in sync with changes from
 * other components and other browser tabs.
 *
 * Uses `useSyncExternalStore` rather than `useState` + `useEffect` because
 * `localStorage` is exactly that: a store outside React, mutated from places
 * React does not know about (another tab, another component's click).
 */
export function useConsent(): UseConsentResult {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);

  const hydrated = useSyncExternalStore(subscribeNever, alwaysTrue, alwaysFalse);

  const accept = useCallback(() => writeConsent("accepted"), []);
  const decline = useCallback(() => writeConsent("declined"), []);
  const reset = useCallback(() => resetConsent(), []);

  return { consent, hydrated, accept, decline, reset };
}
