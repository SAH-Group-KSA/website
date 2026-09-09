import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const isAr = locale === "ar";

  return (
    <DashboardShell
      isAr={isAr}
      logoAlt={content.footer.logoAlt}
      ui={{
        dashboard: content.ui.dashboard,
        myCourses: content.ui.myCourses,
        myBookings: content.ui.myBookings,
        myProfile: content.ui.myProfile,
        signOut: content.ui.signOut,
        backToHome: content.ui.backToHome,
      }}
    >
      {children}
    </DashboardShell>
  );
}
