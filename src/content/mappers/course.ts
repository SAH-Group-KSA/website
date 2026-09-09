import { toPlainText } from "next-sanity";
import type { Course, CourseDetail, CourseModule } from "@/domain/course";
import type { Locale } from "@/types/locale";
import { urlForImage } from "@/lib/sanity";

type LocaleString = { en?: string | null; ar?: string | null };
type LocalePortableText = {
  en?: unknown[] | null;
  ar?: unknown[] | null;
};
type SanityCourseThumbnail = {
  alt?: LocaleString | null;
};

type SanityCourseModule = {
  _key?: string | null;
  title?: LocaleString | null;
  duration?: string | null;
  isPreview?: boolean | null;
  video?: {
    asset?: {
      playbackId?: string | null;
      assetId?: string | null;
      status?: string | null;
    } | null;
  } | null;
};

export type SanityCourseDocument = {
  slug?: string | null;
  title?: LocaleString | null;
  description?: LocalePortableText | null;
  level?: LocaleString | null;
  thumbnail?: unknown;
  priceSar?: number | null;
  modules?: SanityCourseModule[] | null;
};

function pickLocaleString(
  value: LocaleString | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  return (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar ?? "";
}

function pickPortableText(
  value: LocalePortableText | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  const blocks = (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar;
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return "";
  try {
    return toPlainText(blocks as Parameters<typeof toPlainText>[0]).trim();
  } catch {
    return "";
  }
}

/**
 * Parse module duration strings like "12 min" / "1.5 hr" into hours for listing totals.
 * Returns 0 when unparseable — course listing only needs a coarse total.
 */
function parseDurationHours(duration: string | null | undefined): number {
  if (!duration) return 0;
  const match = duration
    .trim()
    .match(/^([\d.]+)\s*(min|mins|minute|minutes|h|hr|hrs|hour|hours)?/i);
  if (!match) return 0;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;
  const unit = (match[2] ?? "min").toLowerCase();
  if (unit.startsWith("h")) return value;
  return value / 60;
}

/**
 * Map a Sanity course document into a locale-resolved `Course`.
 * Module video IDs stay on the raw doc for Phase 9 detail mapping.
 */
export function mapCourseDocument(doc: unknown, locale: Locale): Course | null {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc as SanityCourseDocument;
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  if (!slug) return null;

  const modules = Array.isArray(raw.modules) ? raw.modules : [];
  const durationHours = modules.reduce(
    (sum, mod) => sum + parseDurationHours(mod.duration),
    0,
  );

  return {
    slug,
    title: pickLocaleString(raw.title, locale),
    description: pickPortableText(raw.description, locale),
    level: pickLocaleString(raw.level, locale),
    modules: modules.length,
    durationHours: Math.round(durationHours * 10) / 10,
    price: {
      amount: typeof raw.priceSar === "number" ? raw.priceSar : 0,
      currency: "SAR",
    },
    videoPlatform: "mux",
    thumbnail: urlForImage(raw.thumbnail as Parameters<typeof urlForImage>[0]),
    thumbnailAlt: pickLocaleString(
      (raw.thumbnail as SanityCourseThumbnail | null)?.alt,
      locale,
    ),
  };
}

function mapCourseModule(
  module: SanityCourseModule,
  locale: Locale,
  index: number,
): CourseModule {
  return {
    id: module._key?.trim() || `module-${index + 1}`,
    title: pickLocaleString(module.title, locale),
    duration: module.duration?.trim() ?? "",
    isPreview: module.isPreview === true,
  };
}

/**
 * Detail mapping intentionally excludes Mux identifiers. Phase 6 only displays
 * curriculum metadata; playback remains isolated until the video phase.
 */
export function mapCourseDetailDocument(
  doc: unknown,
  locale: Locale,
): CourseDetail | null {
  const course = mapCourseDocument(doc, locale);
  if (!course || !doc || typeof doc !== "object") return null;

  const raw = doc as SanityCourseDocument;
  const modules = Array.isArray(raw.modules) ? raw.modules : [];

  return {
    ...course,
    modulesList: modules.map((module, index) => mapCourseModule(module, locale, index)),
  };
}

/** Alias matching the implementation plan naming. */
export const mapCourse = mapCourseDocument;
