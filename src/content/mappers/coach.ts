import { toPlainText } from "next-sanity";
import type { Coach } from "@/domain/coach";
import type { Locale } from "@/types/locale";
import { urlForImage } from "@/lib/sanity";

type LocaleString = { en?: string | null; ar?: string | null };
type LocaleText = LocaleString;
type LocaleStringArray = { en?: string[] | null; ar?: string[] | null };
type LocalePortableText = {
  en?: unknown[] | null;
  ar?: unknown[] | null;
};

export type SanityCoachDocument = {
  slug?: string | null;
  name?: LocaleString | null;
  specialty?: LocaleString | null;
  bio?: LocaleText | null;
  fullBio?: LocalePortableText | null;
  photo?: unknown;
  topics?: LocaleStringArray | null;
  languages?: string[] | null;
  credentials?: LocaleStringArray | null;
  experience?: LocaleString | null;
  sessionDuration?: string | null;
  priceSar?: number | null;
  zohoBookingsServiceId?: string | null;
};

function pickLocaleString(
  value: LocaleString | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  return (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar ?? "";
}

function pickLocaleStringArray(
  value: LocaleStringArray | null | undefined,
  locale: Locale,
): string[] {
  if (!value) return [];
  const list = (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar;
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

function pickPortableText(
  value: LocalePortableText | null | undefined,
  locale: Locale,
): string | undefined {
  if (!value) return undefined;
  const blocks =
    (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar;
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return undefined;
  try {
    // toPlainText accepts Portable Text blocks; cast after runtime array check.
    const text = toPlainText(blocks as Parameters<typeof toPlainText>[0]).trim();
    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Map a Sanity coach document into a locale-resolved `Coach`.
 * Missing fields fall back to empty values; reviews stay out of CMS (Supabase later).
 */
export function mapCoachDocument(
  doc: unknown,
  locale: Locale,
): Coach | null {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc as SanityCoachDocument;
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  if (!slug) return null;

  return {
    slug,
    name: pickLocaleString(raw.name, locale),
    specialty: pickLocaleString(raw.specialty, locale),
    bio: pickLocaleString(raw.bio, locale),
    fullBio: pickPortableText(raw.fullBio, locale),
    rating: 0,
    reviewCount: 0,
    price: {
      amount: typeof raw.priceSar === "number" ? raw.priceSar : 0,
      currency: "SAR",
    },
    experience: pickLocaleString(raw.experience, locale) || undefined,
    credentials: pickLocaleStringArray(raw.credentials, locale),
    topics: pickLocaleStringArray(raw.topics, locale),
    languages: Array.isArray(raw.languages)
      ? raw.languages.filter((l): l is string => typeof l === "string" && l.length > 0)
      : undefined,
    sessionDuration: raw.sessionDuration?.trim() || undefined,
    zohoBookingsServiceId: raw.zohoBookingsServiceId?.trim() || undefined,
    photo: urlForImage(raw.photo as Parameters<typeof urlForImage>[0]),
    reviews: undefined,
  };
}

/** Alias matching the implementation plan naming. */
export const mapCoach = mapCoachDocument;
