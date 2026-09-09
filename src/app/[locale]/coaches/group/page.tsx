import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GroupInterestFormClient } from "@/components/coaches/GroupInterestFormClient";
import { JsonLd } from "@/components/seo/JsonLd";
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
    await getPageSeo(locale as Locale, "coachesGroup"),
  );
}

export default async function GroupCoachingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const page = content.catalogPages!.coachesGroup;
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);

  return (
    <div id="group-coaching-main">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          { name: page.breadcrumbs.parentBrand, path: page.breadcrumbs.parentHref },
          { name: page.breadcrumbCurrent, path: "/coaches/group" },
        ])}
      />
      <PageHero
        media
        before={
          <Breadcrumbs
            crumbs={[
              { label: homeCrumb, href: "/" },
              { label: page.breadcrumbs.parentBrand, href: page.breadcrumbs.parentHref },
              { label: page.breadcrumbCurrent },
            ]}
          />
        }
        title={page.title}
        lead={page.lead}
      />

      <section className="section section-tinted">
        <Container>
          <div className="group-interest-card">
            <h2>{page.formTitle}</h2>
            <p className="mb-6 text-small text-muted">{page.formIntro}</p>

            {page.devNotice?.trim() ? (
              <div className="dev-notice">🔌 {page.devNotice}</div>
            ) : null}

            <GroupInterestFormClient
              labels={page.form}
              programs={page.programs}
              locale={locale as Locale}
            />
          </div>
        </Container>
      </section>

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </div>
  );
}
