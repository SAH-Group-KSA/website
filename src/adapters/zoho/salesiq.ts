import { getAnalyticsConfig } from "@/lib/analytics-config";

/**
 * Zoho SalesIQ — live chat, chatbots and visitor tracking.
 *
 * Gated by `features.salesIq` + `env.zohoSalesIqWidgetCode()` (both resolved in
 * `analytics-config.ts`) AND cookie consent. The widget itself is injected by
 * `src/components/analytics/AnalyticsScripts.tsx`, which owns the consent gate;
 * this module is the only place components talk to the widget's JS API.
 *
 * One brand serves both locales: the brand's chat language is set to
 * "Website Language", so the widget follows `<html lang>` on each page.
 */

/** Server-safe accessor: is the widget configured at all? */
export function getSalesIqWidgetCode(): string | null {
  return getAnalyticsConfig().salesIqWidget ?? null;
}

/**
 * Run `fn` once the SalesIQ API is usable, or drop it if the widget will never
 * load.
 *
 * `window.__sahSalesIq` is created by the consent-gated bootstrap in
 * `AnalyticsScripts` and deliberately NOT created here — exactly like
 * `window.pagesense`. Its absence means "the visitor declined, or SalesIQ is
 * not configured", so every call below becomes a structural no-op without any
 * component reading consent itself.
 *
 * The queue exists because the widget is loaded lazily (`strategy="lazyOnload"`)
 * and can therefore still be in flight when a form is submitted or a page is
 * viewed. Those calls are held and replayed on `ready` rather than lost.
 *
 * Never throws: a chat-widget failure must not break a form submission.
 */
function whenSalesIqReady(fn: (api: SalesIqApi) => void): void {
  try {
    const bridge = window.__sahSalesIq;
    if (!bridge) return;

    const run = () => {
      try {
        const api = window.$zoho?.salesiq;
        if (api) fn(api);
      } catch {
        /* ignore */
      }
    };

    if (bridge.ready) run();
    else bridge.queue.push(run);
  } catch {
    /* ignore */
  }
}

/**
 * Create the bridge if the bootstrap script has not run yet.
 *
 * Callable ONLY from inside the consent gate — `SalesIqVisitorContext` is its
 * one caller, and that component renders only in `AnalyticsScripts`' accepted
 * branch. Calling it anywhere else would hand a visitor who declined a live
 * queue and break the guarantee the rest of this module rests on.
 *
 * It exists because `next/script` decides when to inject the inline bootstrap,
 * and React runs this component's effects in the same commit. Rather than
 * depend on which of the two wins, whichever arrives first creates the bridge
 * and the other finds it already there.
 */
export function ensureSalesIqBridge(): void {
  if (typeof window === "undefined") return;
  window.__sahSalesIq ??= { ready: false, queue: [] };
}

/** True when the widget is configured and the visitor has consented. */
export function isSalesIqAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.__sahSalesIq);
}

/**
 * Attach key/value context to the conversation.
 *
 * This is the difference between an operator seeing "a visitor from Riyadh" and
 * seeing which sub-brand, which language and which campaign brought them —
 * without asking. The same keys are readable by a bot as
 * `%visitor.custominfo.<key>%` and usable as trigger conditions, so they are
 * the main lever for routing and proactive chat.
 *
 * Safe to call repeatedly; SalesIQ merges each call into the existing set.
 */
export function salesIqSetInfo(info: SalesIqVisitorInfo): void {
  if (Object.keys(info).length === 0) return;
  whenSalesIqReady((api) => api.visitor?.info?.(info));
}

/**
 * Identify a known visitor, so the chat opens against their history instead of
 * an anonymous session and lands on the right CRM contact.
 *
 * `id` must be stable per person and never reused — SalesIQ shows previous
 * conversations for that id, so a collision would show one visitor another's
 * chat history.
 */
export function salesIqIdentify(visitor: {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}): void {
  whenSalesIqReady((api) => {
    // `id` first: it is what the remaining fields get attached to.
    if (visitor.id) api.visitor?.id?.(visitor.id.slice(0, 100));
    if (visitor.name) api.visitor?.name?.(visitor.name);
    if (visitor.email) api.visitor?.email?.(visitor.email);
    if (visitor.phone) api.visitor?.contactnumber?.(visitor.phone);
  });
}

/** SalesIQ truncates silently past this, so clip rather than lose the line. */
const CUSTOM_ACTION_MAX_LEN = 250;

/**
 * Append a line to the visitor's live activity feed in the operator console.
 *
 * Reserve this for things an operator would want to see mid-conversation
 * ("submitted the discovery form"), not for page views — SalesIQ already
 * tracks navigation itself, and a noisy feed is an ignored feed.
 */
export function salesIqCustomAction(label: string): void {
  const clipped = label.trim().slice(0, CUSTOM_ACTION_MAX_LEN);
  if (!clipped) return;
  whenSalesIqReady((api) => api.visitor?.customaction?.(clipped));
}

/**
 * Choose which departments the pre-chat form offers.
 *
 * Only called when `NEXT_PUBLIC_ZOHO_SALESIQ_DEPARTMENTS` maps the current
 * brand to a department name. Names must match the SalesIQ console exactly —
 * an unknown name offers the visitor nothing to pick, which is why this stays
 * opt-in rather than deriving names from brand ids.
 */
export function salesIqSetDepartments(departments: string[]): void {
  if (departments.length === 0) return;
  whenSalesIqReady((api) => api.chat?.department?.(departments));
}

/**
 * Register a handler for the visitor clicking the float button.
 *
 * SalesIQ keeps one handler per registration call, so callers must register
 * once per page load — see the ref guard in `SalesIqVisitorContext`.
 */
export function salesIqOnChatButtonClick(handler: () => void): void {
  whenSalesIqReady((api) => api.chatbutton?.click?.(handler));
}

/**
 * Open the chat window from one of our own CTAs, optionally pre-filling the
 * visitor's opening question.
 *
 * Must be called from a real user gesture (a click handler) — SalesIQ ignores
 * `chat.start()` outside one, the same way browsers ignore programmatic
 * `window.open`.
 */
export function salesIqOpenChat(question?: string): void {
  whenSalesIqReady((api) => {
    if (question) api.visitor?.question?.(question);
    api.chat?.start?.();
  });
}

/** Show or hide the float button (e.g. on a surface with its own support UI). */
export function salesIqSetFloatButtonVisible(visible: boolean): void {
  whenSalesIqReady((api) => api.floatbutton?.visible?.(visible ? "show" : "hide"));
}

/** @deprecated Use `getSalesIqWidgetCode()`; the widget is no longer injected as raw HTML. */
export function getSalesIqSnippet(): string | null {
  return null;
}
