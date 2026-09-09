import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo, getCoaches } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { COACHES_COMING_SOON } from "@/lib/coaches-availability";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { CoachesListClient } from "@/components/coaches/CoachesListClient";
import {
  buildMetadataFromPageSeo,
  buildItemListJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(locale as Locale, await getPageSeo(locale as Locale, "coaches"));
}

export default async function CoachesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const page = content.catalogPages!.coaches;
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);
  const coaches = COACHES_COMING_SOON ? [] : await getCoaches(locale as Locale);

  return (
    <div id="coaches-main">
      {!COACHES_COMING_SOON ? (
        <JsonLd
          data={buildItemListJsonLd(
            locale as Locale,
            coaches.map((c) => ({
              name: c.name,
              description: c.specialty,
              url: `/coaches/${c.slug}`,
            })),
          )}
        />
      ) : null}
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          { name: page.breadcrumbs.parentBrand, path: page.breadcrumbs.parentHref },
          { name: page.breadcrumbCurrent, path: "/coaches" },
        ])}
      />
      <PageHero
        media
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        before={
          <Breadcrumbs
            crumbs={[
              { label: homeCrumb, href: "/" },
              { label: page.breadcrumbs.parentBrand, href: page.breadcrumbs.parentHref },
              { label: page.breadcrumbCurrent },
            ]}
          />
        }
      />

      {COACHES_COMING_SOON ? (
        <ComingSoonBanner
          title={page.comingSoon.title}
          body={page.comingSoon.body}
        />
      ) : (
        <>
          <Section tone="tinted">
            <Container>
              <div className="dev-notice dev-notice-md reveal">
                <strong>🔌 {page.devNotice.label}:</strong> {page.devNotice.body}
              </div>
              <div className="reveal" data-delay="80">
                <CoachesListClient labels={page.list} coaches={coaches} />
              </div>
            </Container>
          </Section>

          <Section atmosphere>
            <Container>
              <div className="community-card community-card--light content-narrow reveal">
                <div className="community-copy">
                  <h2>{page.groupCta.title}</h2>
                  <p>{page.groupCta.body}</p>
                </div>
                <Button href="/coaches/group" variant="gold">
                  {page.groupCta.button}
                </Button>
              </div>
            </Container>
          </Section>
        </>
      )}

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </div>
  );
}
