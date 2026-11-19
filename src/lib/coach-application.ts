/**
 * "Apply as Coach" constants shared by the form and the API route, so the
 * option ids the browser sends and the values the server accepts cannot drift.
 */

/**
 * Specialisation options. `zoho` is the picklist value written to CRM — always
 * English, regardless of the applicant's locale, so CRM filters work.
 */
export const COACH_SPECIALISATIONS = [
  { id: "life", zoho: "Life" },
  { id: "executive", zoho: "Executive & Leadership" },
  { id: "career", zoho: "Career" },
  { id: "team", zoho: "Team" },
  { id: "wellbeing", zoho: "Wellbeing" },
  { id: "relationships", zoho: "Relationships & Family" },
  { id: "other", zoho: "Other" },
] as const;

export type CoachSpecialisationId = (typeof COACH_SPECIALISATIONS)[number]["id"];

export const COACH_LANGUAGES = [
  { id: "ar", zoho: "Arabic" },
  { id: "en", zoho: "English" },
  { id: "both", zoho: "Both" },
] as const;

export type CoachLanguageId = (typeof COACH_LANGUAGES)[number]["id"];

export const COACH_SPECIALISATION_IDS = COACH_SPECIALISATIONS.map((s) => s.id) as [
  CoachSpecialisationId,
  ...CoachSpecialisationId[],
];

export const COACH_LANGUAGE_IDS = COACH_LANGUAGES.map((l) => l.id) as [
  CoachLanguageId,
  ...CoachLanguageId[],
];

export const COACH_FIELD_LIMITS = {
  name: 120,
  city: 80,
  certifications: 1000,
  bio: 3000,
  maxYears: 60,
} as const;

/**
 * Submissions faster than this after the form rendered are treated as bots.
 * A person cannot fill the required fields in under three seconds.
 */
export const COACH_FORM_MIN_FILL_MS = 3000;

/** True for an http(s) URL on linkedin.com or one of its subdomains. */
export function isLinkedInUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      (host === "linkedin.com" || host.endsWith(".linkedin.com"))
    );
  } catch {
    return false;
  }
}
