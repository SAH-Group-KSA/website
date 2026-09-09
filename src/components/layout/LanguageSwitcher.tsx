"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { localePath, type Locale } from "@/types/locale";
import { routing } from "@/i18n/routing";

type LanguageSwitcherProps = {
  className?: string;
  /** When header is over dark hero (not scrolled). Prefer CSS via `.site-header` when possible. */
  inverted?: boolean;
};

/**
 * Switches between Arabic (`/`) and English (`/en`).
 *
 * Uses a full document navigation (not soft RSC replace) because the
 * Arabic home is served via `/` → `/ar` rewrite — client-side locale
 * transitions otherwise leave the page shell/content out of sync.
 */
export function LanguageSwitcher({
  className,
  inverted = false,
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");

  const otherLocale =
    (routing.locales.find((item) => item !== locale) as Locale | undefined) ??
    locale;

  const href = localePath(
    otherLocale,
    pathname === "/" ? "" : pathname,
  );

  return (
    <a
      href={href}
      hrefLang={otherLocale}
      aria-label={t("switchTo", { locale: t(otherLocale) })}
      className={cn(
        "lang-switch-btn",
        inverted ? "is-inverted" : "is-ink",
        className,
      )}
    >
      {t(otherLocale)}
    </a>
  );
}
