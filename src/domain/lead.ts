/** Lead / application payloads — Zoho Forms / CRM contracts. */

export type DiscoveryLead = {
  name: string;
  email: string;
  phone?: string;
  pathwayTitle: string;
  audienceLabel: string;
  needLabel: string;
  locale: "ar" | "en";
};

export type ContactLead = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message?: string;
  context?: string;
  locale: "ar" | "en";
};

export type GroupInterestLead = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  programId?: string;
  message?: string;
  locale: "ar" | "en";
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
