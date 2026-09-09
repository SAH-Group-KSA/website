import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ResetPasswordFormClient } from "@/components/auth/ResetPasswordFormClient";
import { getContent } from "@/content";
import { isLocale, type Locale } from "@/types/locale";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  return (
    <ResetPasswordFormClient isAr={locale === "ar"} logoAlt={content.footer.logoAlt} />
  );
}
