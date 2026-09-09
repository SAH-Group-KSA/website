/**
 * Next.js Metadata + JSON-LD boundary for the static marketing site.
 *
 * Architecture (keep this shape when SEO content grows):
 * 1. Static `PageSeo` records → `getPageSeo` → `buildMetadataFromPageSeo`
 * 2. Entity pages (coach / program) → `buildPageMetadata` from catalog fields
 * 3. JSON-LD helpers → `<JsonLd>` in server page components only
 * 4. Sitemap / robots consume `PUBLIC_SITEMAP_PATHS` + catalog slug getters
 *
 * Do not fetch SEO from a CMS or remote API inside pages. Map any future CMS
 * documents into `PageSeo` / catalog types first, then call these builders.
 */

import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { COMPANY_ROUTES } from "@/lib/companies";
import { defaultLocale, localePath, type Locale } from "@/types/locale";
import type { PageSeo } from "@/content/seo-types";

export type BuildMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  /** Locale-agnostic path (`/` or `/coaches`). Becomes the canonical + OG url. */
  path?: string;
  siteName?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Public path or absolute URL. Defaults to `siteConfig.ogImage`. */
  ogImage?: string;
  /** Image alt for Open Graph (defaults to site name). */
  ogImageAlt?: string;
  /** Skip root `%s | siteName` template (already-branded titles). */
  absoluteTitle?: boolean;
  noIndex?: boolean;
};

/** Public marketing routes included in sitemap (locale-agnostic paths). */
export const PUBLIC_SITEMAP_PATHS: readonly string[] = [
  "",
  "/discovery",
  "/coaches",
  "/coaches/group",
  "/courses",
  "/community/apply",
  ...COMPANY_ROUTES.map((route) => `/${route.slug}`),
];

/**
 * @deprecated Prefer `getCoachSlugs()` from `@/content`.
 * Kept empty so older imports do not invent sitemap entries.
 */
export const SITEMAP_COACH_SLUGS: readonly string[] = [];

export function canonicalUrl(locale: Locale, path = ""): string {
  const localized = localePath(locale, path);
  if (localized === "/") return siteConfig.url;
  return `${siteConfig.url}${localized}`;
}

export function absoluteAsset(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Language alternate map for a path (used by metadata + sitemap).
 * Canonical for a given page should use `canonicalUrl(pageLocale, path)` —
 * this helper only builds the `languages` / hreflang set.
 */
export function hreflangLanguages(
  path = "",
): Record<"ar" | "en" | "x-default", string> {
  return {
    ar: canonicalUrl("ar", path),
    en: canonicalUrl("en", path),
    "x-default": canonicalUrl(defaultLocale, path),
  };
}

/** @deprecated Use `buildPageMetadata` (sets locale-correct canonical) or `hreflangLanguages`. */
export function hreflangAlternates(
  path = "",
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: canonicalUrl(defaultLocale, path),
    languages: hreflangLanguages(path),
  };
}

export function buildPageMetadata({
  locale,
  title,
  description,
  path = "",
  siteName = siteConfig.name,
  ogTitle = title,
  ogDescription = description,
  ogImage = siteConfig.ogImage,
  ogImageAlt = siteName,
  absoluteTitle = false,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = canonicalUrl(locale, path);
  const imageUrl = absoluteAsset(ogImage);

  const robots = noIndex
    ? {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: hreflangLanguages(path),
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      url,
      title: ogTitle,
      description: ogDescription,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
      ...(siteConfig.twitterHandle
        ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle }
        : {}),
    },
    robots,
    ...(siteConfig.verification
      ? {
          verification: {
            google: siteConfig.verification.google,
            other: siteConfig.verification.bing
              ? { "msvalidate.01": siteConfig.verification.bing }
              : undefined,
          },
        }
      : {}),
  };
}

