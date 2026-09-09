"use client";

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import type { MegaNavContent, MegaNavEntity, NavItem } from "@/content/types";
import type { Locale } from "@/types/locale";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { useScrollUI } from "@/hooks/useScrollUI";
import { useActiveSection } from "@/hooks/useActiveSection";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { ExploreMegaPanel, ServicesMegaPanel } from "@/components/layout/NavMegaMenus";
import { openContact } from "@/lib/interactions";
import {
  companyPath,
  isCompanyPath,
  isHumanProductPath,
  type CompanyEntityId,
} from "@/lib/companies";
import { localePath } from "@/types/locale";
import { signOut } from "@/adapters/supabase/auth";

const ENTITY_HASH_RE = /^#entity-(.+)$/;

/** Entity deep-links (#entity-*) resolve via companyHrefFromHash. */
function parseEntityHash(hash: string): string | null {
  const match = hash.match(ENTITY_HASH_RE);
  return match?.[1] ?? null;
}

function companyHrefFromHash(hash: string, locale: Locale): string | null {
  const entityId = parseEntityHash(hash);
  if (!entityId) return null;
  const path = companyPath(entityId as CompanyEntityId);
  if (path === "/") return null;
  return localePath(locale, path);
}

export type SiteHeaderProps = {
  nav: NavItem[];
  ctaHeader: string;
  defaultContactContext: string;
  logoAlt: string;
  megaNav: MegaNavContent;
  megaEntities: MegaNavEntity[];
  ui: {
    backToHome: string;
    primaryNav: string;
    signIn: string;
    signOut: string;
    dashboard: string;
    editProfile: string;
    menuOpen: string;
    menuClose: string;
    mobileNav: string;
  };
  isAuthenticated: boolean;
  user?: {
    displayName: string;
    email: string;
  } | null;
};

/**
 * Hash anchors (#entities) resolve to the home page so they work from any route.
 * Entity deep-links (#entity-seera) resolve to company homepages.
 * Page routes (/coaches) stay as-is for LocaleLink.
 */
function resolveNavHref(href: string, locale: Locale): string {
  const companyHref = companyHrefFromHash(href, locale);
  if (companyHref) return companyHref;
  if (!href.startsWith("#")) return href;
  const base = locale === "en" ? "/en" : "";
  return `${base}/${href}`;
}

function isPageRoute(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("/#");
}

/** Strip locale prefix so `/en/coaches` → `/coaches`. */
function normalizePath(pathname: string, locale: Locale): string {
  if (locale === "en" && (pathname === "/en" || pathname.startsWith("/en/"))) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

/** Smooth-scroll to a section without a route change. */
function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth" });
  window.history.pushState(null, "", hash);
}

/**
 * On the home page: prevent reload and smooth-scroll.
 * Entity hashes always navigate to the company homepage.
 * Off home: let the browser navigate to `/[locale]/#section`.
 */
function handleHashClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  hash: string,
  path: string,
  locale: Locale,
) {
  const companyHref = companyHrefFromHash(hash, locale);
  if (companyHref) {
    event.preventDefault();
    window.location.assign(companyHref);
    return;
  }
  if (path !== "/") return;
  event.preventDefault();
  scrollToHash(hash);
}

/** Whether a single nav link (flat or child) matches the current location. */
function isChildActive(item: NavItem, path: string, activeHash: string | null): boolean {
  if (item.href.startsWith("#")) {
    // Entity deep-links are entry points, not section bookmarks — don't sticky-highlight.
    if (parseEntityHash(item.href)) return false;
    return activeHash === item.href;
  }
  if (item.href === "/") {
    // Home is active only when on home and no explore-section is in view
    return path === "/" && !activeHash;
  }
  if (isCompanyPath(item.href)) {
    // Company nav items: active on their homepage; Human also on product routes
    if (path === item.href || path.startsWith(`${item.href}/`)) return true;
    if (item.href === companyPath("human") && isHumanProductPath(path)) return true;
    return false;
  }
  return path === item.href;
}

