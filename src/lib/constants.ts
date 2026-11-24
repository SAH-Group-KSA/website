import type { NavItem, SiteConfig, SocialProfile } from "@/types";
import { defaultLocale } from "@/types/locale";

/**
 * Official SAH Group profiles. Fill in the URL once confirmed — an empty URL
 * renders nothing in the footer and is left out of the Organization JSON-LD.
 * Instagram must be the account connected to the Meta Business portfolio.
 */
const SOCIAL_PROFILES: SocialProfile[] = [
  { network: "instagram", url: "" },
  { network: "facebook", url: "" },
];

const socialProfiles = SOCIAL_PROFILES.filter((profile) =>
  /^https:\/\//.test(profile.url),
);

export const siteConfig: SiteConfig = {
  name: "SAH Group",
  url: "https://sah.com.sa",
  email: "info@sah.com.sa",
  location: "Riyadh, Kingdom of Saudi Arabia",
  defaultLocale,
  /** Default Open Graph / Twitter image — override per page via `PageSeo.ogImage`. */
  ogImage: "/images/backgrounds/IMG_9155.JPG.jpeg",
  // twitterHandle: "@sahgroup", // enables Twitter card site/creator attribution
  // Feeds Organization JSON-LD `sameAs` — populate via `socialProfiles` above.
  sameAs: socialProfiles.map((profile) => profile.url),
  socialProfiles,
  // verification: { google: "", bing: "" }, // Search Console / Bing — wired in buildPageMetadata
};

export const primaryNav: NavItem[] = [
  { href: "#need", labelKey: "findYourPath" },
  { href: "#entities", labelKey: "sahGroup" },
  { href: "#solutions", labelKey: "solutions" },
  { href: "#programs", labelKey: "programs" },
  { href: "#initiatives", labelKey: "initiatives" },
  { href: "#partners", labelKey: "partners" },
  { href: "#about", labelKey: "about" },
  { href: "#community", labelKey: "community" },
];

export const sectionIds = [
  "top",
  "promise",
  "need",
  "entities",
  "method-intro",
  "method",
  "programs",
  "journeys",
  "partners",
  "impact",
  "initiatives",
  "about",
  "community",
  "faq",
  "contact",
] as const;

export type SectionId = (typeof sectionIds)[number];
