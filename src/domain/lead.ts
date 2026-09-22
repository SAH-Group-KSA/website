/** Lead / application payloads — Zoho Forms / CRM contracts. */

import type { LeadAttribution } from "@/lib/attribution";

/**
 * First-touch acquisition data attached to every lead when the visitor has
 * accepted cookies and arrived with a campaign / referrer. Always optional —
 * direct traffic and declined-consent visitors submit without it.
 */
export type { LeadAttribution };

export type DiscoveryLead = {
  name: string;
  email: string;
  phone?: string;
  pathwayTitle: string;
  audienceLabel: string;
  needLabel: string;
  locale: "ar" | "en";
  attribution?: LeadAttribution;
};

export type ContactLead = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  context?: string;
  locale: "ar" | "en";
  attribution?: LeadAttribution;
};

export type GroupInterestLead = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  programId: string;
  message?: string;
  locale: "ar" | "en";
  attribution?: LeadAttribution;
};

export type ProgramInterestLead = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  programId: string;
  programTitle?: string;
  message?: string;
  locale: "ar" | "en";
  attribution?: LeadAttribution;
};

export type CommunityApplication = {
  name: string;
  email: string;
  phone?: string;
  communityId: "impact" | "lego";
  profession?: string;
  motivation: string;
  experience?: string;
  locale: "ar" | "en";
  attribution?: LeadAttribution;
};

export type NewsletterSubscribe = {
  firstName: string;
  lastName: string;
  email: string;
  locale: "ar" | "en";
  source?: "footer" | "inline" | "default";
};

export type AdapterResult =
  | { ok: true; id?: string }
  | { ok: false; code: "not_configured" | "validation" | "upstream"; message: string };
