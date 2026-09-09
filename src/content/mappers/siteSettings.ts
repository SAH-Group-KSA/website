import type { Entity, SiteContent } from "@/content/types";
import { mergeDefined } from "@/content/mappers/shared";
import { mapEntities } from "@/content/mappers/home";

const GLOBAL_KEYS = [
  "meta",
  "nav",
  "cta",
  "footer",
  "ui",
  "megaNav",
  "contact",
  "entities",
] as const;

type GlobalSlice = Pick<SiteContent, (typeof GLOBAL_KEYS)[number]>;

function pickGlobalSlice(source: Record<string, unknown>): Partial<GlobalSlice> {
  const out: Partial<GlobalSlice> = {};
  for (const key of GLOBAL_KEYS) {
    if (source[key] !== undefined) {
      (out as Record<string, unknown>)[key] = source[key];
    }
  }
  return out;
}

/**
 * Merge global chrome from siteSettings (preferred) or legacy homePage fields.
 */
export function mapSiteSettings(
  settingsDoc: unknown,
  homeDoc: unknown,
  fallback: SiteContent,
): GlobalSlice {
  const settingsRaw =
    settingsDoc && typeof settingsDoc === "object"
      ? (settingsDoc as Record<string, unknown>)
      : null;
  const homeRaw =
    homeDoc && typeof homeDoc === "object"
      ? (homeDoc as Record<string, unknown>)
      : null;

  let partial: Partial<GlobalSlice> = {};

  if (settingsRaw && settingsRaw.published !== false) {
    partial = pickGlobalSlice(settingsRaw);
    if (settingsRaw.entities) {
      partial.entities = mapEntities(
        settingsRaw.entities as Array<Entity & { logo?: unknown }>,
        fallback.entities,
      );
    }
  } else if (homeRaw) {
    partial = pickGlobalSlice(homeRaw);
    if (homeRaw.entities) {
      partial.entities = mapEntities(
        homeRaw.entities as Array<Entity & { logo?: unknown }>,
        fallback.entities,
      );
    }
  }

  const merged = mergeDefined(
    {
      meta: fallback.meta,
      nav: fallback.nav,
      cta: fallback.cta,
      footer: fallback.footer,
      ui: fallback.ui,
      megaNav: fallback.megaNav,
      contact: fallback.contact,
      entities: fallback.entities,
    },
    partial,
  );

  return merged;
}
