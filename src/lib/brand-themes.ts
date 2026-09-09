import {
  COMPANY_ROUTES,
  isHumanProductPath,
  type CompanyEntityId,
} from "@/lib/companies";
import { getProgramEntityIdSync } from "@/content/catalog/programs-static";
import type { EntityColors, EntityId, SiteContent } from "@/content/types";

/** Theme id on `<html data-theme>` — omit for Group (`:root`). */
export type BrandThemeId = CompanyEntityId;

/**
 * Multi-brand accent hex values (group homepage cards, orbit, programs).
 * Sponsor uses Dark Slate (not Silver) so accents stay readable as text/UI.
 */
export const ENTITY_UI_COLORS: EntityColors = {
  group: "#C8A04D",
  human: "#0F6B46",
  seera: "#280A45",
  nexus: "#0D1B2A",
  connect: "#2B2F36",
  lego: "#D4A017",
  impact: "#008A5E",
};

/** Group sheet primary — viewport / PWA chrome. */
export const GROUP_THEME_COLOR = "#271710";

/** Slug → `data-theme` id (derived from COMPANY_ROUTES — do not hardcode elsewhere). */
export function getCompanyThemeSlugMap(): Record<string, BrandThemeId> {
  return Object.fromEntries(
    COMPANY_ROUTES.map((route) => [route.slug, route.entityId]),
  ) as Record<string, BrandThemeId>;
}

export function getEntityUiColor(id: EntityId | string): string {
  return (
    (ENTITY_UI_COLORS as Record<string, string>)[id] ?? ENTITY_UI_COLORS.group
  );
}

/**
 * Overlay canonical accent colors onto site content so en/ar JSON hex
 * values cannot drift from the theme registry.
 */
export function applyCanonicalEntityColors(site: SiteContent): SiteContent {
  return {
    ...site,
    entityColors: { ...ENTITY_UI_COLORS },
    entities: site.entities.map((entity) => ({
      ...entity,
      color: getEntityUiColor(entity.id),
    })),
  };
}

/** Strip optional `/en` prefix for theme / nav path matching. */
export function normalizeAppPath(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  // Internal rewrite serves Arabic at `/ar…` while public URLs omit the prefix.
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

const COMPANY_THEME_IDS = new Set<string>(
  COMPANY_ROUTES.map((route) => route.entityId),
);

/**
 * Resolve active brand theme from a locale-agnostic path.
 * Returns `"group"` when `<html>` should have no `data-theme`.
 */
export function resolveBrandTheme(
  path: string,
): CompanyEntityId | "group" {
  for (const route of COMPANY_ROUTES) {
    if (path === `/${route.slug}` || path.startsWith(`/${route.slug}/`)) {
      return route.entityId;
    }
  }

  const programMatch = path.match(/^\/program\/([^/]+)\/?$/);
  if (programMatch) {
    const entityId = getProgramEntityIdSync(programMatch[1]);
    if (entityId && COMPANY_THEME_IDS.has(entityId)) {
      return entityId as CompanyEntityId;
    }
  }

  if (isHumanProductPath(path)) return "human";
  return "group";
}
