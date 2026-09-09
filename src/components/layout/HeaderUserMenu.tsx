"use client";

import { useEffect, useRef, useState } from "react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
  email: string;
  dashboardLabel: string;
  signOutLabel: string;
  inverted?: boolean;
  onSignOut: () => void;
  onNavigate?: () => void;
  className?: string;
  variant?: "desktop" | "mobile";
};

function userInitial(displayName: string, email: string): string {
  const source = displayName.trim() || email.trim();
  return source.charAt(0).toUpperCase() || "?";
}

function userLabel(displayName: string, email: string): string {
  if (displayName.trim()) return displayName.trim();
  if (email) return email.split("@")[0] ?? email;
  return "Account";
}

export function HeaderUserMenu({
  displayName,
  email,
  dashboardLabel,
  signOutLabel,
  inverted = false,
  onSignOut,
  onNavigate,
  className,
  variant = "desktop",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = "header-user-menu-panel";
  const initial = userInitial(displayName, email);
  const label = userLabel(displayName, email);

  useEffect(() => {
    if (variant !== "desktop") return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [variant]);

  useEffect(() => {
    if (!open || variant !== "desktop") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, variant]);

  if (variant === "mobile") {
    return (
      <div className={cn("header-user-menu header-user-menu-mobile", className)}>
        <div className="header-user-menu-meta">
          <span className="header-user-avatar" aria-hidden="true">
            {initial}
          </span>
          <div>
            <strong>{label}</strong>
            {email ? <small>{email}</small> : null}
          </div>
        </div>
        <LocaleLink
          href="/dashboard/profile"
          className="mobile-menu-signin"
          onClick={() => onNavigate?.()}
        >
          {dashboardLabel}
        </LocaleLink>
        <button
          type="button"
          className="mobile-menu-signin"
          onClick={() => onSignOut()}
        >
          {signOutLabel}
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("header-user-menu", open && "is-open", className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "header-user-menu-trigger",
          inverted ? "is-inverted" : "is-ink",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="header-user-avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="header-user-label">{label}</span>
        <svg
          className="header-user-chevron"
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
        <div id={panelId} className="header-user-menu-panel" role="menu">
          <div className="header-user-menu-meta">
            <span className="header-user-avatar" aria-hidden="true">
              {initial}
            </span>
            <div>
              <strong>{label}</strong>
              {email ? <small>{email}</small> : null}
            </div>
          </div>
          <LocaleLink
            href="/dashboard/profile"
            className="header-user-menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            {dashboardLabel}
          </LocaleLink>
          <button
            type="button"
            className="header-user-menu-item header-user-menu-item-danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            {signOutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
