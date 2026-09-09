import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo, getCourses } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { COURSES_COMING_SOON } from "@/lib/courses-availability";
import { Button } from "@/components/ui/Button";
import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { Container } from "@/components/ui/Container";
import { ListingCard } from "@/components/ui/ListingCard";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  buildMetadataFromPageSeo,
  buildItemListJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(
    locale as Locale,
    await getPageSeo(locale as Locale, "courses"),
  );
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const page = content.catalogPages!.courses;
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);
  const courses = COURSES_COMING_SOON ? [] : await getCourses(locale as Locale);

  return (
    <div id="courses-main">
      {!COURSES_COMING_SOON ? (
        <JsonLd
          data={buildItemListJsonLd(
            locale as Locale,
            courses.map((c) => ({
              name: c.title,
              description: c.description,
              url: `/courses/${c.slug}`,
            })),
          )}
        />
      ) : null}
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          { name: page.breadcrumbs.parentBrand, path: page.breadcrumbs.parentHref },
          { name: page.breadcrumbCurrent, path: "/courses" },
        ])}
      />
      <PageHero
        media
        before={
          <Breadcrumbs
            crumbs={[
              { label: homeCrumb, href: "/" },
              { label: page.breadcrumbs.parentBrand, href: page.breadcrumbs.parentHref },
              { label: page.breadcrumbCurrent },
            ]}
          />
        }
        title={page.title}
        lead={page.lead}
      />

      {COURSES_COMING_SOON ? (
        <ComingSoonBanner
          title={page.comingSoon.title}
          body={page.comingSoon.body}
        />
      ) : (
        <Section tone="tinted">
          <Container>
            <div className="dev-notice dev-notice-md reveal">
              <strong>🔌 {page.devNotice.label}:</strong> {page.devNotice.body}
            </div>

            <div className="courses-grid reveal" data-delay="80">
              {courses.map((course) => (
                <ListingCard
                  key={course.slug}
                  kind="course"
                  href={`/courses/${course.slug}`}
                  media={
                    course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element -- listing thumb
                      <img
                        src={course.thumbnail}
                        alt={course.thumbnailAlt || course.title}
                      />
                    ) : (
                      <div className="course-thumb-placeholder" aria-hidden="true">
                        🎬
                      </div>
                    )
                  }
                  mediaBadge={<span className="course-badge">{course.level}</span>}
                  footer={
                    <>
                      <span className="course-price">
                        {course.price.amount} <small>{course.price.currency}</small>
                      </span>
                      <Button href={`/courses/${course.slug}`} variant="gold" size="sm">
                        {page.viewCourse}
                      </Button>
                    </>
                  }
                >
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  <div className="course-meta">
                    <span>
                      📚 {course.modules} {page.lessonsLabel}
                    </span>
                    <span>
                      ⏱ {course.durationHours} {page.hoursLabel}
                    </span>
                  </div>
                </ListingCard>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </div>
  );
}
