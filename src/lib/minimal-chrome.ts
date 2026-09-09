/** Routes that use app/auth chrome only — no marketing header/footer. */
export function isMinimalChromePath(pathname: string): boolean {
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return (
    path === "/auth" ||
    path.startsWith("/auth/") ||
    path === "/dashboard" ||
    path.startsWith("/dashboard/")
  );
}
