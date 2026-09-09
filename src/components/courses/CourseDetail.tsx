import type { CourseDetail as CourseDetailModel } from "@/domain/course";
import type { CourseProfileCatalogPageContent } from "@/content/types";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type CourseDetailProps = {
  course: CourseDetailModel;
  labels: CourseProfileCatalogPageContent;
  homeLabel: string;
  parentBrand: string;
  parentHref: string;
  hoursLabel: string;
};

export function CourseDetail({
  course,
  labels,
  homeLabel,
  parentBrand,
  parentHref,
  hoursLabel,
}: CourseDetailProps) {
  const modules = course.modulesList;

  return (
    <>
      <section className="page-hero page-hero-media course-detail-hero">
        <Container className="page-hero-inner">
          <Breadcrumbs
            crumbs={[
              { label: homeLabel, href: "/" },
              { label: parentBrand, href: parentHref },
              { label: labels.breadcrumbCourses, href: "/courses" },
              { label: course.title },
            ]}
          />
          <div className="course-detail-hero-grid">
            <div>
              <p className="course-detail-level">{course.level}</p>
              <h1>{course.title}</h1>
              <p className="lead">{course.description}</p>
            </div>
            <div className="course-detail-media">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- Sanity image URL is optimized by its CDN
                <img src={course.thumbnail} alt={course.thumbnailAlt || course.title} />
              ) : (
                <div className="course-detail-media-placeholder" aria-hidden="true">
                  <span>SAH</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="section section-tinted">
        <Container>
          <div className="course-detail-layout">
            <main className="course-detail-main">
              <div className="course-detail-card">
                <h2>{labels.curriculumTitle}</h2>
                <p className="course-detail-intro">{labels.curriculumLead}</p>

                {modules.length > 0 ? (
                  <Accordion
                    className="course-curriculum"
                    items={modules.map((module) => ({
                      id: module.id,
                      question: [module.title, module.duration]
                        .filter(Boolean)
                        .join(" · "),
                      answer: module.isPreview ? (
                        <span className="course-preview-badge">
                          {labels.previewLabel}
                        </span>
                      ) : (
                        <span className="course-module-locked" aria-hidden="true">
                          —
                        </span>
                      ),
                    }))}
                  />
                ) : (
                  <p className="course-curriculum-empty">{labels.emptyCurriculum}</p>
                )}
              </div>
            </main>

            <aside className="course-purchase-sidebar">
              <div className="course-purchase-card">
                <dl className="course-detail-meta-list">
                  <div>
                    <dt>{labels.levelLabel}</dt>
                    <dd>{course.level || "—"}</dd>
                  </div>
                  <div>
                    <dt>{labels.durationLabel}</dt>
                    <dd>
                      {course.durationHours
                        ? `${course.durationHours} ${hoursLabel}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>{labels.modulesLabel}</dt>
                    <dd>{course.modules}</dd>
                  </div>
                  <div>
                    <dt>{labels.priceLabel}</dt>
                    <dd>
                      {course.price.amount} {course.price.currency}
                    </dd>
                  </div>
                </dl>
                <Button variant="gold" className="course-coming-soon" disabled>
                  {labels.comingSoon}
                </Button>
                <p className="course-purchase-note">{labels.purchaseNote}</p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
