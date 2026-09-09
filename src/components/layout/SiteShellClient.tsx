"use client";

import { usePathname } from "@/i18n/routing";
import { isMinimalChromePath } from "@/lib/minimal-chrome";

type Props = {
  children: React.ReactNode;
  marketing: React.ReactNode;
};

/**
 * Hides marketing chrome on auth + dashboard routes.
 * Uses next-intl pathname (locale stripped) so it works after i18n rewrites.
 */
export function SiteShellClient({ children, marketing }: Props) {
  const pathname = usePathname();
  if (isMinimalChromePath(pathname)) {
    return <div className="minimal-chrome">{children}</div>;
  }
  return marketing;
}
