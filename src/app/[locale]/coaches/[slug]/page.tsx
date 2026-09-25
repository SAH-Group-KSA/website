import type { Metadata } from "next";
import { cache } from "react";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getCoachBySlug, getCoachSlugs } from "@/content";
import { isLocale, type Locale } from "@/types/locale";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ComingSoonBanner } from "@/components/ui/ComingSoonBanner";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata, buildPersonJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { breadcrumbHomeLabel } from "@/lib/content-labels";
import { COACHES_COMING_SOON } from "@/lib/coaches-availability";
import { features } from "@/lib/features";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Deduped for the lifetime of one request: both `generateMetadata` and the page
 * body need the slug list, and under FEATURE_CMS each call is a Sanity fetch.
 */
const coachSlugs = cache(getCoachSlugs);

/**
 * Is this a real coach slug, or an invented URL?
 *
 * An empty list means the catalog source is unavailable — a Sanity outage or an
 * unseeded dataset — not that every coach was deleted. Treat that as
 * "unknown" and let the placeholder render, so a CMS hiccup can never 404 the
 * whole /coaches tree at once.
 */
async function isKnownCoachSlug(slug: string): Promise<boolean> {
  const slugs = await coachSlugs();
  return slugs.length === 0 || slugs.includes(slug);
}

