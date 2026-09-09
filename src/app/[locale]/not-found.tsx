import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { getLocale } from "next-intl/server";
import { getContent, getPageSeo } from "@/content";
import type { Locale } from "@/types/locale";
import { buildMetadataFromPageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return buildMetadataFromPageSeo(locale, await getPageSeo(locale, "notFound"));
}

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const { ui, cta } = await getContent(locale);

  return (
    <PageHero
      as="div"
      toneClassName="not-found-page"
      innerClassName="not-found-inner"
      eyebrow="404"
      title={ui.backToHome}
    >
      <Button href="/" variant="primary">
        {cta.header}
      </Button>
    </PageHero>
  );
}
