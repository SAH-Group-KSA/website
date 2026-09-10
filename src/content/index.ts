import type { Locale, SiteContent } from "./types";
import type { PageSeo, PageSeoKey, PagesSeoContent } from "./seo-types";
import { cache } from "react";
import { applyCanonicalEntityColors } from "@/lib/brand-themes";
import { features } from "@/lib/features";
import en from "./en/home.json";
import ar from "./ar/home.json";
import enPagesSeo from "./en/pages-seo.json";
import arPagesSeo from "./ar/pages-seo.json";
import {
  mapCompanyPagesToEntityPages,
  mapHomeDocument,
  mapPrograms,
} from "./mappers/home";
import { mapSiteSettings } from "./mappers/siteSettings";
import { mapPageSeoDocument } from "./mappers/pageSeo";
import {
  catalogPagesAr,
  catalogPagesEn,
} from "./defaults/catalog-pages";
import { emptyPageSeo, emptyPagesSeo, emptySiteContent } from "./empty";
import {
  COMPANY_PAGES_QUERY,
  HOME_PAGE_QUERY,
  PAGE_SEO_ALL_QUERY,
  PAGE_SEO_QUERY,
  PROGRAMS_QUERY,
  SITE_SETTINGS_QUERY,
  sanityClient,
} from "@/lib/sanity";

export {
  getCoaches,
  getCoachBySlug,
  getCoachSlugs,
} from "./catalog/coaches";
export {
  getCourses,
  getCourseBySlug,
  getCourseSlugs,
} from "./catalog/courses";
export {
  getPrograms,
  getProgramById,
  getProgramIds,
  getProgramEntityMap,
  getProgramEntityId,
} from "./catalog/programs";

const content: Record<Locale, SiteContent> = {
  en: en as SiteContent,
  ar: ar as SiteContent,
};

const pagesSeo: Record<Locale, PagesSeoContent> = {
  en: enPagesSeo as PagesSeoContent,
  ar: arPagesSeo as PagesSeoContent,
};

function staticContent(locale: Locale): SiteContent {
  const base = applyCanonicalEntityColors(content[locale] ?? content.en);
  const catalogPages = locale === "ar" ? catalogPagesAr : catalogPagesEn;
  return {
    ...base,
    catalogPages,
    ui: {
      ...base.ui,
      breadcrumbHome: locale === "ar" ? "الرئيسية" : "Home",
    },
  };
}

async function fetchSiteSettings(locale: Locale) {
  return sanityClient.fetch<unknown | null>(
    SITE_SETTINGS_QUERY,
    { locale },
    { next: { tags: ["site-settings"] } },
  );
}

async function fetchHomePage(locale: Locale) {
  return sanityClient.fetch<unknown | null>(
    HOME_PAGE_QUERY,
    { locale },
    // Short revalidate so cleared CMS fields (e.g. formDevNotice) don't stick
    // forever in the Next data cache when the Sanity webhook is delayed.
    { next: { tags: ["home"], revalidate: 30 } },
  );
}

async function fetchCompanyPages(locale: Locale) {
  return sanityClient.fetch<unknown[]>(
    COMPANY_PAGES_QUERY,
    { locale },
    { next: { tags: ["home", "companies"] } },
  );
}

async function fetchPrograms(locale: Locale) {
  return sanityClient.fetch<unknown[]>(
    PROGRAMS_QUERY,
    { locale },
    { next: { tags: ["programs"] } },
  );
}

/**
 * Returns the fully-typed site content for a locale.
 * When FEATURE_CMS=1, content comes only from Sanity (empty shell if docs missing).
 * When FEATURE_CMS=0, serves static JSON / catalog defaults.
 * Cached per request so SiteShell + page components share one fetch.
 */
export const getContent = cache(async function getContent(
  locale: Locale,
): Promise<SiteContent> {
  if (!features.cms) return staticContent(locale);

  const base = emptySiteContent(locale);
  const [homeDoc, settingsDoc, companyDocs, programDocs] = await Promise.all([
    fetchHomePage(locale),
    fetchSiteSettings(locale),
    fetchCompanyPages(locale),
    fetchPrograms(locale),
  ]);

  const globalChrome = mapSiteSettings(settingsDoc, homeDoc, base);
  const mappedHome =
    mapHomeDocument(homeDoc, locale, { ...base, ...globalChrome }) ??
    { ...base, ...globalChrome };
  const entityPages = mapCompanyPagesToEntityPages(
    companyDocs ?? [],
    base.entityPages,
  );
  const programs = mapPrograms(programDocs ?? []);

  return applyCanonicalEntityColors({
    ...mappedHome,
    ...globalChrome,
    catalogPages: mappedHome.catalogPages ?? base.catalogPages,
    entityPages,
    programs,
  });
});

/**
 * Per-route SEO strings for the Next.js Metadata API.
 * When FEATURE_CMS=1, reads only from Sanity pageSeo documents (no JSON copy).
 */
export async function getPageSeo(
  locale: Locale,
  key: PageSeoKey,
): Promise<PageSeo> {
  if (!features.cms) {
    return pagesSeo[locale]?.[key] ?? pagesSeo.en[key];
  }

  const doc = await sanityClient.fetch<unknown | null>(
    PAGE_SEO_QUERY,
    { locale, pageKey: key },
    { next: { tags: ["seo"] } },
  );

  const mapped = mapPageSeoDocument(doc);
  if (mapped) return mapped;

  const staticPath = pagesSeo[locale]?.[key]?.path ?? pagesSeo.en[key]?.path ?? "";
  return emptyPageSeo(staticPath);
}

/** Bulk SEO fetch for sitemap/validation scripts. */
export async function getAllPageSeo(locale: Locale): Promise<PagesSeoContent> {
  if (!features.cms) return pagesSeo[locale] ?? pagesSeo.en;

  const docs = await sanityClient.fetch<unknown[]>(
    PAGE_SEO_ALL_QUERY,
    { locale },
    { next: { tags: ["seo"] } },
  );

  const merged = emptyPagesSeo();
  for (const doc of docs ?? []) {
    if (!doc || typeof doc !== "object") continue;
    const pageKey = (doc as { pageKey?: string }).pageKey;
    if (!pageKey || !(pageKey in merged)) continue;
    const mapped = mapPageSeoDocument(doc);
    if (mapped) merged[pageKey as PageSeoKey] = mapped;
  }
  return merged;
}

export type { PageSeo, PageSeoKey, PagesSeoContent } from "./seo-types";
export type { Coach } from "@/domain/coach";
export type { Course } from "@/domain/course";
