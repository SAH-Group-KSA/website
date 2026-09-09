import {
  companyPath,
  programsFromParamForPath,
  type CompanyEntityId,
} from "@/lib/companies";
import { localePath, type Locale } from "@/types/locale";

/** Custom events mirroring prototype click delegation. */
export const SAH_OPEN_CONTACT = "sah:open-contact";
export const SAH_FILTER_PROGRAMS = "sah:filter-programs";

function detectLocale(): Locale {
  const lang = document.documentElement.lang?.toLowerCase() ?? "";
  return lang.startsWith("en") ? "en" : "ar";
}

function normalizePath(pathname: string, locale: Locale): string {
  if (locale === "en" && (pathname === "/en" || pathname.startsWith("/en/"))) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

/** Navigate to a company homepage (replaces the old entity modal). */
export function openEntity(id: string) {
  const path = companyPath(id as CompanyEntityId);
  if (path === "/") {
    document.getElementById("entities")?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  window.location.assign(localePath(detectLocale(), path));
}

/** Navigate to the program detail page, preserving listing origin for return links. */
export function openProgram(id: string) {
  const locale = detectLocale();
  const from = programsFromParamForPath(
    normalizePath(window.location.pathname, locale),
  );
  const query = from ? `?from=${encodeURIComponent(from)}` : "";
  window.location.assign(localePath(locale, `/program/${id}`) + query);
}

export function filterProgramsByEntity(entityId: string) {
  window.dispatchEvent(
    new CustomEvent(SAH_FILTER_PROGRAMS, { detail: { entityId } }),
  );
  document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
}

export function openContact(context?: string) {
  window.dispatchEvent(
    new CustomEvent(SAH_OPEN_CONTACT, {
      detail: { context: context ?? "General Discovery Session" },
    }),
  );
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}