/** Build Metadata from a static `PageSeo` record (`pages-seo.json`). */
export function buildMetadataFromPageSeo(
  locale: Locale,
  page: PageSeo,
  overrides?: Partial<BuildMetadataInput>,
): Metadata {
  return buildPageMetadata({
    locale,
    title: page.title,
    description: page.description,
    path: page.path,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    ogImageAlt: page.ogImageAlt,
    absoluteTitle: page.absoluteTitle,
    noIndex: page.robots === "noindex",
    ...overrides,
  });
}

/** Auth / dashboard / 404 — noindex, still provides a clear browser title. */
export function buildNoIndexMetadata({
  locale,
  title,
  description = "",
  path = "",
}: {
  locale: Locale;
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  return buildPageMetadata({
    locale,
    title,
    description,
    path,
    noIndex: true,
  });
}

export function buildOrganizationJsonLd(input: {
  locale: Locale;
  name: string;
  description: string;
  email?: string;
  location?: string;
  /** Locale-agnostic path for this org page (e.g. `/sah-human`). Defaults to site root. */
  path?: string;
  logo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: canonicalUrl(input.locale, input.path ?? ""),
    logo: absoluteAsset(input.logo ?? "/logos/sah-group-logo.png"),
    image: absoluteAsset(siteConfig.ogImage),
    description: input.description,
    email: input.email ?? siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality:
        input.locale === "ar" ? "الرياض" : "Riyadh",
      addressCountry: "SA",
    },
    slogan:
      input.locale === "ar"
        ? "الإنسان أولاً ثم الأعمال"
        : "People First Business Follows",
    ...(siteConfig.sameAs?.length ? { sameAs: siteConfig.sameAs } : {}),
  };
}

/**
 * WebSite JSON-LD — ready for SearchAction / sitelinks when a site search exists.
 * Call from home only; do not invent a SearchAction URL until a search route ships.
 */
export function buildWebSiteJsonLd(input: {
  locale: Locale;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: canonicalUrl(input.locale),
    description: input.description,
    inLanguage: input.locale === "ar" ? "ar-SA" : "en-US",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: canonicalUrl(input.locale),
    },
  };
}

export function buildFaqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildPersonJsonLd(input: {
  locale: Locale;
  name: string;
  description: string;
  slug: string;
  jobTitle?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    description: input.description,
    jobTitle: input.jobTitle ?? "",
    url: canonicalUrl(input.locale, `/coaches/${input.slug}`),
    ...(input.image ? { image: absoluteAsset(input.image) } : {}),
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: canonicalUrl(input.locale),
    },
  };
}

/**
 * Course JSON-LD — wire on `/courses/[slug]` when that route ships.
 * Do not emit ItemList URLs to `/courses/{slug}` until the detail page exists.
 */
export function buildCourseJsonLd(input: {
  locale: Locale;
  name: string;
  description: string;
  slug: string;
  providerName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.locale, `/courses/${input.slug}`),
    provider: {
      "@type": "Organization",
      name: input.providerName ?? siteConfig.name,
      url: canonicalUrl(input.locale),
    },
  };
}

/**
 * Service JSON-LD for program detail pages (schema.org/Service).
 * Ready for Offer / price when commercial fields exist — omit invented prices.
 */
export function buildServiceJsonLd(input: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
  providerName?: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.locale, input.path),
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
    provider: {
      "@type": "Organization",
      name: input.providerName ?? siteConfig.name,
      url: canonicalUrl(input.locale),
    },
    areaServed: {
      "@type": "Country",
      name: "SA",
    },
  };
}

export type ItemListEntry = {
  name: string;
  description: string;
  /**
   * Locale-agnostic path or absolute URL.
   * Omit until a real indexable detail URL exists (avoids structured-data 404s).
   */
  url?: string;
};

export function buildItemListJsonLd(locale: Locale, items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      description: item.description,
      ...(item.url
        ? {
            url: item.url.startsWith("http")
              ? item.url
              : canonicalUrl(locale, item.url),
          }
        : {}),
    })),
  };
}

export function buildBreadcrumbJsonLd(
  locale: Locale,
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: canonicalUrl(locale, crumb.path),
    })),
  };
}