/** Top-level item: active if itself matches, or any nested child matches. */
function isNavItemActive(
  item: NavItem,
  path: string,
  activeHash: string | null,
): boolean {
  if (item.children?.length) {
    return item.children.some((child) => {
      if (child.children?.length) {
        return isNavItemActive(child, path, activeHash);
      }
      if (child.href.startsWith("#")) {
        return isChildActive(child, path, activeHash);
      }
      // Services parent stays active on any company page + Human product routes
      if (isCompanyPath(child.href) || isCompanyPath(path)) {
        if (path === child.href || path.startsWith(`${child.href}/`)) return true;
        if (child.href === companyPath("human") && isHumanProductPath(path)) {
          return true;
        }
        // Highlight Services trigger when on any company homepage
        if (item.id === "services" && isCompanyPath(path)) return true;
        return false;
      }
      return path === child.href || path.startsWith(`${child.href}/`);
    });
  }
  return isChildActive(item, path, activeHash);
}

/** Collapsible group for mobile nav items that have children */
function MobileNavGroup({
  item,
  locale,
  index,
  path,
  onClose,
}: {
  item: NavItem;
  locale: Locale;
  index: number;
  path: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `mobile-nav-panel-${item.id}`;

  return (
    <div
      className={cn("mobile-nav-group", open && "is-open")}
      style={{ "--i": index } as CSSProperties}
    >
      <button
        type="button"
        className="mobile-nav-group-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{item.label}</span>
        <span className="mobile-nav-group-chevron-wrap" aria-hidden="true">
          <svg
            className="mobile-nav-group-chevron"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5l3.5 3.5 3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        className="mobile-nav-group-panel"
        {...(!open ? { inert: true } : {})}
        style={{ maxHeight: open ? "min(70vh, 480px)" : 0 }}
      >
        <div className="mobile-nav-children">
          {item.children!.map((child) => (
            <NavChildLink
              key={child.id}
              item={child}
              locale={locale}
              path={path}
              className="mobile-nav-child"
              onClick={onClose}
              showDescription={Boolean(child.description)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavChildLink({
  item,
  locale,
  path,
  className,
  onClick,
  active,
  showDescription,
}: {
  item: NavItem;
  locale: Locale;
  path: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  showDescription?: boolean;
}) {
  const classes = cn(className, active && "is-active");
  const body =
    showDescription && item.description ? (
      <span className="nav-link-copy">
        <span className="nav-link-label">{item.label}</span>
        <span className="nav-link-desc">{item.description}</span>
      </span>
    ) : (
      item.label
    );

  if (item.href.startsWith("#")) {
    const companyHref = companyHrefFromHash(item.href, locale);
    // On home: plain hash (no reload). Off home: home URL + hash.
    // Entity hashes always resolve to company homepages.
    const href =
      companyHref ?? (path === "/" ? item.href : resolveNavHref(item.href, locale));
    return (
      <a
        href={href}
        className={classes}
        onClick={(e) => {
          handleHashClick(e, item.href, path, locale);
          onClick?.();
        }}
      >
        {body}
      </a>
    );
  }
  return (
    <LocaleLink href={item.href as `/${string}`} className={classes} onClick={onClick}>
      {body}
    </LocaleLink>
  );
}

function NavFlatLink({
  item,
  locale,
  path,
  active,
}: {
  item: NavItem;
  locale: Locale;
  path: string;
  active: boolean;
}) {
  const classes = cn(active && "is-active");
  if (isPageRoute(item.href)) {
    return (
      <LocaleLink href={item.href as `/${string}`} className={classes}>
        {item.label}
      </LocaleLink>
    );
  }
  if (item.href.startsWith("#")) {
    const companyHref = companyHrefFromHash(item.href, locale);
    const href =
      companyHref ?? (path === "/" ? item.href : resolveNavHref(item.href, locale));
    return (
      <a
        href={href}
        className={classes}
        onClick={(e) => handleHashClick(e, item.href, path, locale)}
      >
        {item.label}
      </a>
    );
  }
  return (
    <a href={resolveNavHref(item.href, locale)} className={classes}>
      {item.label}
    </a>
  );
}

/** Flat link or mega-menu dropdown (Explore / Services). */
function NavDropdown({
  item,
  locale,
  path,
  activeHash,
  megaNav,
  megaEntities,
}: {
  item: NavItem;
  locale: Locale;
  path: string;
  activeHash: string | null;
  megaNav: MegaNavContent;
  megaEntities: MegaNavEntity[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = `nav-panel-${item.id}`;
  const active = isNavItemActive(item, path, activeHash);
  const isMega = item.id === "services" || item.id === "explore";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!item.children?.length) {
    return <NavFlatLink item={item} locale={locale} path={path} active={active} />;
  }

  const megaHandlers = {
    locale,
    path,
    activeHash,
    onNavigate: () => setOpen(false),
    resolveHref: resolveNavHref,
    handleHashClick,
    isChildActive,
  };

  return (
    <div
      ref={ref}
      className={cn("nav-dropdown", isMega && "nav-mega", open && "is-open")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn("nav-dropdown-trigger", open && "is-open", active && "is-active")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <svg
          className="nav-dropdown-chevron"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className={cn(
            isMega ? "nav-mega-panel" : "nav-dropdown-panel",
            item.id === "services" && "nav-mega-panel-services",
            item.id === "explore" && "nav-mega-panel-explore",
          )}
        >
          {item.id === "services" ? (
            <ServicesMegaPanel
              items={item.children}
              entities={megaEntities}
              copy={megaNav}
              handlers={megaHandlers}
            />
          ) : item.id === "explore" ? (
            <ExploreMegaPanel
              items={item.children}
              copy={megaNav}
              handlers={megaHandlers}
            />
          ) : (
            item.children.map((child) => (
              <NavChildLink
                key={child.id}
                item={child}
                locale={locale}
                path={path}
                className="nav-dropdown-item"
                active={isChildActive(child, path, activeHash)}
                onClick={() => setOpen(false)}
                showDescription={Boolean(child.description)}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({
  nav,
  ctaHeader,
  defaultContactContext,
  logoAlt: _logoAlt,
  megaNav,
  megaEntities,
  ui,
  isAuthenticated,
  user,
}: SiteHeaderProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const path = normalizePath(pathname, locale);
  const { scrolled } = useScrollUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const sectionHash = useActiveSection();
  // Only apply section highlighting on the home page
  const activeHash = path === "/" ? sectionHash : null;

  const closeMenu = useCallback(() => {
    setMenuClosing(true);
    window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
      menuToggleRef.current?.focus();
    }, 320);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu();
    } else {
      setMenuOpen(true);
      setMenuClosing(false);
    }
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const menu = menuRef.current;
    const closeBtn = menu?.querySelector<HTMLElement>(".mobile-menu-close");
    closeBtn?.focus();

    const focusables = () =>
      menu
        ? Array.from(
            menu.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => {
            if (
              el.hasAttribute("disabled") ||
              el.getAttribute("aria-hidden") === "true"
            ) {
              return false;
            }
            const style = window.getComputedStyle(el);
            return style.visibility !== "hidden" && style.display !== "none";
          })
        : [];

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !menu) return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const main = document.getElementById("main");
    const header = document.getElementById("site-header");
    main?.setAttribute("inert", "");
    header?.setAttribute("inert", "");

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      header?.removeAttribute("inert");
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1281px)");
    const onChange = () => {
      if (mq.matches) {
        setMenuOpen(false);
        setMenuClosing(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isMenuVisible = menuOpen || menuClosing;
  const handleSignOut = async () => {
    const result = await signOut();
    if (result.ok) {
      window.location.assign(locale === "en" ? "/en" : "/");
    }
  };

  return (
    <>
      <header id="site-header" className={cn("site-header", scrolled && "is-scrolled")}>
        <Container className="header-inner">
          <LocaleLink href="/" aria-label={ui.backToHome} className="brand">
            <AppImage
              src="/logos/sah-group-logo.png"
              alt=""
              width={377}
              height={139}
              sizes="162px"
              priority
            />
          </LocaleLink>

          <nav aria-label={ui.primaryNav} className="desktop-nav">
            {nav.map((item) => (
              <NavDropdown
                key={item.id}
                item={item}
                locale={locale}
                path={path}
                activeHash={activeHash}
                megaNav={megaNav}
                megaEntities={megaEntities}
              />
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher
              inverted={!scrolled}
              className="lang-switch lang-switch-desktop"
            />
            {isAuthenticated ? (
              <HeaderUserMenu
                displayName={user?.displayName ?? ""}
                email={user?.email ?? ""}
                dashboardLabel={ui.editProfile}
                signOutLabel={ui.signOut}
                inverted={!scrolled}
                onSignOut={() => void handleSignOut()}
              />
            ) : (
              <LocaleLink
                href="/auth/login"
                className={cn(
                  "lang-switch-btn header-signin-link",
                  scrolled ? "is-ink" : "is-inverted",
                )}
              >
                {ui.signIn}
              </LocaleLink>
            )}
            <span className="header-actions-sep" aria-hidden="true" />
            <Button
              type="button"
              variant="gold"
              size="sm"
              className="header-primary-cta js-open-contact"
              data-contact-context={defaultContactContext}
              onClick={() => openContact(defaultContactContext)}
            >
              {ctaHeader}
            </Button>
            <button
              ref={menuToggleRef}
              type="button"
              className={cn("menu-toggle", isMenuVisible && "is-open")}
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? ui.menuClose : ui.menuOpen}
              onClick={toggleMenu}
            >
              <span className="menu-toggle-line" aria-hidden="true" />
              <span className="menu-toggle-line" aria-hidden="true" />
              <span className="menu-toggle-line" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </header>

      {/* Full-screen mobile overlay — sibling to header so no stacking-context trap */}
      {isMenuVisible && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className={cn("mobile-menu", menuClosing && "is-closing")}
          role="dialog"
          aria-modal="true"
          aria-label={ui.mobileNav}
        >
          {/* Top bar */}
          <div className="mobile-menu-top">
            <LocaleLink
              href="/"
              className="mobile-menu-brand"
              aria-label={ui.backToHome}
              onClick={closeMenu}
            >
              <AppImage
                src="/logos/sah-group-logo.png"
                alt=""
                width={377}
                height={139}
                sizes="130px"
              />
            </LocaleLink>
            <button
              type="button"
              className="mobile-menu-close"
              aria-label={ui.menuClose}
              onClick={closeMenu}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.5 2.5l11 11M13.5 2.5l-11 11"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="mobile-menu-nav" aria-label={ui.mobileNav}>
            {nav.map((item, i) =>
              item.children?.length ? (
                <MobileNavGroup
                  key={item.id}
                  item={item}
                  locale={locale}
                  index={i}
                  path={path}
                  onClose={closeMenu}
                />
              ) : isPageRoute(item.href) ? (
                <LocaleLink
                  key={item.id}
                  href={item.href as `/${string}`}
                  className="mobile-nav-link"
                  style={{ "--i": i } as CSSProperties}
                  onClick={closeMenu}
                >
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6h7M7 3.5l2.5 2.5L7 8.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </LocaleLink>
              ) : (
                <a
                  key={item.id}
                  href={
                    item.href.startsWith("#") && path === "/"
                      ? item.href
                      : resolveNavHref(item.href, locale)
                  }
                  className="mobile-nav-link"
                  style={{ "--i": i } as CSSProperties}
                  onClick={(e) => {
                    if (item.href.startsWith("#")) {
                      handleHashClick(e, item.href, path, locale);
                    }
                    closeMenu();
                  }}
                >
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6h7M7 3.5l2.5 2.5L7 8.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              ),
            )}
          </nav>

          {/* Footer row */}
          <div className="mobile-menu-footer">
            <LanguageSwitcher inverted className="mobile-menu-lang" />
            {isAuthenticated ? (
              <HeaderUserMenu
                displayName={user?.displayName ?? ""}
                email={user?.email ?? ""}
                dashboardLabel={ui.editProfile}
                signOutLabel={ui.signOut}
                variant="mobile"
                onSignOut={() => void handleSignOut()}
                onNavigate={closeMenu}
              />
            ) : (
              <LocaleLink
                href="/auth/login"
                className="mobile-menu-signin"
                onClick={closeMenu}
              >
                {ui.signIn}
              </LocaleLink>
            )}
            <Button
              href={path === "/" ? "#contact" : resolveNavHref("#contact", locale)}
              variant="primary"
              className="mobile-menu-cta"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                handleHashClick(e, "#contact", path, locale);
                closeMenu();
              }}
            >
              {ctaHeader}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
