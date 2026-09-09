import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { buildMetadataFromPageSeo } from "@/lib/seo";
import { ProfileFormClient } from "@/components/dashboard/ProfileFormClient";
import { features } from "@/lib/features";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, "dashboardProfile"),
  );
}

export default async function DashboardProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const isAr = locale === "ar";
  let initialProfile = {
    name: "",
    email: "",
    phone: "",
    language: (isAr ? "ar" : "en") as "ar" | "en",
  };

  if (features.auth) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, locale")
        .eq("id", user.id)
        .maybeSingle();
      initialProfile = {
        name: profile?.full_name ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? "",
        language: profile?.locale === "en" ? "en" : "ar",
      };
    }
  }

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="dashboard-eyebrow">
            {isAr ? "إعدادات الحساب" : "Account settings"}
          </span>
          <h1>{isAr ? "ملفي الشخصي" : "My Profile"}</h1>
          <p>
            {isAr
              ? "حافظ على تحديث بياناتك وتفضيلات حسابك."
              : "Keep your personal information and account preferences up to date."}
          </p>
        </div>
      </div>

      <ProfileFormClient isAr={isAr} initialProfile={initialProfile} />

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </>
  );
}
