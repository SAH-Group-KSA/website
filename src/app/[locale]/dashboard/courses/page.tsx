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
    await getPageSeo(locale as Locale, "dashboardCourses"),
  );
}

export default async function DashboardCoursesPage({
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
            {isAr ? "مكتبة التعلم" : "Learning library"}
          </span>
          <h1>{isAr ? "دوراتي" : "My Courses"}</h1>
          <p>
            {isAr
              ? "تابع تقدمك وارجع إلى برامجك من مكان واحد."
              : "Track your progress and return to your programs from one place."}
          </p>
        </div>
        <Button variant="primary" size="sm" href="/courses">
          {isAr ? "استعرض المزيد" : "Browse Courses"}
        </Button>
      </div>

      <div className="dashboard-integration-note dev-notice">
        {isAr
          ? "ستظهر بيانات التسجيل والتقدم هنا تلقائياً بعد ربط نظام التعلم."
          : "Enrollment and progress data will appear here automatically once the learning system is connected."}
      </div>

      <div className="dashboard-section dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="dashboard-panel-kicker">
              {isAr ? "نشاطك الحالي" : "Current activity"}
            </span>
            <h2>{isAr ? "قيد التقدم" : "In progress"}</h2>
          </div>
          <span className="dashboard-count-badge">0</span>
        </div>
        <div className="empty-dashboard">
          <span className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M8 7h8" />
            </svg>
          </span>
          <h3>{isAr ? "ابدأ مسار تعلم جديد" : "Start a new learning path"}</h3>
          <p>
            {isAr
              ? "اختر دورة تناسب أهدافك وابدأ التعلم بالوتيرة المناسبة لك."
              : "Choose a course that fits your goals and learn at your own pace."}
          </p>
          <Button variant="primary" size="sm" href="/courses">
            {isAr ? "استعرض الدورات" : "Browse Courses"}
          </Button>
        </div>
      </div>

      <div className="dashboard-section dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="dashboard-panel-kicker">
              {isAr ? "إنجازاتك" : "Your achievements"}
            </span>
            <h2>{isAr ? "الدورات المكتملة" : "Completed courses"}</h2>
          </div>
          <span className="dashboard-count-badge">0</span>
        </div>
        <div className="empty-dashboard">
          <span className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
              <path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" />
            </svg>
          </span>
          <h3>{isAr ? "إنجازاتك ستظهر هنا" : "Your achievements will appear here"}</h3>
          <p>
            {isAr
              ? "أكمل دورتك الأولى لعرض الشهادة ونسبة الإنجاز."
              : "Complete your first course to see its certificate and progress."}
          </p>
        </div>
      </div>

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </>
  );
}
