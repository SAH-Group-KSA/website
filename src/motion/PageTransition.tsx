"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Soft enter animation on route change via CSS (not Motion `initial`).
 *
 * Avoids hydration mismatches from Motion injecting opacity:0 inline styles
 * that differ from the SSR HTML. Prefers-reduced-motion is handled in CSS.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition page-transition-enter">
      {children}
    </div>
  );
}
