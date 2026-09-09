"use client";

import type { ReactNode } from "react";
import type { MegaNavContent, MegaNavEntity, NavItem } from "@/content/types";
import type { Locale } from "@/types/locale";
import { cn } from "@/lib/utils";
import { LocaleLink } from "@/components/ui/LocaleLink";

type LinkHandlers = {
  locale: Locale;
  path: string;
  onNavigate: () => void;
  resolveHref: (href: string, locale: Locale) => string;
  handleHashClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
    path: string,
    locale: Locale,
  ) => void;
  isChildActive: (
    item: NavItem,
    path: string,
    activeHash: string | null,
  ) => boolean;
  activeHash: string | null;
};

function MegaLink({
  item,
  className,
  children,
  handlers,
}: {
  item: NavItem;
  className?: string;
  children: ReactNode;
  handlers: LinkHandlers;
}) {
  const {
    locale,
    path,
    onNavigate,
    resolveHref,
    handleHashClick,
    isChildActive,
    activeHash,
  } = handlers;
  const active = isChildActive(item, path, activeHash);
  const classes = cn(className, active && "is-active");

  if (item.href.startsWith("#")) {
    const href = path === "/" ? item.href : resolveHref(item.href, locale);
    return (
      <a
        href={href}
        className={classes}
        role="menuitem"
        onClick={(e) => {
          handleHashClick(e, item.href, path, locale);
          onNavigate();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <LocaleLink
      href={item.href as `/${string}`}
      className={classes}
      role="menuitem"
      onClick={onNavigate}
    >
      {children}
    </LocaleLink>
  );
}

export function ServicesMegaPanel({
  items,
  entities,
  copy,
  handlers,
}: {
  items: NavItem[];
  entities: MegaNavEntity[];
  copy: MegaNavContent;
  handlers: LinkHandlers;
}) {
  const entityById = new Map(entities.map((e) => [e.id, e]));

  return (
    <div className="nav-mega-shell">
      <div className="nav-mega-inner nav-mega-services">
        <aside className="nav-mega-aside">
          <p className="nav-mega-eyebrow">{copy.servicesEyebrow}</p>
          <h3 className="nav-mega-title">{copy.servicesTitle}</h3>
          <p className="nav-mega-body">{copy.servicesBody}</p>
          <LocaleLink
            href={copy.servicesCtaHref as `/${string}`}
            className="nav-mega-cta"
            onClick={handlers.onNavigate}
          >
            {copy.servicesCtaLabel}
            <span aria-hidden="true">→</span>
          </LocaleLink>
        </aside>

        <div className="nav-mega-main">
          <ul className="nav-mega-company-list">
            {items.map((item, index) => {
              const entity = item.entityId
                ? entityById.get(item.entityId)
                : undefined;
              const specialty = item.description ?? entity?.specialty;
              return (
                <li key={item.id}>
                  <MegaLink
                    item={item}
                    className="nav-mega-company"
                    handlers={handlers}
                  >
                    <span className="nav-mega-company-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="nav-mega-company-copy">
                      <span className="nav-mega-company-name">{item.label}</span>
                      {specialty ? (
                        <span className="nav-mega-company-desc">{specialty}</span>
                      ) : null}
                    </span>
                  </MegaLink>
                </li>
              );
            })}
          </ul>

          <div className="nav-mega-foot">
            <span className="nav-mega-foot-label">{copy.humanStripLabel}</span>
            <div className="nav-mega-foot-links" role="group">
              <LocaleLink href="/coaches" onClick={handlers.onNavigate}>
                {copy.humanCoachingLabel}
              </LocaleLink>
              <span aria-hidden="true" className="nav-mega-foot-sep" />
              <LocaleLink href="/coaches/group" onClick={handlers.onNavigate}>
                {copy.humanGroupLabel}
              </LocaleLink>
              <span aria-hidden="true" className="nav-mega-foot-sep" />
              <LocaleLink href="/courses" onClick={handlers.onNavigate}>
                {copy.humanCoursesLabel}
              </LocaleLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExploreMegaPanel({
  items,
  copy,
  handlers,
}: {
  items: NavItem[];
  copy: MegaNavContent;
  handlers: LinkHandlers;
}) {
  const byId = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="nav-mega-shell">
      <div className="nav-mega-inner nav-mega-explore">
        <aside className="nav-mega-aside">
          <p className="nav-mega-eyebrow">{copy.exploreEyebrow}</p>
          <h3 className="nav-mega-title">{copy.exploreTitle}</h3>
          <p className="nav-mega-body">{copy.exploreBody}</p>
        </aside>

        <div className="nav-mega-explore-cols">
          {copy.exploreGroups.map((group) => {
            const groupItems = group.itemIds
              .map((id) => byId.get(id))
              .filter((item): item is NavItem => Boolean(item));
            if (!groupItems.length) return null;
            return (
              <div key={group.id} className="nav-mega-col">
                <p className="nav-mega-col-label">{group.label}</p>
                <ul className="nav-mega-col-list">
                  {groupItems.map((item) => (
                    <li key={item.id}>
                      <MegaLink
                        item={item}
                        className="nav-mega-col-link"
                        handlers={handlers}
                      >
                        <span className="nav-mega-col-link-label">{item.label}</span>
                      </MegaLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
