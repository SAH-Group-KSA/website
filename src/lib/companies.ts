import type { EntityId } from "@/content/types";
import type { PageSeoKey } from "@/content/seo-types";
import type { Locale } from "@/types/locale";

export type CompanyEntityId = Exclude<EntityId, "group">;

export type CompanyRoute = {
  entityId: CompanyEntityId;
  /** URL segment, e.g. `sah-human` → `/sah-human`. */
  slug: string;
  seoKey: PageSeoKey;
};

/**
 * Canonical company homepage routes — keep in sync with
 * `entityPages` content and `pages-seo.json` keys.
 * Theme slug → `data-theme` mapping is derived via `getCompanyThemeSlugMap()`
 * in `src/lib/brand-themes.ts` (do not hardcode the map in layout).
 */
export const COMPANY_ROUTES: readonly CompanyRoute[] = [
  { entityId: "human", slug: "sah-human", seoKey: "sahHuman" },
  { entityId: "seera", slug: "seera", seoKey: "seera" },
  { entityId: "nexus", slug: "sah-nexus", seoKey: "sahNexus" },
  { entityId: "connect", slug: "sah-sponsor", seoKey: "sahSponsor" },
  { entityId: "lego", slug: "lego-by-sah", seoKey: "legoBySah" },
  { entityId: "impact", slug: "sah-impact", seoKey: "sahImpact" },
] as const;

const bySlug = new Map(COMPANY_ROUTES.map((r) => [r.slug, r]));
const byEntity = new Map(COMPANY_ROUTES.map((r) => [r.entityId, r]));

export function getCompanyBySlug(slug: string): CompanyRoute | undefined {
  return bySlug.get(slug);
}

export function getCompanyByEntityId(
  entityId: CompanyEntityId,
): CompanyRoute | undefined {
  return byEntity.get(entityId);
}

export function companyPath(entityId: CompanyEntityId): string {
  const route = byEntity.get(entityId);
  return route ? `/${route.slug}` : "/";
}

/** True when path is a company homepage (or nested under one). */
export function isCompanyPath(path: string): boolean {
  return COMPANY_ROUTES.some(
    (r) => path === `/${r.slug}` || path.startsWith(`/${r.slug}/`),
  );
}

/** Human product routes that should keep Services → SAH Human active. */
export function isHumanProductPath(path: string): boolean {
  return path.startsWith("/coaches") || path.startsWith("/courses");
}

/** Valid `?from=` values for program detail return links. */
export function isCompanySlug(value: string): boolean {
  return bySlug.has(value);
}

/**
 * Locale-aware href back to `#programs` on group home or a company page.
 * `from` is a company slug (e.g. `sah-human`) or empty/undefined for group home.
 */
export function programsSectionHref(
  locale: Locale,
  from?: string | null,
): string {
  const prefix = locale === "en" ? "/en" : "";
  const slug = from && isCompanySlug(from) ? from : "";
  if (slug) return `${prefix}/${slug}#programs`;
  return `${prefix}/#programs`;
}

/** Path only (no hash) for breadcrumbs / LocaleLink. */
export function programsSectionPath(from?: string | null): string {
  const slug = from && isCompanySlug(from) ? from : "";
  return slug ? `/${slug}` : "/";
}

/** Company slug if `path` is a company homepage; otherwise `""` (group). */
export function programsFromParamForPath(path: string): string {
  for (const route of COMPANY_ROUTES) {
    if (path === `/${route.slug}` || path.startsWith(`/${route.slug}/`)) {
      return route.slug;
    }
  }
  return "";
}
