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
    pagesense?: unknown[];
  }
}

export {};
