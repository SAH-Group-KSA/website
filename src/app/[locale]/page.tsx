import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getContent, getPageSeo } from "@/content";
import type { Locale } from "@/content/types";
import { isLocale } from "@/types/locale";
import { AboutSection } from "@/components/sections/AboutSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { FaqSection } from "@/components/sections/FaqSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { MethodIntroSection } from "@/components/sections/MethodIntroSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { PromiseSection } from "@/components/sections/PromiseSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildOrganizationJsonLd,
  buildFaqJsonLd,
  buildWebSiteJsonLd,
  buildMetadataFromPageSeo,
} from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

import { NeedTeaserSection } from "@/components/sections/NeedTeaserSection";

/** Below-fold interactive client sections — code-split, still SSR for SEO/CLS. */
const EntitiesSection = dynamic(() =>
  import("@/components/sections/EntitiesSection").then((m) => ({
    default: m.EntitiesSection,
  })),
);
const MethodSection = dynamic(() =>
  import("@/components/sections/MethodSection").then((m) => ({
    default: m.MethodSection,
  })),
);
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
const InitiativesSection = dynamic(() =>
  import("@/components/sections/InitiativesSection").then((m) => ({
    default: m.InitiativesSection,
  })),
);
const ContactSection = dynamic(() =>
  import("@/components/sections/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
);

/** Explicit home metadata — same `pages-seo` home record as the locale layout default. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadataFromPageSeo(locale, await getPageSeo(locale, "home"));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const content = await getContent(locale);

  return (
    <>
      <JsonLd
        data={buildOrganizationJsonLd({
          locale,
          name: content.meta.siteName,
          description: content.meta.description,
          email: siteConfig.email,
        })}
      />
      <JsonLd
        data={buildWebSiteJsonLd({
          locale,
          name: content.meta.siteName,
          description: content.meta.description,
        })}
      />
      <JsonLd data={buildFaqJsonLd(content.faq.items)} />
      <HeroSection
        data={content.hero}
        entities={content.entities}
        motto={content.meta.motto}
      />
      <PromiseSection data={content.promise} />
      <NeedTeaserSection data={content.need} />
      <EntitiesSection
        data={content.entitiesSection}
        entities={content.entities}
      />
      <MethodIntroSection data={content.methodIntro} />
      <MethodSection data={content.methodSection} steps={content.methodSteps} />
      <ProgramsSection
        data={content.programsSection}
        programs={content.programs}
        entities={content.entities}
        entityColors={content.entityColors}
        useGroupAccent
      />
      <JourneysSection
        data={content.journeysSection}
        examples={content.journeyExamples}
      />
      <PartnersSection
        data={content.partnersSection}
        partners={content.partners}
      />
      <ImpactSection data={content.impact} />
      <InitiativesSection data={content.initiatives} />
      <AboutSection data={content.about} />
      <CommunitySection data={content.community} />
      <FaqSection data={content.faq} />
      <ContactSection data={content.contact} />
    </>
  );
}
