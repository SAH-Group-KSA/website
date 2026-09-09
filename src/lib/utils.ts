import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Hash, mailto, tel, or absolute URL — use a plain `<a>`. */
export function isExternalOrHashHref(href: string): boolean {
  return (
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("//")
  );
}

/** In-app path that should go through next-intl `Link` / `LocaleLink`. */
export function isAppPathHref(href: string): boolean {
  return href.startsWith("/") && !isExternalOrHashHref(href);
}
