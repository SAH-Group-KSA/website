import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  getContent,
  getProgramById,
  getProgramIds,
} from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProgramDetail } from "@/components/programs/ProgramDetail";
import { ProgramInterestFormClient } from "@/components/programs/ProgramInterestFormClient";
import {
  buildPageMetadata,
  buildBreadcrumbJsonLd,
  buildServiceJsonLd,
} from "@/lib/seo";
import {
  programsSectionHref,
  programsSectionPath,
} from "@/lib/companies";

export async function generateStaticParams() {
  const ids = await getProgramIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const program = await getProgramById(locale as Locale, id);
  if (!program) return {};
  return buildPageMetadata({
    locale: locale as Locale,
    title: program.title,
    description: program.summary,
    path: `/program/${id}`,
    ogTitle: `${program.title} | ${locale === "ar" ? "مجموعة سعة" : "SAH Group"}`,
  });
}

export default async function ProgramDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const program = await getProgramById(locale as Locale, id);
  if (!program) notFound();

  const query = await searchParams;
  const fromRaw = query.from;
  const from = Array.isArray(fromRaw) ? fromRaw[0] : fromRaw;
  const programsHref = programsSectionHref(locale as Locale, from);
  const programsPath = programsSectionPath(from);

  const isAr = locale === "ar";
  const content = await getContent(locale as Locale);
  const labels = content.programsSection;

  return (
    <div id="program-detail-main" className="program-detail-page">
      <JsonLd
        data={buildServiceJsonLd({
          locale: locale as Locale,
          name: program.title,
          description: program.summary,
          path: `/program/${program.id}`,
          serviceType: isAr ? "برنامج" : "Program",
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: isAr ? "الرئيسية" : "Home", path: "/" },
          { name: isAr ? "البرامج" : "Programs", path: programsPath },
          { name: program.title, path: `/program/${program.id}` },
        ])}
      />

      <section className="page-hero page-hero-compact page-hero-media">
        <Container className="page-hero-inner">
          <Breadcrumbs
            crumbs={[
              { label: isAr ? "الرئيسية" : "Home", href: "/" },
              {
                label: isAr ? "البرامج" : "Programs",
                href: programsPath,
              },
              { label: program.title },
            ]}
          />
        </Container>
      </section>

      <section className="section program-detail-section">
        <Container>
          <div className="reveal">
            <ProgramDetail
              program={program}
              labels={labels}
              entities={content.entities}
              entityColors={content.entityColors}
              titleAs="h1"
              action={
                <div className="program-register-card">
                  <h2>
                    {labels.registerTitle ??
                      (isAr ? "سجّل اهتمامك" : "Register your interest")}
                  </h2>
                  <p className="program-register-lead">
                    {labels.registerLead ??
                      (isAr
                        ? "شارك بياناتك وسيتواصل معك فريقنا بخصوص هذا البرنامج."
                        : "Share your details and our team will contact you about this program.")}
                  </p>
                  <ProgramInterestFormClient
                    programId={program.id}
                    programTitle={program.title}
                    locale={locale as Locale}
                    labels={labels}
                    programsHref={programsHref}
                    compact
                  />
                </div>
              }
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
