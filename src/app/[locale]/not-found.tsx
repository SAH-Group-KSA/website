import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { getLocale } from "next-intl/server";
import { getContent } from "@/content";
import type { Locale } from "@/types/locale";

/**
 * Next ignores `metadata` / `generateMetadata` exports in `not-found.tsx`, so
 * this file cannot set its own title. The 404 title, description and
 * `noindex` come from the `notFound` page SEO record via the fallback
 * `generateMetadata` in `[locale]/layout.tsx` — edit it there.
 */
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
