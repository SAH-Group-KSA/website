import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { buildPrivatePageMetadata } from "@/lib/seo";
import { RegisterFormClient } from "@/components/auth/RegisterFormClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildPrivatePageMetadata(locale as Locale, "authRegister", "/auth/register");
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const isAr = locale === "ar";

  return (
    <RegisterFormClient
      isAr={isAr}
      siteName={content.meta.siteName}
      logoAlt={content.footer.logoAlt}
    />
  );
}
