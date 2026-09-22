"use client";

import { track } from "@/adapters/analytics/track";

/**
 * A `mailto:` link that reports a `cta_click`.
 *
 * With WhatsApp and phone links absent from the site, the two email links are
 * the only direct contact-intent signal, so they are worth measuring.
 *
 * A client component because `SiteFooter` is a server component and cannot
 * carry an onClick. `track()` no-ops entirely when the visitor declined
 * cookies (no vendor global exists), so no consent check is needed here.
 */
export function TrackedMailtoLink({
  email,
  id,
  className,
  children,
}: {
  email: string;
  /** Distinguishes which email link was clicked, e.g. "footer-email". */
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const href = `mailto:${email}`;
  return (
    <a href={href} className={className} onClick={() => track("cta_click", { id, href })}>
      {children}
    </a>
  );
}
