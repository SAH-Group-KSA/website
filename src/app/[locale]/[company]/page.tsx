import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { CompanyHomePage } from "@/components/company/CompanyHomePage";
import { buildMetadataFromPageSeo } from "@/lib/seo";
import {
  COMPANY_ROUTES,
  getCompanyBySlug,
  type CompanyEntityId,
} from "@/lib/companies";

type Params = { locale: string; company: string };

export function generateStaticParams() {
  return COMPANY_ROUTES.map((route) => ({ company: route.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, company } = await params;
  if (!isLocale(locale)) return {};
  const route = getCompanyBySlug(company);
  if (!route) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, route.seoKey),
  );
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, company } = await params;
  if (!isLocale(locale)) notFound();

  const route = getCompanyBySlug(company);
  if (!route) notFound();

  setRequestLocale(locale as Locale);
  const content = await getContent(locale as Locale);
  const page = content.entityPages[route.entityId as CompanyEntityId];
  const entity = content.entities.find((item) => item.id === route.entityId);
  if (!page || !entity) notFound();

  return (
    <CompanyHomePage
      locale={locale as Locale}
      route={route}
      content={content}
      page={page}
      entity={entity}
    />
  );
}
