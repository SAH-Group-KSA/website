import type { SiteContent } from "@/content/types";
import type { Locale } from "@/types/locale";

export function breadcrumbHomeLabel(
  content: SiteContent,
  locale: Locale,
): string {
  return content.ui.breadcrumbHome ?? (locale === "ar" ? "الرئيسية" : "Home");
}

export function formatCountTemplate(template: string, count: number): string {
  return template.replace(/\{count\}/g, String(count));
}
