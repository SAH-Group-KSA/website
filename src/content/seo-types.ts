/**
 * Static page SEO schema — bilingual JSON under `src/content/{locale}/pages-seo.json`.
 *
 * Titles are short page names. The root layout title template appends `| siteName`,
 * unless `absoluteTitle` is true (home brand titles).
 *
 * Metadata boundary (do not bypass):
 * - Static pages → `getPageSeo(locale, key)` → `buildMetadataFromPageSeo`
 * - Catalog entities (coach / program) → `buildPageMetadata` from catalog fields
 *
 * When a CMS lands, map documents into `PageSeo` (or catalog types) first.
 * Keep `buildPageMetadata` as the only Metadata API writer — no CMS calls in pages.
 *
 * URL assumptions (localePrefix: as-needed, default ar):
 * - Arabic: `https://sah.com.sa/path`
 * - English: `https://sah.com.sa/en/path`
 * - `path` on PageSeo is always locale-agnostic (`/coaches`, `/`, …)
 */

export type PageSeoKey =
  | "home"
  | "discovery"
  | "sahHuman"
  | "seera"
  | "sahNexus"
  | "sahSponsor"
  | "legoBySah"
  | "sahImpact"
  | "coaches"
  | "coachesGroup"
  | "courses"
  | "communityApply"
  | "authLogin"
  | "authRegister"
  | "authForgotPassword"
  | "dashboard"
  | "dashboardCourses"
  | "dashboardBookings"
  | "dashboardProfile"
  | "notFound";

export type PageSeoRobots = "index" | "noindex";

export interface PageSeo {
  /** Short title for the Metadata API (template appends site name unless absolute). */
  title: string;
  description: string;
  /** Locale-agnostic path, e.g. `/coaches` or `/`. */
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Public asset path, e.g. `/og/og-share.png`. Per-page OG when assets exist. */
  ogImage?: string;
  /** Open Graph image alt text (defaults to site name in the builder). */
  ogImageAlt?: string;
  /** Use title as-is (skip root `%s | siteName` template). */
  absoluteTitle?: boolean;
  robots?: PageSeoRobots;
}

export type PagesSeoContent = Record<PageSeoKey, PageSeo>;
