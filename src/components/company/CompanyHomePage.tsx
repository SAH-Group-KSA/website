import dynamic from "next/dynamic";
import type { Entity, EntityPageContent, SiteContent } from "@/content/types";
import type { Locale } from "@/types/locale";
import { PromiseSection } from "@/components/sections/PromiseSection";
import { NeedTeaserSection } from "@/components/sections/NeedTeaserSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CompanyHero } from "@/components/company/CompanyHero";
import { CompanyOfferings } from "@/components/company/CompanyOfferings";
import { CompanyProfile } from "@/components/company/CompanyProfile";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo";
import { siteConfig } from "@/lib/constants";
import type { CompanyRoute } from "@/lib/companies";

const ProgramsSection = dynamic(() =>
  import("@/components/sections/ProgramsSection").then((m) => ({
    default: m.ProgramsSection,
  })),
);
const JourneysSection = dynamic(() =>
  import("@/components/sections/JourneysSection").then((m) => ({
    default: m.JourneysSection,
  })),
);
const ContactSection = dynamic(() =>
  import("@/components/sections/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
);

type Props = {
  locale: Locale;
  route: CompanyRoute;
  content: SiteContent;
  page: EntityPageContent;
  entity: Entity;
};

/** Shared company homepage composition (Human, SEERA, Nexus, …). */
export function CompanyHomePage({
  locale,
  route,
  content,
  page,
  entity,
}: Props) {
  const entityPrograms = content.programs.filter((p) => p.entity === entity.id);
  const programsSectionData = {
    ...content.programsSection,
    eyebrow: page.programs.eyebrow,
    title: page.programs.title,
    intro: page.programs.intro,
  };
  const journeysSectionData = {
    ...content.journeysSection,
    eyebrow: page.journeys.eyebrow,
    title: page.journeys.title,
  };
  const contactData = {
    ...content.contact,
    defaultContext: page.contactContext,
  };
  const path = `/${route.slug}`;

  return (
    <div
      id={`${route.slug}-main`}
      className="entity-home"
      data-entity={entity.id}
    >
      <JsonLd
        data={buildOrganizationJsonLd({
          locale,
          name: entity.name,
          description: entity.tagline,
          email: siteConfig.email,
          path,
          logo: entity.logo,
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: locale === "ar" ? "الرئيسية" : "Home", path: "/" },
          { name: entity.name, path },
        ])}
      />
      <JsonLd
        data={buildItemListJsonLd(
          locale,
          page.offerings.items.map((offer) => ({
            name: offer.title,
            description: offer.body,
            url: offer.href.startsWith("#") ? `${path}${offer.href}` : offer.href,
          })),
        )}
      />
      <JsonLd data={buildFaqJsonLd(page.faq.items)} />

      <CompanyHero
        data={page.hero}
        entity={entity}
        offerings={page.offerings.items}
      />
      <PromiseSection data={page.promise} />
      <CompanyOfferings data={page.offerings} entityColor={entity.color} />
      <CompanyProfile data={page.profile} entity={entity} />
      <NeedTeaserSection data={content.need} />
      <ProgramsSection
        data={programsSectionData}
        programs={entityPrograms}
        entities={[entity]}
        entityColors={content.entityColors}
        hideEntityFilter
      />
      <JourneysSection
        data={journeysSectionData}
        examples={content.journeyExamples}
      />
      <FaqSection data={page.faq} />
      <ContactSection data={contactData} />
    </div>
  );
}
