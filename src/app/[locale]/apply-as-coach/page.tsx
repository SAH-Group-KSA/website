import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getApplyAsCoach, getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { CoachApplyFormClient } from "@/components/coaches/CoachApplyFormClient";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { buildMetadataFromPageSeo, buildBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, "applyAsCoach"),
  );
}

export default async function ApplyAsCoachPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const [content, page] = await Promise.all([
    getContent(locale as Locale),
    getApplyAsCoach(locale as Locale),
  ]);
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);

  return (
    <div id="apply-as-coach-main">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          { name: page.breadcrumbCurrent, path: "/apply-as-coach" },
        ])}
      />
      <PageHero
        before={
          <Breadcrumbs
            crumbs={[{ label: homeCrumb, href: "/" }, { label: page.breadcrumbCurrent }]}
          />
        }
        title={page.title}
        lead={page.lead}
      />

      <section className="section section-tinted section-atmosphere">
        <Container>
          <div className="apply-card coach-apply-card reveal">
            <h3>{page.formTitle}</h3>
            <p>{page.formIntro}</p>
            <CoachApplyFormClient labels={page.form} locale={locale as Locale} />
          </div>
        </Container>
      </section>
    </div>
  );
}
