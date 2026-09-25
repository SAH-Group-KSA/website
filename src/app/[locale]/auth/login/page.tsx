import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { buildPrivatePageMetadata } from "@/lib/seo";
import { LoginFormClient } from "@/components/auth/LoginFormClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildPrivatePageMetadata(locale as Locale, "authLogin", "/auth/login");
}

export default async function LoginPage({
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
    <Suspense fallback={null}>
      <LoginFormClient
        isAr={isAr}
        siteName={content.meta.siteName}
        logoAlt={content.footer.logoAlt}
      />
    </Suspense>
  );
}
