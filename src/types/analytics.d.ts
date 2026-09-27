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

  /**
   * Key/value pairs shown to the operator beside the conversation, and
   * readable by a bot as `%visitor.custominfo.<key>%`.
   *
   * Keys are referenced verbatim in bot scripts and trigger rules, so they
   * must stay lowercase, snake_case and stable — renaming one silently
   * detaches every rule that reads it.
   */
  type SalesIqVisitorInfo = Record<string, string | number | boolean>;

  /**
   * The subset of the SalesIQ JS API this site uses.
   *
   * Every member is optional because the whole object is built up in stages:
   * our bootstrap creates `$zoho.salesiq` with only `ready`/`afterReady`, and
   * the widget script fills in `visitor`, `chat`, `chatbutton` and the rest
   * when it loads. Nothing below `ready` exists before then — which is why all
   * calls go through `whenSalesIqReady()` in `adapters/zoho/salesiq.ts`.
   */
  interface SalesIqApi {
    widgetcode?: string;
    values?: Record<string, unknown>;
    ready?: () => void;
    afterReady?: () => void;
    language?: (code: string) => void;
    visitor?: {
      name?: (value: string) => void;
      email?: (value: string) => void;
      contactnumber?: (value: string) => void;
      /** Stable cross-device id. Max 100 chars; a wrong id leaks chat history. */
      id?: (value: string) => void;
      /** Pre-fills the visitor's opening question before `chat.start()`. */
      question?: (value: string) => void;
      info?: (attributes: SalesIqVisitorInfo) => void;
      /** Appends a line to the visitor's activity feed. Max 250 chars. */
      customaction?: (label: string) => void;
    };
    chat?: {
      /** Opens the chat window. Must be called from a user gesture. */
      start?: () => void;
      /** Departments offered in the pre-chat form. */
      department?: (departments: string[]) => void;
    };
    chatbutton?: {
      /** Registers a handler fired when the visitor clicks the float button. */
      click?: (handler: () => void) => void;
    };
    floatbutton?: {
      visible?: (state: "show" | "hide") => void;
    };
    privacy?: {
      updateCookieConsent?: (types: string[]) => void;
    };
  }

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
      salesiq?: SalesIqApi;
    };

    /**
     * Bridge between the consent-gated SalesIQ bootstrap and the adapter.
     *
     * `$zoho.salesiq.ready` is a single assignable property, not an event
     * emitter — a second assignment silently replaces the first. So exactly one
     * `ready` handler is installed (by `AnalyticsScripts`), and everything else
     * that needs the API registers through this queue instead.
     *
     * Created only inside the consent gate, like `window.pagesense`: its
     * absence is what makes every SalesIQ call a no-op for a visitor who
     * declined, without any component having to read consent itself.
     */
    __sahSalesIq?: {
      /** True once the widget has loaded and the queue has been drained. */
      ready: boolean;
      /** Callbacks registered before the widget finished loading. */
      queue: Array<() => void>;
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
