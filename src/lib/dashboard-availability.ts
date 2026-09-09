/**
 * Dashboard sections that exist in the codebase but are not ready for users yet.
 * Keep routes/pages; hide nav and redirect visitors away.
 */

const UNREADY_EXACT = new Set([
  "/dashboard",
  "/dashboard/courses",
  "/dashboard/bookings",
]);

const UNREADY_PREFIXES = ["/dashboard/courses/", "/dashboard/bookings/"] as const;

/** Strip optional `/en` locale prefix for path checks. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname;
}

export function isUnreadyDashboardPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname).replace(/\/$/, "") || "/";
  if (UNREADY_EXACT.has(path)) return true;
  return UNREADY_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function homePathFor(pathname: string): string {
  return pathname.startsWith("/en/") || pathname === "/en" ? "/en" : "/";
}

/** Post-auth destination: allow ready deep links; otherwise homepage. */
export function postAuthDestination(
  requested: string | null,
  localePathname = "/",
): string {
  if (!requested) return homePathFor(localePathname);

  const normalized = requested.startsWith("/") ? requested : `/${requested}`;
  if (normalized.includes("auth/reset-password")) return normalized;
  if (isUnreadyDashboardPath(normalized)) return homePathFor(normalized);

  const bare = stripLocalePrefix(normalized);
  if (bare === "/dashboard/profile" || bare.startsWith("/dashboard/profile/")) {
    return normalized;
  }

  return homePathFor(normalized);
}
