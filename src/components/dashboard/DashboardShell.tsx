"use client";

import { useEffect, useState } from "react";
import { signOut } from "@/adapters/supabase/auth";
import { usePathname, useRouter } from "@/i18n/routing";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { AppImage } from "@/components/ui/AppImage";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "sah-dashboard-sidebar";

type Props = {
  isAr: boolean;
  logoAlt: string;
  ui: {
    dashboard: string;
    myCourses: string;
    myBookings: string;
    myProfile: string;
    signOut: string;
    backToHome: string;
  };
  children: React.ReactNode;
};

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

function SidebarToggleIcon() {
  return (
    <svg
      className="dashboard-sidebar-toggle-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

const icons = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
    </>
  ),
  courses: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  bookings: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </>
  ),
  site: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9S14.5 18.2 12 21c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z" />
    </>
  ),
  signOut: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
} as const;

function normalizeDashboardPath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

function isDashboardNavActive(pathname: string, href: string): boolean {
  const path = normalizeDashboardPath(pathname);
  if (href === "/dashboard") return path === "/dashboard";
  return path === href || path.startsWith(`${href}/`);
}

export function DashboardShell({ isAr, logoAlt, ui, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/onboard", { method: "POST" });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed") {
          setCollapsed(true);
        }
      } catch {
        // ignore storage errors
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "collapsed" : "expanded");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const collapseLabel = isAr ? "طي القائمة" : "Collapse sidebar";
  const expandLabel = isAr ? "توسيع القائمة" : "Expand sidebar";

  // Keep unready items in the list (hidden) so they can be re-enabled later.
  const navItems = [
    { href: "/dashboard", label: ui.dashboard, icon: icons.home, hidden: true },
    {
      href: "/dashboard/courses",
      label: ui.myCourses,
      icon: icons.courses,
      hidden: true,
    },
    {
      href: "/dashboard/bookings",
      label: ui.myBookings,
      icon: icons.bookings,
      hidden: true,
    },
    {
      href: "/dashboard/profile",
      label: ui.myProfile,
      icon: icons.profile,
      hidden: false,
    },
  ] as const;
  const visibleNavItems = navItems.filter((item) => !item.hidden);
  const currentPage =
    navItems.find((item) => isDashboardNavActive(pathname, item.href))?.label ??
    ui.myProfile;

  return (
    <div className={cn("dashboard-layout", collapsed && "is-sidebar-collapsed")}>
      <nav
        className={cn("dashboard-nav", collapsed && "is-collapsed")}
        aria-label={isAr ? "قائمة لوحة التحكم" : "Dashboard navigation"}
      >
        <div className="dashboard-nav-header">
          <div className="dashboard-nav-logo">
            <AppImage
              src="/logos/sah-group-logo.png"
              alt={logoAlt}
              width={377}
              height={139}
              sizes="148px"
              className="dashboard-nav-logo-img"
              priority
            />
            <div className="dashboard-brand-copy">
              <span>{isAr ? "بوابة الأعضاء" : "Member Portal"}</span>
              <small>{isAr ? "مساحتك الخاصة" : "Your private space"}</small>
            </div>
          </div>
          <button
            type="button"
            className="dashboard-sidebar-toggle"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-controls="dashboard-sidebar-nav"
            aria-label={collapsed ? expandLabel : collapseLabel}
            title={collapsed ? expandLabel : collapseLabel}
          >
            <SidebarToggleIcon />
          </button>
        </div>

        <div id="dashboard-sidebar-nav" className="dashboard-nav-body">
          <span className="dashboard-nav-section">{isAr ? "الحساب" : "Account"}</span>

          {visibleNavItems.map((item) => {
            const isActive = isDashboardNavActive(pathname, item.href);
            return (
              <LocaleLink
                key={item.href}
                href={item.href as `/dashboard${string}`}
                className={cn("dashboard-nav-item", isActive && "is-active")}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <NavIcon>{item.icon}</NavIcon>
                <span className="dashboard-nav-label">{item.label}</span>
              </LocaleLink>
            );
          })}

          <span className="dashboard-nav-section">{isAr ? "الموقع" : "Site"}</span>
          <LocaleLink
            href="/"
            className="dashboard-nav-item"
            title={collapsed ? ui.backToHome : undefined}
          >
            <NavIcon>{icons.site}</NavIcon>
            <span className="dashboard-nav-label">{ui.backToHome}</span>
          </LocaleLink>

          <div className="dashboard-nav-footer">
            <div className="dashboard-support-card">
              <span className="dashboard-support-icon" aria-hidden="true">
                ?
              </span>
              <div className="dashboard-nav-label">
                <strong>{isAr ? "هل تحتاج إلى مساعدة؟" : "Need some help?"}</strong>
                <LocaleLink href="/contact">
                  {isAr ? "تواصل مع فريقنا" : "Contact our team"}
                </LocaleLink>
              </div>
            </div>

            <button
              type="button"
              className="dashboard-nav-item dashboard-nav-item-btn"
              title={collapsed ? ui.signOut : undefined}
              onClick={() => {
                void signOut().then((result) => {
                  if (result.ok) {
                    router.push("/");
                    router.refresh();
                    return;
                  }
                  if (!result.ok && result.code === "not_configured") {
                    alert(
                      isAr
                        ? "تسجيل الخروج غير متاح بعد — Supabase Auth قيد الإعداد."
                        : "Sign-out pending Supabase Auth setup.",
                    );
                  }
                });
              }}
            >
              <NavIcon>{icons.signOut}</NavIcon>
              <span className="dashboard-nav-label">{ui.signOut}</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-title">
            <span>{isAr ? "مساحة العمل" : "Workspace"}</span>
            <strong>{currentPage}</strong>
          </div>
          <div className="dashboard-topbar-actions">
            <LocaleLink href="/dashboard/profile" className="dashboard-user-menu">
              <span className="dashboard-user-avatar" aria-hidden="true">
                {isAr ? "س" : "S"}
              </span>
              <span className="dashboard-user-copy">
                <strong>{isAr ? "عضو ساه" : "SAH Member"}</strong>
                <small>{isAr ? "حساب شخصي" : "Personal account"}</small>
              </span>
            </LocaleLink>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="dashboard-content-inner">{children}</div>
        </main>
      </section>
    </div>
  );
}
