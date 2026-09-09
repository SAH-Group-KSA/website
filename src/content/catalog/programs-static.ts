import type { Program, SiteContent } from "@/content/types";
import en from "../en/home.json";
import ar from "../ar/home.json";
import type { Locale } from "@/types/locale";

/**
 * Static program catalog — safe to import from client components.
 * Server CMS reads live in `programs.ts`.
 */

const content: Record<Locale, SiteContent> = {
  en: en as SiteContent,
  ar: ar as SiteContent,
};

export function staticPrograms(locale: Locale): Program[] {
  return (content[locale] ?? content.en).programs;
}

/** Locale-agnostic program id → entity theme id (stable across CMS/JSON). */
export function staticProgramEntityMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const program of staticPrograms("en")) {
    map[program.id] = program.entity;
  }
  return map;
}

/** Sync lookup for client-side theming — does not touch Sanity. */
export function getProgramEntityIdSync(id: string): string | null {
  return staticProgramEntityMap()[id] ?? null;
}
