import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getContent, getCourseBySlug, getCourseSlugs } from "@/content";
import { CourseDetail } from "@/components/courses/CourseDetail";
import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { COURSES_COMING_SOON } from "@/lib/courses-availability";
import { buildBreadcrumbJsonLd, buildCourseJsonLd, buildPageMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/types/locale";

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  if (COURSES_COMING_SOON) {
    const content = await getContent(locale as Locale);
    const page = content.catalogPages!.courses;
    return buildPageMetadata({
      locale: locale as Locale,
      title: page.comingSoon.title,
      description: page.comingSoon.body,
      path: `/courses/${slug}`,
    });
  }

  const course = await getCourseBySlug(locale as Locale, slug);
  if (!course) return {};

  return buildPageMetadata({
    locale: locale as Locale,
    title: course.title,
    description: course.description,
    path: `/courses/${course.slug}`,
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const catalog = content.catalogPages!;
  const homeLabel = breadcrumbHomeLabel(content, locale as Locale);

  if (COURSES_COMING_SOON) {
    const page = catalog.courses;
    return (
      <div id="course-detail-main">
        <JsonLd
          data={buildBreadcrumbJsonLd(locale as Locale, [
            { name: homeLabel, path: "/" },
            {
              name: page.breadcrumbs.parentBrand,
              path: page.breadcrumbs.parentHref,
            },
            { name: page.breadcrumbCurrent, path: "/courses" },
          ])}
        />
        <PageHero
          media
          title={page.title}
          lead={page.lead}
          before={
            <Breadcrumbs
              crumbs={[
                { label: homeLabel, href: "/" },
                {
                  label: page.breadcrumbs.parentBrand,
                  href: page.breadcrumbs.parentHref,
                },
                { label: page.breadcrumbCurrent, href: "/courses" },
              ]}
            />
          }
        />
        <ComingSoonBanner
          title={page.comingSoon.title}
          body={page.comingSoon.body}
        />
      </div>
    );
  }

  const course = await getCourseBySlug(locale as Locale, slug);
  if (!course) notFound();

  const labels = catalog.courseProfile;
  const breadcrumbs = [
    { name: homeLabel, path: "/" },
    {
      name: catalog.courses.breadcrumbs.parentBrand,
      path: catalog.courses.breadcrumbs.parentHref,
    },
    { name: labels.breadcrumbCourses, path: "/courses" },
    { name: course.title, path: `/courses/${course.slug}` },
  ];

  return (
    <div id="course-detail-main">
      <JsonLd
        data={buildCourseJsonLd({
          locale: locale as Locale,
          name: course.title,
          description: course.description,
          slug: course.slug,
        })}
      />
      <JsonLd data={buildBreadcrumbJsonLd(locale as Locale, breadcrumbs)} />
      <CourseDetail
        course={course}
        labels={labels}
        homeLabel={homeLabel}
        parentBrand={catalog.courses.breadcrumbs.parentBrand}
        parentHref={catalog.courses.breadcrumbs.parentHref}
        hoursLabel={catalog.courses.hoursLabel}
      />
    </div>
  );
}
