import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { DiscoveryFormClient } from "@/components/discovery/DiscoveryFormClient";
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
    await getPageSeo(locale as Locale, "discovery"),
  );
}

export default async function DiscoveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const need = content.need;
  const contact = content.contact;
  const { page } = need;
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);

  return (
    <div id="discovery-main">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          {
            name: page.breadcrumbTitle,
            path: "/discovery",
          },
        ])}
      />
      <PageHero
        toneClassName="discovery-hero"
        eyebrow={need.eyebrow}
        title={need.title}
        lead={need.intro}
      >
        <p className="discovery-hero-reassure">{page.heroReassure}</p>
      </PageHero>

      <section
        aria-label={page.sectionAriaLabel}
        className="section discovery-page section-atmosphere"
      >
        <div className="reveal">
          <DiscoveryFormClient
            data={need}
            challenges={content.journeyChallenges}
            entityColors={content.entityColors}
            locale={locale}
            requestFormLabels={{
              name: contact.fields.name,
              email: contact.fields.email,
              phone: contact.fields.phone,
              message: page.requestForm.message,
              submit: page.requestForm.submit,
              success: page.requestForm.success,
              error: contact.error,
              note: page.requestForm.note,
            }}
          />
        </div>
      </section>
    </div>
  );
}
