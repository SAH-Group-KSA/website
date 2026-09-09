import { getLocale } from "next-intl/server";
import { getContent } from "@/content";
import type { Locale } from "@/types/locale";

export async function SkipLink() {
  const locale = (await getLocale()) as Locale;
  const { ui } = await getContent(locale);

  return (
    <a href="#main" className="skip-link">
      {ui.skipToContent}
    </a>
  );
}
