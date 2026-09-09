import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { getPageSeo, getProgramEntityMap } from "@/content";
import {
  getCompanyThemeSlugMap,
  GROUP_THEME_COLOR,
} from "@/lib/brand-themes";
import { routing } from "@/i18n/routing";
import { buildMetadataFromPageSeo } from "@/lib/seo";
import { isLocale, localeDirections, type Locale } from "@/types/locale";
import "../globals.css";
import "@/styles/fonts.css";
import "@/styles/design-tokens.css";
import "@/styles/brand-themes.css";
import "@/styles/design-system.css";
import "@/styles/prototype-parity.css";
import "@/styles/motion.css";
import "@/styles/typography.css";
import "@/styles/spacing.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: GROUP_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};

  // Default document metadata for this locale tree (overridden by child routes).
  // Home SEO is owned by `pages-seo.json` → `getPageSeo("home")` only — not `home.json` meta.
  return buildMetadataFromPageSeo(localeParam, await getPageSeo(localeParam, "home"));
}

/**
 * Locale layout — marketing chrome via SiteShell for all routes today.
 *
 * Future route-group split (no behavior change yet):
 * - `(marketing)/` → SiteShell (header/footer)
 * - `(auth)/` → minimal chrome
 * - `(app)/dashboard/` → DashboardShell only (no marketing header)
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = localeDirections[locale];
  const programEntityMap = JSON.stringify(await getProgramEntityMap());
  const companyThemeMap = JSON.stringify(getCompanyThemeSlugMap());

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen min-w-viewport" suppressHydrationWarning>
        {/*
          FOUC theme script runs before paint. It may set data-theme on <html>
          before React hydrates — suppressHydrationWarning on <html>/<body>
          is required so that mismatch is intentional, not an error.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname.replace(/^\\/en(?=\\/|$)/,"")||"/";var m=${companyThemeMap};var t=null;for(var s in m){if(p==="/"+s||p.indexOf("/"+s+"/")===0){t=m[s];break}}if(!t){var pm=p.match(/^\\/program\\/([^/]+)\\/?$/);if(pm){var pe=${programEntityMap};t=pe[pm[1]]||null}}if(!t&&(/^\\/coaches(\\/|$)/.test(p)||/^\\/courses(\\/|$)/.test(p)))t="human";if(t)document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme")}catch(e){}})();`,
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteShell key={locale}>{children}</SiteShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
