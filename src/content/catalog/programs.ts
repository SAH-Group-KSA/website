import type { Program } from "@/content/types";
import type { Locale } from "@/types/locale";
import { features } from "@/lib/features";
import { PROGRAMS_QUERY, sanityClient } from "@/lib/sanity";
import { mapPrograms } from "@/content/mappers/home";
import { staticPrograms } from "./programs-static";

/**
 * Program catalog accessors.
 * When FEATURE_CMS=1, reads published programs from Sanity with JSON fallback.
 */

async function programsFor(locale: Locale): Promise<Program[]> {
  const fallback = staticPrograms(locale);
  if (!features.cms) return fallback;

  const docs = await sanityClient.fetch<unknown[]>(
    PROGRAMS_QUERY,
    { locale },
    { next: { tags: ["programs"] } },
  );
  return mapPrograms(docs ?? [], fallback);
}

export async function getPrograms(locale: Locale): Promise<Program[]> {
  return programsFor(locale);
}

export async function getProgramById(
  locale: Locale,
  id: string,
): Promise<Program | null> {
  const programs = await programsFor(locale);
  return programs.find((program) => program.id === id) ?? null;
}

export async function getProgramIds(): Promise<string[]> {
  const programs = await programsFor("en");
  return programs.map((program) => program.id);
}

/** Locale-agnostic program id → entity theme id (for layout FOUC script). */
export async function getProgramEntityMap(): Promise<Record<string, string>> {
  const programs = await programsFor("en");
  const map: Record<string, string> = {};
  for (const program of programs) {
    map[program.id] = program.entity;
  }
  return map;
}

export async function getProgramEntityId(id: string): Promise<string | null> {
  const map = await getProgramEntityMap();
  return map[id] ?? null;
}

export {
  getProgramEntityIdSync,
  staticProgramEntityMap,
  staticPrograms,
} from "./programs-static";
