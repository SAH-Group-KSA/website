import type { NavItem, SiteConfig } from "@/types";
import { defaultLocale } from "@/types/locale";

export const siteConfig: SiteConfig = {
  name: "SAH Group",
  url: "https://sah.com.sa",
  email: "info@sah.com.sa",
  location: "Riyadh, Kingdom of Saudi Arabia",
  defaultLocale,
  /** Default Open Graph / Twitter image — override per page via `PageSeo.ogImage`. */
  ogImage: "/og/og-share.png",
  // twitterHandle: "@sahgroup", // enables Twitter card site/creator attribution
  // Populate when social profiles are confirmed — feeds Organization JSON-LD `sameAs`.
  sameAs: [],
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
