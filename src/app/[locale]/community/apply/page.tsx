import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { AppImage } from "@/components/ui/AppImage";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { CommunityApplyFormClient } from "@/components/community/CommunityApplyFormClient";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import {
  buildMetadataFromPageSeo,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, "communityApply"),
  );
}

export default async function CommunityApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const [impactCard, legoCard] = content.community.cards;
  const apply = content.community.applyPage;
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);

  return (
    <div id="community-apply-main">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          {
            name: apply.heroTitle,
            path: "/community/apply",
          },
        ])}
      />
      <PageHero
        before={
          <Breadcrumbs
            crumbs={[
              { label: homeCrumb, href: "/" },
              { label: apply.breadcrumbCommunity },
            ]}
          />
        }
        title={apply.heroTitle}
        lead={apply.heroLead}
      />

      <section className="section section-tinted section-atmosphere">
        <Container>
          <div className="community-grid content-wide">
            <article
              className="community-card community-card--light reveal"
              style={{ ["--community-accent" as string]: "var(--impact)" }}
            >
              {impactCard?.logo ? (
                <div className="community-logo">
                  <AppImage
                    src={impactCard.logo}
                    alt={impactCard.label}
                    width={160}
                    height={80}
                    sizes="112px"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="community-copy">
                <h2>{apply.individualTitle}</h2>
                <p>{apply.individualBody}</p>
                <div className="community-features">
                  {apply.individualFeatures.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
            </article>
            <article
              className="community-card community-card--light reveal"
              data-delay="80"
              style={{ ["--community-accent" as string]: "var(--lego)" }}
            >
              {legoCard?.logo ? (
                <div className="community-logo">
                  <AppImage
                    src={legoCard.logo}
                    alt={legoCard.label}
                    width={160}
                    height={80}
                    sizes="112px"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="community-copy">
                <h2>{apply.organisationTitle}</h2>
                <p>{apply.organisationBody}</p>
                <div className="community-features">
                  {apply.organisationFeatures.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="apply-card reveal" data-delay="100">
            <h3>{apply.formTitle}</h3>
            <p>{apply.formIntro}</p>

            {apply.formDevNotice?.trim() ? (
              <div className="dev-notice">🔌 {apply.formDevNotice}</div>
            ) : null}

            <CommunityApplyFormClient labels={apply.form} locale={locale as Locale} />
          </div>
        </Container>
      </section>

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </div>
  );
}
