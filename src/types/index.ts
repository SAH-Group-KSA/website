import type { Locale } from "@/types/locale";

export type EntityKey =
  | "group"
  | "human"
  | "seera"
  | "nexus"
  | "connect"
  | "lego"
  | "impact";

export type AudienceType = "individual" | "organization";

export type ProgramLevel = 1 | 2 | 3;

export type NavItem = {
  href: string;
  labelKey: string;
};

export type SocialNetwork = "instagram" | "facebook";

export type SocialProfile = {
  network: SocialNetwork;
  /** Full https URL of the official profile. Leave "" until confirmed. */
  url: string;
};

export type SiteConfig = {
  name: string;
  url: string;
  email: string;
  location: string;
  defaultLocale: Locale;
  /** Default Open Graph / Twitter share image (public path). */
  ogImage: string;
  /** Optional Twitter/X @handle for card attribution. */
  twitterHandle?: string;
  /** Organization social profile URLs for JSON-LD `sameAs`. */
  sameAs?: string[];
  /** Official social profiles, linked from the footer. Empty URL = not shown. */
  socialProfiles?: SocialProfile[];
  /** Search Console / Bing verification tokens (wire into metadata.verification later). */
  verification?: {
    google?: string;
    bing?: string;
  };
};
