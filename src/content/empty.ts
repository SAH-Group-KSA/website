import type { CatalogPagesContent, SiteContent } from "./types";
import type { PageSeo, PageSeoKey, PagesSeoContent } from "./seo-types";
import type { Locale } from "@/types/locale";
import { applyCanonicalEntityColors } from "@/lib/brand-themes";
import en from "./en/home.json";
import ar from "./ar/home.json";
import enPagesSeo from "./en/pages-seo.json";
import { catalogPagesEn } from "./defaults/catalog-pages";

/**
 * Strip marketing copy from a JSON/TS shape while keeping object keys so
 * CMS mappers and UI still receive a fully-typed SiteContent shell.
 * Arrays are emptied (no leftover list items from static catalogs).
 */
function blankValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = blankValue(child);
    }
    return out;
  }
  return value;
}

const shape: Record<Locale, SiteContent> = {
  en: en as SiteContent,
  ar: ar as SiteContent,
};

/** Empty typed shell for CMS mode — no static marketing copy. */
export function emptySiteContent(locale: Locale): SiteContent {
  const blanked = blankValue(shape[locale] ?? shape.en) as SiteContent;
  const catalogPages = blankValue(catalogPagesEn) as CatalogPagesContent;

  return applyCanonicalEntityColors({
    ...blanked,
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    programs: [],
    entities: [],
    partners: [],
    methodSteps: [],
    journeyExamples: [],
    catalogPages,
  });
}

export function emptyPageSeo(path = ""): PageSeo {
  return {
    title: "",
    description: "",
    path,
  };
}

/** Empty SEO map keyed like pages-seo.json (paths only, no copy). */
export function emptyPagesSeo(): PagesSeoContent {
  const keys = Object.keys(enPagesSeo) as PageSeoKey[];
  const out = {} as PagesSeoContent;
  for (const key of keys) {
    const path =
      typeof (enPagesSeo as Record<string, { path?: string }>)[key]?.path ===
      "string"
        ? (enPagesSeo as Record<string, { path?: string }>)[key].path!
        : "";
    out[key] = emptyPageSeo(path);
  }
  return out;
}
