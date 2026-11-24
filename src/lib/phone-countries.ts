/**
 * Country calling codes offered by phone inputs. Curated, not exhaustive:
 * GCC first (Saudi Arabia is the default), then the wider region and the
 * countries SAH's audience most often lives in. A number from anywhere else
 * can still be typed in full international form (`+…`) into the number field.
 */
export type PhoneCountry = {
  /** ISO 3166-1 alpha-2 — unique key (US and Canada share +1). */
  iso: string;
  /** Calling code without the `+`. */
  dial: string;
  name: { en: string; ar: string };
};

export const DEFAULT_PHONE_COUNTRY = "SA";

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { iso: "SA", dial: "966", name: { en: "Saudi Arabia", ar: "السعودية" } },
  { iso: "AE", dial: "971", name: { en: "United Arab Emirates", ar: "الإمارات" } },
  { iso: "KW", dial: "965", name: { en: "Kuwait", ar: "الكويت" } },
  { iso: "QA", dial: "974", name: { en: "Qatar", ar: "قطر" } },
  { iso: "BH", dial: "973", name: { en: "Bahrain", ar: "البحرين" } },
  { iso: "OM", dial: "968", name: { en: "Oman", ar: "عُمان" } },
  { iso: "EG", dial: "20", name: { en: "Egypt", ar: "مصر" } },
  { iso: "JO", dial: "962", name: { en: "Jordan", ar: "الأردن" } },
  { iso: "LB", dial: "961", name: { en: "Lebanon", ar: "لبنان" } },
  { iso: "IQ", dial: "964", name: { en: "Iraq", ar: "العراق" } },
  { iso: "SY", dial: "963", name: { en: "Syria", ar: "سوريا" } },
  { iso: "PS", dial: "970", name: { en: "Palestine", ar: "فلسطين" } },
  { iso: "YE", dial: "967", name: { en: "Yemen", ar: "اليمن" } },
  { iso: "SD", dial: "249", name: { en: "Sudan", ar: "السودان" } },
  { iso: "LY", dial: "218", name: { en: "Libya", ar: "ليبيا" } },
  { iso: "TN", dial: "216", name: { en: "Tunisia", ar: "تونس" } },
  { iso: "DZ", dial: "213", name: { en: "Algeria", ar: "الجزائر" } },
  { iso: "MA", dial: "212", name: { en: "Morocco", ar: "المغرب" } },
  { iso: "TR", dial: "90", name: { en: "Türkiye", ar: "تركيا" } },
  { iso: "PK", dial: "92", name: { en: "Pakistan", ar: "باكستان" } },
  { iso: "IN", dial: "91", name: { en: "India", ar: "الهند" } },
  { iso: "MY", dial: "60", name: { en: "Malaysia", ar: "ماليزيا" } },
  { iso: "SG", dial: "65", name: { en: "Singapore", ar: "سنغافورة" } },
  { iso: "GB", dial: "44", name: { en: "United Kingdom", ar: "المملكة المتحدة" } },
  { iso: "IE", dial: "353", name: { en: "Ireland", ar: "أيرلندا" } },
  { iso: "DE", dial: "49", name: { en: "Germany", ar: "ألمانيا" } },
  { iso: "FR", dial: "33", name: { en: "France", ar: "فرنسا" } },
  { iso: "NL", dial: "31", name: { en: "Netherlands", ar: "هولندا" } },
  { iso: "ES", dial: "34", name: { en: "Spain", ar: "إسبانيا" } },
  { iso: "IT", dial: "39", name: { en: "Italy", ar: "إيطاليا" } },
  { iso: "US", dial: "1", name: { en: "United States", ar: "الولايات المتحدة" } },
  { iso: "CA", dial: "1", name: { en: "Canada", ar: "كندا" } },
  { iso: "AU", dial: "61", name: { en: "Australia", ar: "أستراليا" } },
  { iso: "ZA", dial: "27", name: { en: "South Africa", ar: "جنوب أفريقيا" } },
];

/** Flag emoji from an ISO code (regional indicator symbols). */
export function flagEmoji(iso: string): string {
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)),
  );
}
