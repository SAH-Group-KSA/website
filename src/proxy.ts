import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import {
  homePathFor,
  isUnreadyDashboardPath,
} from "@/lib/dashboard-availability";
import { features } from "@/lib/features";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

const handleI18nRouting = createMiddleware(routing);

/**
 * `/` and `/ar` are owned by next.config redirects/rewrites so we avoid
 * proxy rewrite↔redirect loops. Everything else (e.g. `/en`) goes
 * through next-intl.
 *
 * Next.js 16+: `proxy.ts` replaces the deprecated `middleware.ts` convention.
 *
 * Composition:
 * 1. Locale routing (current)
 * 2. Unready dashboard sections redirect home (kept in codebase, not public yet)
 * 3. Supabase session guards when FEATURE_AUTH:
 *    - `/dashboard/**` requires a session
 *    - guest auth pages redirect signed-in users to the homepage
 * 4. Optional A/B or feature redirects
 */
function isDashboardPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/en/dashboard" ||
    pathname.startsWith("/en/dashboard/")
  );
}

/** Guest-only auth screens. Reset-password stays reachable for recovery sessions. */
function isGuestAuthPath(pathname: string): boolean {
  const paths = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/en/auth/login",
    "/en/auth/register",
    "/en/auth/forgot-password",
  ];
  return paths.includes(pathname);
}

function loginPathFor(pathname: string): string {
  return pathname.startsWith("/en/") || pathname.startsWith("/en")
    ? "/en/auth/login"
    : "/auth/login";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/studio") ||
    pathname.startsWith("/en/studio") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const routedRequest = new NextRequest(request, { headers: requestHeaders });

  const response =
    pathname === "/" || pathname === "/ar" || pathname.startsWith("/ar/")
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : handleI18nRouting(routedRequest);

  if (isUnreadyDashboardPath(pathname)) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = homePathFor(pathname);
    homeUrl.search = "";
    const redirect = NextResponse.redirect(homeUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  if (!features.auth || (!isDashboardPath(pathname) && !isGuestAuthPath(pathname))) {
    return response;
  }

  const supabase = createSupabaseMiddlewareClient(routedRequest, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isDashboardPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPathFor(pathname);
    loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  if (isGuestAuthPath(pathname) && user) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = homePathFor(pathname);
    homeUrl.search = "";
    const redirect = NextResponse.redirect(homeUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*", "/((?!_next|_vercel|studio|api|.*\\..*).*)"],
};
