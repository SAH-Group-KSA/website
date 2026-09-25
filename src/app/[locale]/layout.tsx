import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { AttributionTracker } from "@/components/analytics/AttributionTracker";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { getPageSeo, getProgramEntityMap } from "@/content";
import {
  getCompanyThemeSlugMap,
  GROUP_THEME_COLOR,
} from "@/lib/brand-themes";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/constants";
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

  // Fallback document metadata for this locale tree. Every real page defines
  // its own `generateMetadata` and overrides this, so in practice the only
  // thing that renders it is the 404 — Next ignores metadata exports in
  // `not-found.tsx`, and dynamic routes return `{}` for an unknown slug before
  // calling `notFound()`. Serving the `notFound` record here is therefore what
  // puts the right title on the 404 page. Deliberately emits no canonical or
  // hreflang: a 404 URL must not claim one.
  const seo = await getPageSeo(localeParam, "notFound");
  return {
    title: seo.title,
    description: seo.description,
    metadataBase: new URL(siteConfig.url),
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
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
          {/*
            Consent + tracking sit OUTSIDE SiteShell so they survive /auth and
            /dashboard, where SiteShellClient swaps the whole marketing subtree
            out — but INSIDE NextIntlClientProvider, because the banner's
            LocaleLink needs the intl context.
            Nothing here loads a script until consent is accepted.
          */}
          <CookieConsentBanner locale={locale} />
          <AnalyticsScripts locale={locale} />
          <PageViewTracker />
          <AttributionTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