export async function generateStaticParams() {
  const slugs = await getCoachSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  if (COACHES_COMING_SOON) {
    // Unknown slug → no metadata, so the locale layout's 404 record applies.
    if (!(await isKnownCoachSlug(slug))) return {};
    const content = await getContent(locale as Locale);
    const page = content.catalogPages!.coaches;
    return buildPageMetadata({
      locale: locale as Locale,
      title: page.comingSoon.title,
      description: page.comingSoon.body,
      path: `/coaches/${slug}`,
      // Every coach slug renders the same "coming soon" placeholder while the
      // catalog is gated, so these are thin duplicates — keep them out of the
      // index until real profiles ship.
      noIndex: true,
    });
  }
  const coach = await getCoachBySlug(locale as Locale, slug);
  if (!coach) return {};
  return buildPageMetadata({
    locale: locale as Locale,
    title: coach.name,
    description: coach.bio,
    path: `/coaches/${slug}`,
    ogTitle: `${coach.name} | ${locale === "ar" ? "مجموعة سعة" : "SAH Group"}`,
  });
}

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale as Locale);

  const content = await getContent(locale as Locale);
  const coachesPage = content.catalogPages!.coaches;
  const homeCrumb = breadcrumbHomeLabel(content, locale as Locale);

  if (COACHES_COMING_SOON) {
    // Only real coach slugs resolve; anything else is a 404 rather than another
    // copy of the placeholder.
    if (!(await isKnownCoachSlug(slug))) notFound();
    return (
      <div id="coach-profile-main">
        <JsonLd
          data={buildBreadcrumbJsonLd(locale as Locale, [
            { name: homeCrumb, path: "/" },
            { name: coachesPage.breadcrumbCurrent, path: "/coaches" },
          ])}
        />
        <PageHero
          media
          title={coachesPage.title}
          lead={coachesPage.lead}
          before={
            <Breadcrumbs
              crumbs={[
                { label: homeCrumb, href: "/" },
                { label: coachesPage.breadcrumbCurrent, href: "/coaches" },
              ]}
            />
          }
        />
        <ComingSoonBanner
          title={coachesPage.comingSoon.title}
          body={coachesPage.comingSoon.body}
        />
        <span data-sitename={content.meta.siteName} className="visually-hidden" />
      </div>
    );
  }

  const coach = await getCoachBySlug(locale as Locale, slug);
  if (!coach) notFound();

  const isAr = locale === "ar";
  const labels = content.catalogPages!.coachProfile;

  let isAuthenticated = false;
  if (features.auth) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = Boolean(user);
    } catch (error) {
      console.error("[auth] Coach profile session lookup failed:", error);
    }
  }

  const name = coach.name;
  const specialty = coach.specialty;
  const fullBio = coach.fullBio ?? coach.bio;
  const topics = coach.topics;
  const credentials = coach.credentials ?? [];
  const languages = coach.languages ?? [];

  return (
    <div id="coach-profile-main">
      <JsonLd
        data={buildPersonJsonLd({
          locale: locale as Locale,
          name: name,
          description: fullBio,
          slug: coach.slug,
          jobTitle: specialty,
          image: coach.photo || undefined,
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale as Locale, [
          { name: homeCrumb, path: "/" },
          { name: labels.breadcrumbCoaches, path: "/coaches" },
          { name: name, path: `/coaches/${coach.slug}` },
        ])}
      />
      {/* Page hero */}
      <section className="page-hero page-hero-media">
        <Container className="page-hero-inner">
          <Breadcrumbs
            crumbs={[
              { label: homeCrumb, href: "/" },
              { label: labels.breadcrumbCoaches, href: "/coaches" },
              { label: name },
            ]}
          />
          <h1>{name}</h1>
          <p className="lead">{specialty}</p>
        </Container>
      </section>

      <section className="section section-tinted">
        <Container>
          {/* Placeholder notice */}
          <div className="dev-notice dev-notice-lg">
            <strong>🔌 {isAr ? "ملاحظة" : "Note"}:</strong>{" "}
            {isAr
              ? "بيانات هذا المدرب مؤقتة. ستُستبدل بمحتوى CMS عند ربط سانِتي، مع Zoho Bookings للحجوزات. الدفع عبر Moyasar أو Tamara بعد اختيار الموعد."
              : "This coach's data is placeholder. It will be replaced by CMS content once Sanity is integrated, with Zoho Bookings handling scheduling. Payment via Moyasar or Tamara after slot selection."}
          </div>

          <div className="coach-profile-layout">
            {/* Sidebar */}
            <aside className="coach-sidebar">
              <div className="coach-profile-card">
                {/* Avatar */}
                <div className="coach-avatar">
                  {coach.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CSS expects .coach-avatar img
                    <img src={coach.photo} alt={name} />
                  ) : (
                    <div className="coach-avatar-placeholder" aria-hidden="true">
                      👤
                    </div>
                  )}
                </div>

                <p className="coach-sidebar-name mb-1 text-deep">{name}</p>
                <p className="mb-4 text-small text-muted">{specialty}</p>

                {/* Rating */}
                <div className="coach-rating mb-4">
                  <strong>★ {coach.rating}</strong>
                  <span>({coach.reviewCount} {labels.reviewsLabel})</span>
                </div>

                {/* Meta */}
                <div className="coach-meta-list">
                  <div className="coach-meta-item">
                    <strong>{labels.experienceLabel}</strong>
                    <span>{coach.experience ?? "—"}</span>
                  </div>
                  <div className="coach-meta-item">
                    <strong>{labels.languagesLabel}</strong>
                    <span>{languages.join("، ")}</span>
                  </div>
                  <div className="coach-meta-item">
                    <strong>{labels.sessionLabel}</strong>
                    <span>{coach.sessionDuration}</span>
                  </div>
                  <div className="coach-meta-item">
                    <strong>{labels.priceLabel}</strong>
                    <span className="font-bold text-deep">
                      {coach.price.amount} {coach.price.currency}/
                      {labels.sessionSuffix}
                    </span>
                  </div>
                </div>

                {/* Topics */}
                <div className="coach-topics">
                  {topics.map((t) => (
                    <span key={t} className="coach-topic-tag">{t}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-5 grid gap-3">
                  <Button variant="gold" href="#book-session">
                    {labels.bookSession}
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="coach-main">
              {/* About */}
              <div className="coach-section-card">
                <h2>{labels.aboutTitle}</h2>
                <p className="text-muted leading-loose">{fullBio}</p>

                <h4 className="mb-3 mt-5 text-deep">
                  {labels.credentialsTitle}
                </h4>
                <ul className="output-list">
                  {credentials.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>

              {/* Book a session */}
              <div className="coach-section-card" id="book-session">
                <h2>{labels.bookSectionTitle}</h2>
                <p className="mb-5 text-small text-muted">
                  {labels.bookSectionLead}
                </p>

                {!isAuthenticated ? (
                  <div className="booking-auth-gate">
                    <p className="booking-auth-gate-hint">{labels.authHint}</p>
                    <div className="booking-auth-actions">
                      <Button href="/auth/login" variant="primary">
                        {labels.signIn}
                      </Button>
                      <Button href="/auth/register" variant="outline-dark">
                        {labels.createAccount}
                      </Button>
                    </div>
                    <p className="booking-auth-gate-sub">{labels.authSub}</p>
                  </div>
                ) : null}

                {/* Placeholder slots (disabled until Zoho Bookings is wired) */}
                <div className="booking-slot-grid is-disabled-block">
                  {[
                    { en: "Mon 28 Jul · 10:00", ar: "الاثنين 28 يوليو · 10:00" },
                    { en: "Mon 28 Jul · 14:00", ar: "الاثنين 28 يوليو · 14:00" },
                    { en: "Tue 29 Jul · 11:00", ar: "الثلاثاء 29 يوليو · 11:00" },
                    { en: "Tue 29 Jul · 16:00", ar: "الثلاثاء 29 يوليو · 16:00" },
                    { en: "Wed 30 Jul · 09:00", ar: "الأربعاء 30 يوليو · 09:00" },
                    { en: "Wed 30 Jul · 15:00", ar: "الأربعاء 30 يوليو · 15:00" },
                  ].map((slot, i) => (
                    <button key={i} type="button" className="booking-slot" disabled>
                      {isAr ? slot.ar : slot.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="coach-section-card">
                <h2>{labels.reviewsTitle}</h2>
                <div className="review-list">
                  {(coach.reviews ?? []).map((r, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{r.author}</span>
                        <span className="review-stars">{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="review-body">{r.body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-small text-muted">
                  {labels.reviewsFootnote}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Suppress unused import */}
      <span data-sitename={content.meta.siteName} className="visually-hidden" />
    </div>
  );
}
