import { getLocale } from "next-intl/server";
import {
  getContent,
  getCookiePolicy,
  getPrivacyPolicy,
  getTermsConditions,
} from "@/content";
import type { FooterLink } from "@/content/types";
import type { Locale } from "@/types/locale";
import { siteConfig } from "@/lib/constants";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { AppImage } from "@/components/ui/AppImage";
import { Container } from "@/components/ui/Container";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { TrackedMailtoLink } from "@/components/consent/TrackedMailtoLink";

function resolveHashHref(href: string, locale: Locale): string {
  if (!href.startsWith("#")) return href;
  const base = locale === "en" ? "/en" : "";
  return `${base}/${href}`;
}

function FooterNavLink({ link, locale }: { link: FooterLink; locale: Locale }) {
  if (link.href.startsWith("#")) {
    return <a href={resolveHashHref(link.href, locale)}>{link.label}</a>;
  }
  if (link.href.startsWith("mailto:") || link.href.startsWith("http")) {
    return <a href={link.href}>{link.label}</a>;
  }
  return <LocaleLink href={link.href as `/${string}`}>{link.label}</LocaleLink>;
}

export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const [{ footer, newsletter, ui }, privacy, terms, cookies] = await Promise.all([
    getContent(locale),
    getPrivacyPolicy(locale),
    getTermsConditions(locale),
    getCookiePolicy(locale),
  ]);
  const columns = [footer.services, footer.explore, footer.connect];

  return (
    <footer className="site-footer">
      <Container className="footer-shell">
        {/* Newsletter band */}
        <div className="footer-subscribe" id="newsletter">
          <div className="footer-subscribe-copy">
            <p className="footer-subscribe-eyebrow">{newsletter.eyebrow}</p>
            <h2 className="footer-subscribe-title">{newsletter.title}</h2>
            <p className="footer-subscribe-body">{newsletter.body}</p>
          </div>
          <div className="footer-subscribe-action">
            <NewsletterForm data={newsletter} variant="inline" />
          </div>
          {newsletter.hint ? (
            <p className="footer-subscribe-hint">{newsletter.hint}</p>
          ) : null}
        </div>

        {/* Main footer */}
        <div className="footer-main">
          <div className="footer-brand">
            <LocaleLink href="/" aria-label={footer.logoAlt} className="footer-logo">
              <AppImage
                src="/logos/sah-group-logo.png"
                alt=""
                width={377}
                height={139}
                sizes="140px"
              />
            </LocaleLink>
            <p className="footer-blurb">{footer.blurb}</p>
            <div className="footer-meta">
              <TrackedMailtoLink
                email={siteConfig.email}
                id="footer-email"
                className="footer-meta-link"
              >
                {siteConfig.email}
              </TrackedMailtoLink>
              <span className="footer-meta-location">{footer.locationLabel}</span>
            </div>
          </div>

          <nav
            className="footer-nav"
            aria-label={ui.footerNav ?? (locale === "ar" ? "تذييل الصفحة" : "Footer")}
          >
            {columns.map((column) => (
              <div key={column.title} className="footer-column">
                <h3 className="footer-column-title">{column.title}</h3>
                <ul className="footer-column-list">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}`}>
                      <FooterNavLink link={link} locale={locale} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          {/*
            The privacy/terms/cookie links are rendered structurally, not as
            footer content links: they are a legal requirement, so they must
            survive FEATURE_CMS being on (where the columns come from Sanity
            and would omit them) and must not be removable by accident in the
            CMS. Placed as the first flex child so they land at the start
            (left in LTR, right in RTL) with copyright at the end.
          */}
          <span className="footer-legal">
            <LocaleLink href="/privacy-policy" className="footer-legal-link">
              {privacy.title}
            </LocaleLink>
            <LocaleLink href="/terms-conditions" className="footer-legal-link">
              {terms.title}
            </LocaleLink>
            <LocaleLink href="/cookie-policy" className="footer-legal-link">
              {cookies.title}
            </LocaleLink>
          </span>
          <span className="footer-copyright">{footer.copyright}</span>
        </div>
      </Container>
    </footer>
  );
}
