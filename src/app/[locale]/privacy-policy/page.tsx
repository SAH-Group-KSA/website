import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo, getPrivacyPolicy } from "@/content";
import type { PolicyBlock } from "@/content/types";
import { isLocale, type Locale } from "@/types/locale";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CookieSettings } from "@/components/consent/CookieSettings";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadataFromPageSeo, buildBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const [seo, page] = await Promise.all([
    getPageSeo(locale as Locale, "privacyPolicy"),
    getPrivacyPolicy(locale as Locale),
  ]);

  // `privacyPolicy` has a `pageSeo` document in both flag states, but the page
  // body itself stays static (no Sanity schema for the policy copy). Keep the
  // fallback to the page's own title/lead so an unpublished or cleared SEO
  // document can never ship this route untitled.
  return buildMetadataFromPageSeo(locale as Locale, seo, {
    title: seo.title || page.title,
    description: seo.description || page.lead,
    path: seo.path || "/privacy-policy",
  });
}

function PolicyBlocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index}>{block.text}</p>
        ) : (
          <ul key={index}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const [content, page] = await Promise.all([
    getContent(locale as Locale),
    getPrivacyPolicy(locale as Locale),
  ]);
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);

  return (
    <div id="privacy-policy-main">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          { name: page.breadcrumbCurrent, path: "/privacy-policy" },
        ])}
      />
      <PageHero
        before={
          <Breadcrumbs
            crumbs={[{ label: homeCrumb, href: "/" }, { label: page.breadcrumbCurrent }]}
          />
        }
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
      />

      <section className="section section-tinted">
        <Container>
          <div className="ds-prose">
            <p className="ds-prose-updated">
              <time dateTime={page.lastUpdatedIso}>{page.lastUpdatedLabel}</time>
            </p>

            {page.sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.heading}</h2>
                <PolicyBlocks blocks={section.blocks} />
              </section>
            ))}

            <CookieSettings labels={page.cookieSettings} />
          </div>
        </Container>
      </section>
    </div>
  );
}
