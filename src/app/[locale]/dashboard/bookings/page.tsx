import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { buildMetadataFromPageSeo } from "@/lib/seo";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, "dashboardBookings"),
  );
}

export default async function DashboardBookingsPage({
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
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="dashboard-eyebrow">
            {isAr ? "إدارة الجلسات" : "Session management"}
          </span>
          <h1>{isAr ? "حجوزاتي" : "My Bookings"}</h1>
          <p>
            {isAr
              ? "نظّم مواعيدك وراجع جلساتك السابقة والقادمة."
              : "Organize appointments and review your past and upcoming sessions."}
          </p>
        </div>
        <Button variant="primary" size="sm" href="/coaches">
          {isAr ? "احجز جلسة جديدة" : "Book New Session"}
        </Button>
      </div>

      <div className="dashboard-integration-note dev-notice">
        {isAr
          ? "ستتم مزامنة حجوزاتك هنا تلقائياً بعد ربط نظام المواعيد."
          : "Your bookings will sync here automatically once the scheduling system is connected."}
      </div>

      <div className="dashboard-section dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="dashboard-panel-kicker">
              {isAr ? "جدولك" : "Your schedule"}
            </span>
            <h2>{isAr ? "الجلسات القادمة" : "Upcoming sessions"}</h2>
          </div>
          <span className="dashboard-count-badge">0</span>
        </div>
        <div className="empty-dashboard">
          <span className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4M8 14h3M8 17h6" />
            </svg>
          </span>
          <h3>{isAr ? "جدولك متاح" : "Your schedule is clear"}</h3>
          <p>
            {isAr
              ? "اختر مدرباً متخصصاً واحجز الوقت الذي يناسبك."
              : "Choose an expert coach and reserve a time that works for you."}
          </p>
          <Button variant="primary" size="sm" href="/coaches">
            {isAr ? "استعرض المدربين" : "Browse Coaches"}
          </Button>
        </div>
      </div>

      <div className="dashboard-section dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="dashboard-panel-kicker">{isAr ? "السجل" : "History"}</span>
            <h2>{isAr ? "الجلسات السابقة" : "Past sessions"}</h2>
          </div>
          <span className="dashboard-count-badge">0</span>
        </div>
        <div className="empty-dashboard">
          <span className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2M7 3.5 4.5 6" />
            </svg>
          </span>
          <h3>{isAr ? "لا يوجد سجل حتى الآن" : "No session history yet"}</h3>
          <p>
            {isAr
              ? "ستظهر جلساتك المكتملة وملاحظاتها هنا."
              : "Completed sessions and their details will appear here."}
          </p>
        </div>
      </div>

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </>
  );
}
