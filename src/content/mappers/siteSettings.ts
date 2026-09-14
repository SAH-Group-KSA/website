import type { Entity, SiteContent, UiContent } from "@/content/types";
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
 * Merge CMS UI chrome onto fallback labels.
 * Skip blank strings so missing/unfilled Sanity fields keep JSON defaults
 * (e.g. editProfile added after the siteSettings docs were seeded).
 */
function mergeUiChrome(
  fallback: UiContent,
  partial: Partial<UiContent> | undefined,
): UiContent {
  if (!partial) return fallback;
  const out: UiContent = { ...fallback };
  for (const [key, value] of Object.entries(partial) as Array<
    [keyof UiContent, UiContent[keyof UiContent] | undefined]
  >) {
    if (typeof value === "string" && value.trim()) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Merge global chrome from siteSettings (preferred) or legacy homePage fields
 * onto an empty/base shell (no static marketing copy when CMS mode uses emptySiteContent).
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

  const cmsUi = partial.ui;
  delete partial.ui;

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

  return {
    ...merged,
    ui: mergeUiChrome(fallback.ui, cmsUi as Partial<UiContent> | undefined),
  };
}
