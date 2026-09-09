export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

/** Arabic is the default locale and is served at `/` (no prefix). */
export const defaultLocale: Locale = "ar";

export const localeNames: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
};

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  ar: "rtl",
  en: "ltr",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Pathname for a locale (`as-needed` prefix strategy).
 * Arabic → `/` or `/about`; English → `/en` or `/en/about`.
 */
export function localePath(locale: Locale, path = ""): string {
  const suffix = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";

  if (locale === defaultLocale) {
    return suffix || "/";
  }

  return `/${locale}${suffix}`;
}
