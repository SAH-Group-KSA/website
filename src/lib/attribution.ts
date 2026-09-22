/**
 * First-touch lead attribution.
 *
 * Answers the question a salesperson has when a lead lands in CRM: where did
 * this person originally come from? GA4 and PostHog answer it in aggregate
 * ("LinkedIn produced 12 leads"); this attaches it to the individual record.
 *
 * FIRST-TOUCH, deliberately: the campaign that introduced someone is the more
 * useful signal for a considered B2B purchase than whatever they last clicked.
 * Once stored it is never overwritten.
 *
 * CONSENT: this is personal data and is only persisted after the visitor
 * accepts cookies. The landing URL is read into memory on first render — it
 * has to be, because the visitor usually accepts on the landing page and the
 * parameters are gone once they navigate — but nothing is written to storage
 * and nothing is transmitted until consent exists. If they decline, the
 * in-memory copy dies with the page.
 */

import { readConsent } from "@/lib/consent";

export const ATTRIBUTION_STORAGE_KEY = "sah-attribution";

export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  /** Ad click id, prefixed with its platform, e.g. `gclid:abc123`. */
  clickId?: string;
  /** External referring site (own-domain referrers are ignored). */
  referrer?: string;
  /** Path of the first page seen, e.g. `/coaches`. */
  landingPage?: string;
  /** ISO date (no time) of first visit. */
  firstSeen?: string;
};

/** Values longer than this are truncated — CRM text fields are not unbounded. */
const MAX_LEN = 255;

const CLICK_ID_PARAMS = ["gclid", "fbclid", "li_fat_id", "msclkid", "ttclid"];

function clip(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > MAX_LEN ? trimmed.slice(0, MAX_LEN) : trimmed;
}

/** Referrers from our own host carry no acquisition information. */
function externalReferrer(): string | undefined {
  try {
    const raw = document.referrer;
    if (!raw) return undefined;
    const url = new URL(raw);
    if (url.hostname === window.location.hostname) return undefined;
    return clip(url.hostname + url.pathname);
  } catch {
    return undefined;
  }
}

function readFromLocation(): LeadAttribution {
  const params = new URLSearchParams(window.location.search);

  let clickId: string | undefined;
  for (const key of CLICK_ID_PARAMS) {
    const value = clip(params.get(key));
    if (value) {
      clickId = `${key}:${value}`;
      break;
    }
  }

  return {
    utmSource: clip(params.get("utm_source")),
    utmMedium: clip(params.get("utm_medium")),
    utmCampaign: clip(params.get("utm_campaign")),
    utmTerm: clip(params.get("utm_term")),
    utmContent: clip(params.get("utm_content")),
    clickId,
    referrer: externalReferrer(),
    landingPage: clip(window.location.pathname),
    firstSeen: new Date().toISOString().slice(0, 10),
  };
}

function isEmpty(attr: LeadAttribution): boolean {
  // `landingPage` and `firstSeen` are always present, so they don't count
  // toward "did we actually learn anything about acquisition?".
  return !(
    attr.utmSource ||
    attr.utmMedium ||
    attr.utmCampaign ||
    attr.utmTerm ||
    attr.utmContent ||
    attr.clickId ||
    attr.referrer
  );
}

/**
 * In-memory capture of this page load. Populated before consent is known;
 * never written anywhere until `persistAttribution()` is called.
 */
let pending: LeadAttribution | null = null;

/** Read the current URL into memory. Safe to call repeatedly. */
export function captureAttribution(): void {
  if (typeof window === "undefined" || pending) return;
  pending = readFromLocation();
}

function readStored(): LeadAttribution | null {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as LeadAttribution;
  } catch {
    return null;
  }
}

/**
 * Persist the captured attribution, if consent allows and nothing is stored
 * yet. First-touch wins: an existing record is never replaced.
 */
export function persistAttribution(): void {
  if (typeof window === "undefined") return;
  if (readConsent() !== "accepted") return;

  captureAttribution();
  if (!pending) return;
  if (readStored()) return;

  // A visit with no UTM, no click id and no external referrer is direct
  // traffic; storing landing page alone adds noise to every lead.
  if (isEmpty(pending)) return;

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // Storage unavailable — attribution is best-effort, never load-bearing.
  }
}

/**
 * Attribution to attach to a lead, or `undefined` when there is none —
 * no consent, direct traffic, or storage unavailable.
 */
export function getAttribution(): LeadAttribution | undefined {
  if (typeof window === "undefined") return undefined;
  if (readConsent() !== "accepted") return undefined;
  const stored = readStored();
  if (!stored || isEmpty(stored)) return undefined;
  return stored;
}
