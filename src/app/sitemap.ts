import type { MetadataRoute } from "next";
import { getCoachSlugs, getCourseSlugs, getProgramIds } from "@/content";
import { COMPANY_ROUTES } from "@/lib/companies";
import { COACHES_COMING_SOON } from "@/lib/coaches-availability";
import { COURSES_COMING_SOON } from "@/lib/courses-availability";
import { PUBLIC_SITEMAP_PATHS, canonicalUrl, hreflangLanguages } from "@/lib/seo";
import { locales } from "@/types/locale";

const COMPANY_PATHS = new Set(COMPANY_ROUTES.map((route) => `/${route.slug}`));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [coachSlugs, courseSlugs, programIds] = await Promise.all([
    getCoachSlugs(),
    getCourseSlugs(),
    getProgramIds(),
  ]);

  // While a catalog is gated, every detail page is the same `noindex`
  // placeholder — submitting those URLs would only earn "Submitted URL marked
  // noindex" in Search Console. The listing pages stay in the sitemap.
  const paths = [
    ...PUBLIC_SITEMAP_PATHS,
    ...(COACHES_COMING_SOON ? [] : coachSlugs.map((slug) => `/coaches/${slug}`)),
    ...(COURSES_COMING_SOON ? [] : courseSlugs.map((slug) => `/courses/${slug}`)),
    ...programIds.map((id) => `/program/${id}`),
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => {
      const url = canonicalUrl(locale, path);
      return {
        url,
        lastModified,
        changeFrequency: "weekly" as const,
        priority:
          path === ""
            ? locale === "ar"
              ? 1.0
              : 0.9
            : path.startsWith("/coaches") ||
                path.startsWith("/courses") ||
                path.startsWith("/program") ||
                COMPANY_PATHS.has(path)
              ? 0.8
              : 0.7,
        alternates: {
          languages: hreflangLanguages(path),
        },
      };
    }),
  );
}
