import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { buildMetadataFromPageSeo } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { features } from "@/lib/features";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function DashboardGlyph({
  type,
}: {
  type: "courses" | "calendar" | "progress" | "profile" | "arrow" | "clock";
}) {
  const paths = {
    courses: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M8 7h8" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4M8 14h3M8 17h5" />
      </>
    ),
    progress: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2M12 3a9 9 0 0 1 9 9" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.4-3.4 3.8-5 7-5s5.6 1.6 7 5" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  } as const;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, "dashboard"),
  );
}

export default async function DashboardHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const isAr = locale === "ar";
  let displayName = "";
  if (features.auth) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      displayName = profile?.full_name ?? "";
    }
  }

  const stats = [
    {
      value: "0",
      label: isAr ? "الدورات المسجّلة" : "Enrolled courses",
      note: isAr ? "ابدأ رحلتك اليوم" : "Start your journey today",
      icon: "courses" as const,
    },
    {
      value: "0",
      label: isAr ? "الجلسات القادمة" : "Upcoming sessions",
      note: isAr ? "لا توجد حجوزات حالياً" : "No bookings scheduled",
      icon: "calendar" as const,
    },
    {
      value: "0%",
      label: isAr ? "متوسط الإتمام" : "Average completion",
      note: isAr ? "عبر جميع الدورات" : "Across all your courses",
      icon: "progress" as const,
    },
    {
      value: displayName ? "75%" : "40%",
      label: isAr ? "اكتمال الملف" : "Profile completion",
      note: isAr ? "أضف بياناتك الأساسية" : "Add your basic information",
      icon: "profile" as const,
    },
  ];

  return (
    <>
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-eyebrow">
            {isAr ? "مرحباً بعودتك" : "Welcome back"}
          </span>
          <h1>
            {isAr
              ? `${displayName || "عضو ساه"}، لنواصل التقدم`
              : `${displayName || "SAH Member"}, let’s keep moving forward`}
          </h1>
          <p>
            {isAr
              ? "مساحتك الموحدة لمتابعة التعلم، إدارة الجلسات، وتطوير رحلتك المهنية."
              : "Your central space to track learning, manage sessions, and shape your professional journey."}
          </p>
          <div className="dashboard-welcome-actions">
            <Button variant="gold" size="sm" href="/courses">
              {isAr ? "استكشف الدورات" : "Explore courses"}
            </Button>
            <Button variant="outline" size="sm" href="/dashboard/profile">
              {isAr ? "أكمل ملفك" : "Complete profile"}
            </Button>
          </div>
        </div>
        <div className="dashboard-welcome-visual" aria-hidden="true">
          <span className="dashboard-orbit dashboard-orbit-one" />
          <span className="dashboard-orbit dashboard-orbit-two" />
          <div className="dashboard-welcome-mark">SAH</div>
        </div>
      </section>

      <section className="dashboard-stats" aria-label={isAr ? "نظرة عامة" : "Overview"}>
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-card-top">
              <span className="stat-card-icon">
                <DashboardGlyph type={stat.icon} />
              </span>
              <span className="stat-card-menu" aria-hidden="true">
                •••
              </span>
            </div>
            <strong>{stat.value}</strong>
            <span className="stat-card-label">{stat.label}</span>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <div className="dashboard-overview-grid">
        <section className="dashboard-panel dashboard-journey-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                {isAr ? "مسار التعلم" : "Learning path"}
              </span>
              <h2>{isAr ? "تابع رحلتك" : "Continue your journey"}</h2>
            </div>
            <LocaleLink href="/dashboard/courses" className="dashboard-text-link">
              {isAr ? "عرض الكل" : "View all"}
              <DashboardGlyph type="arrow" />
            </LocaleLink>
          </div>
          <div className="dashboard-feature-empty">
            <div className="dashboard-feature-icon">
              <DashboardGlyph type="courses" />
            </div>
            <div>
              <h3>{isAr ? "تعلم شيئاً جديداً اليوم" : "Learn something new today"}</h3>
              <p>
                {isAr
                  ? "لم تسجّل في دورة بعد. استكشف البرامج المصممة لتطوير مهاراتك."
                  : "You are not enrolled yet. Discover programs designed to advance your skills."}
              </p>
            </div>
            <Button variant="primary" size="sm" href="/courses">
              {isAr ? "تصفح الكتالوج" : "Browse catalog"}
            </Button>
          </div>
        </section>

        <aside className="dashboard-panel dashboard-schedule-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                {isAr ? "جدولك" : "Your schedule"}
              </span>
              <h2>{isAr ? "الجلسة القادمة" : "Next session"}</h2>
            </div>
          </div>
          <div className="dashboard-schedule-empty">
            <span>
              <DashboardGlyph type="clock" />
            </span>
            <h3>{isAr ? "جدولك متاح" : "Your schedule is clear"}</h3>
            <p>
              {isAr
                ? "احجز جلسة فردية مع أحد مدربينا."
                : "Book a one-to-one session with one of our coaches."}
            </p>
            <Button variant="outline-dark" size="sm" href="/coaches">
              {isAr ? "ابحث عن مدرب" : "Find a coach"}
            </Button>
          </div>
        </aside>
      </div>

      <section className="dashboard-quick-actions">
        <div className="dashboard-panel-header">
          <div>
            <span className="dashboard-panel-kicker">
              {isAr ? "اختصارات" : "Shortcuts"}
            </span>
            <h2>{isAr ? "إجراءات سريعة" : "Quick actions"}</h2>
          </div>
        </div>
        <div className="dashboard-action-grid">
          {[
            {
              href: "/coaches",
              title: isAr ? "احجز جلسة" : "Book a session",
              text: isAr ? "تواصل مع مدرب متخصص" : "Connect with an expert coach",
              icon: "calendar" as const,
            },
            {
              href: "/courses",
              title: isAr ? "استكشف الدورات" : "Explore courses",
              text: isAr ? "اكتشف مسارك التعليمي" : "Discover your learning path",
              icon: "courses" as const,
            },
            {
              href: "/community/apply",
              title: isAr ? "انضم للمجتمع" : "Join the community",
              text: isAr ? "وسّع شبكة علاقاتك" : "Grow your professional network",
              icon: "profile" as const,
            },
          ].map((action) => (
            <LocaleLink
              href={action.href}
              className="dashboard-action-card"
              key={action.href}
            >
              <span>
                <DashboardGlyph type={action.icon} />
              </span>
              <div>
                <strong>{action.title}</strong>
                <small>{action.text}</small>
              </div>
              <i>
                <DashboardGlyph type="arrow" />
              </i>
            </LocaleLink>
          ))}
        </div>
      </section>

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </>
  );
}
