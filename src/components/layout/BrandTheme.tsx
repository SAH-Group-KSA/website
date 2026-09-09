"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  normalizeAppPath,
  resolveBrandTheme,
} from "@/lib/brand-themes";

export { resolveBrandTheme } from "@/lib/brand-themes";

/**
 * Syncs `data-theme` on `<html>` after client navigations.
 * First paint is handled by the locale-layout FOUC script.
 */
export function BrandTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const theme = resolveBrandTheme(normalizeAppPath(pathname));
    const root = document.documentElement;
    if (theme === "group") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [pathname]);

  return null;
}
