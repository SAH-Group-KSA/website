/**
 * Globals injected by third-party tracking scripts.
 *
 * These are all optional: a script only defines its global after the visitor
 * accepts cookies AND the provider is configured. Every read must be guarded.
 */

type GtagCommand = "config" | "event" | "set" | "consent" | "js";

interface PostHogLike {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  __loaded?: boolean;
}

declare global {
  /** Values PageSense accepts for a visitor/activity attribute. */
  type PageSenseAttributes = Record<string, string | number | boolean>;

  /**
   * The PageSense command vocabulary, as implemented by the tag's queue
   * processor. `trackGoal` is an alias of `trackEvent`.
   */
  type PageSenseCommand =
    | ["trackEvent", string]
    | ["trackGoal", string]
    | ["trackRevenue", string, number]
    | ["identifyUser", string]
    | ["tagRecording", string]
    | ["trackUser", PageSenseAttributes]
    | ["trackActivity", string, PageSenseAttributes]
    | ["setTracking", boolean];

  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, ...args: unknown[]) => void;

    fbq?: {
      (...args: unknown[]): void;
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      push?: unknown;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: Window["fbq"];

    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    lintrk?: (action: string, payload?: Record<string, unknown>) => void;

    posthog?: PostHogLike;

    /** Zoho SalesIQ widget bootstrap object. */
    $zoho?: {
      salesiq?: {
        widgetcode?: string;
        values?: Record<string, unknown>;
        ready?: () => void;
        afterReady?: () => void;
        language?: (code: string) => void;
        privacy?: {
          updateCookieConsent?: (types: string[]) => void;
        };
      };
    };

    /** Zoho PageSense bootstrap config. */
    _ps_conf?: {
      version?: string;
      pauseRenderForManualActivation?: boolean;
    };
    /**
     * Zoho PageSense command queue.
     *
     * Before the tag loads this is a plain array that PageSense drains on init;
     * afterwards PageSense replaces `push` so commands run immediately. Pushing
     * works in both states, so callers never need to know which one they are in.
     *
     * It is created by the consent-gated inline script in `AnalyticsScripts`,
     * never by a helper — its absence is what makes every PageSense call a
     * no-op for a visitor who declined.
     */
    pagesense?: PageSenseCommand[];
  }
}

export {};
