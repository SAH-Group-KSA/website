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
 * When FEATURE_CMS=1, merges Sanity marketing documents onto static JSON fallback.
 * Cached per request so SiteShell + page components share one fetch.
 */
export const getContent = cache(async function getContent(
  locale: Locale,
): Promise<SiteContent> {
  const fallback = staticContent(locale);
  if (!features.cms) return fallback;

  const [homeDoc, settingsDoc, companyDocs, programDocs] = await Promise.all([
    fetchHomePage(locale),
    fetchSiteSettings(locale),
    fetchCompanyPages(locale),
    fetchPrograms(locale),
  ]);

  const globalChrome = mapSiteSettings(settingsDoc, homeDoc, fallback);
  const mappedHome =
    mapHomeDocument(homeDoc, locale, { ...fallback, ...globalChrome }) ??
    { ...fallback, ...globalChrome };
  const entityPages = mapCompanyPagesToEntityPages(
    companyDocs ?? [],
    fallback.entityPages,
  );
  const programs = mapPrograms(programDocs ?? [], fallback.programs);

  return applyCanonicalEntityColors({
    ...mappedHome,
    ...globalChrome,
    catalogPages: {
      ...(fallback.catalogPages ?? catalogPagesEn),
      ...(mappedHome.catalogPages ?? {}),
      coaches: {
        ...(fallback.catalogPages?.coaches ?? catalogPagesEn.coaches),
        ...(mappedHome.catalogPages?.coaches ?? {}),
      },
      coachesGroup: {
        ...(fallback.catalogPages?.coachesGroup ?? catalogPagesEn.coachesGroup),
        ...(mappedHome.catalogPages?.coachesGroup ?? {}),
      },
      courses: {
        ...(fallback.catalogPages?.courses ?? catalogPagesEn.courses),
        ...(mappedHome.catalogPages?.courses ?? {}),
      },
    },
    entityPages,
    programs,
  });
});

/**
 * Per-route SEO strings for the Next.js Metadata API.
 * When FEATURE_CMS=1, reads from Sanity pageSeo documents with JSON fallback.
 */
export async function getPageSeo(
  locale: Locale,
  key: PageSeoKey,
): Promise<PageSeo> {
  const fallback = pagesSeo[locale]?.[key] ?? pagesSeo.en[key];
  if (!features.cms) return fallback;

  const doc = await sanityClient.fetch<unknown | null>(
    PAGE_SEO_QUERY,
    { locale, pageKey: key },
    { next: { tags: ["seo"] } },
  );

  return mapPageSeoDocument(doc, fallback) ?? fallback;
}

/** Bulk SEO fetch for sitemap/validation scripts. */
export async function getAllPageSeo(locale: Locale): Promise<PagesSeoContent> {
  const fallback = pagesSeo[locale] ?? pagesSeo.en;
  if (!features.cms) return fallback;

  const docs = await sanityClient.fetch<unknown[]>(
    PAGE_SEO_ALL_QUERY,
    { locale },
    { next: { tags: ["seo"] } },
  );

  const merged = { ...fallback };
  for (const doc of docs ?? []) {
    if (!doc || typeof doc !== "object") continue;
    const pageKey = (doc as { pageKey?: string }).pageKey;
    if (!pageKey || !(pageKey in merged)) continue;
    const mapped = mapPageSeoDocument(doc, merged[pageKey as PageSeoKey]);
    if (mapped) merged[pageKey as PageSeoKey] = mapped;
  }
  return merged;
}

export type { PageSeo, PageSeoKey, PagesSeoContent } from "./seo-types";
export type { Coach } from "@/domain/coach";
export type { Course } from "@/domain/course";
