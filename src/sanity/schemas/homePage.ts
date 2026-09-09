import { defineField, defineType } from "sanity";
import { localeSiblingPublishValidation } from "./documentLocalePair";

const GROUPS = [
  { name: "global", title: "Global chrome (legacy)", default: true },
  { name: "homepage", title: "Homepage sections" },
  { name: "discovery", title: "Discovery page (/discovery)" },
  { name: "community", title: "Community (/community/apply)" },
  { name: "catalog", title: "Catalog pages (coaches & courses)" },
] as const;

export const homePage = defineType({
  name: "homePage",
  title: "Marketing site",
  type: "document",
  groups: [...GROUPS],
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "title",
      title: "Studio title",
      type: "string",
      group: "global",
      description:
        "Editor-facing label only. Create both AR and EN via Translations, then publish both.",
      validation: (rule) =>
        rule.required().custom(localeSiblingPublishValidation()),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      group: "global",
      initialValue: true,
      description:
        "When off, homepage/discovery/community sections fall back to static JSON.",
    }),
    defineField({
      name: "meta",
      title: "Site meta (legacy — use Site settings)",
      type: "metaContent",
      group: "global",
      hidden: true,
    }),
    defineField({
      name: "nav",
      title: "Navigation (legacy — use Site settings)",
      type: "array",
      of: [{ type: "navItem" }],
      group: "global",
      hidden: true,
    }),
    defineField({
      name: "cta",
      title: "CTA (legacy — use Site settings)",
      type: "ctaContent",
      group: "global",
      hidden: true,
    }),
    defineField({
      name: "footer",
      title: "Footer (legacy — use Site settings)",
      type: "footerContent",
      group: "global",
      hidden: true,
    }),
    defineField({
      name: "ui",
      title: "UI chrome (legacy — use Site settings)",
      type: "uiContent",
      group: "global",
      hidden: true,
    }),
    defineField({
      name: "megaNav",
      title: "Mega nav (legacy — use Site settings)",
      type: "megaNavContent",
      group: "global",
      hidden: true,
    }),
    defineField({
      name: "entities",
      title: "Entities (legacy — use Site settings)",
      type: "array",
      of: [{ type: "entityContent" }],
      group: "global",
      hidden: true,
      description: "Entity list used in mega-nav and homepage entity cards.",
    }),
    defineField({
      name: "contact",
      title: "Contact (legacy — use Site settings)",
      type: "contactContent",
      group: "global",
      hidden: true,
      description: "Shared contact form labels (also used on /discovery).",
    }),
    defineField({ name: "hero", title: "Hero", type: "heroContent", group: "homepage" }),
    defineField({
      name: "promise",
      title: "Promise",
      type: "promiseContent",
      group: "homepage",
    }),
    defineField({
      name: "entitiesSection",
      title: "Entities section",
      type: "entitiesSectionContent",
      group: "homepage",
    }),
    defineField({
      name: "methodIntro",
      title: "Method intro",
      type: "methodIntroContent",
      group: "homepage",
    }),
    defineField({
      name: "methodSection",
      title: "Method section",
      type: "methodSectionContent",
      group: "homepage",
    }),
    defineField({
      name: "programsSection",
      title: "Programs section",
      type: "programsSectionContent",
      group: "homepage",
    }),
    defineField({
      name: "journeysSection",
      title: "Journeys section",
      type: "journeysSectionContent",
      group: "homepage",
    }),
    defineField({
      name: "partnersSection",
      title: "Partners section",
      type: "partnersSectionContent",
      group: "homepage",
    }),
    defineField({ name: "impact", title: "Impact", type: "impactContent", group: "homepage" }),
    defineField({
      name: "initiatives",
      title: "Initiatives",
      type: "initiativesContent",
      group: "homepage",
    }),
    defineField({
      name: "newsletter",
      title: "Newsletter",
      type: "newsletterContent",
      group: "homepage",
    }),
    defineField({ name: "about", title: "About", type: "aboutContent", group: "homepage" }),
    defineField({ name: "faq", title: "FAQ", type: "faqContent", group: "homepage" }),
    defineField({
      name: "methodSteps",
      title: "Method steps",
      type: "array",
      of: [{ type: "methodStep" }],
      group: "homepage",
    }),
    defineField({
      name: "journeyExamples",
      title: "Journey examples",
      type: "array",
      of: [{ type: "journeyExample" }],
      group: "homepage",
    }),
    defineField({
      name: "partners",
      title: "Partners",
      type: "array",
      of: [{ type: "partnerContent" }],
      group: "homepage",
    }),
    defineField({
      name: "need",
      title: "Discovery wizard",
      type: "needContent",
      group: "discovery",
      description: "Pathway wizard copy — shared with the homepage #need teaser and /discovery.",
    }),
    defineField({
      name: "journeyChallenges",
      title: "Journey challenges",
      type: "journeyChallengesContent",
      group: "discovery",
    }),
    defineField({
      name: "community",
      title: "Community",
      type: "communityContent",
      group: "community",
      description: "Homepage community section and /community/apply page.",
    }),
    defineField({
      name: "catalogPages",
      title: "Catalog pages",
      type: "catalogPagesContent",
      group: "catalog",
      description: "Copy for /coaches, /coaches/group, /courses, and coach profiles.",
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 3,
      group: "global",
      description: "Not shown on the public site.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
    },
    prepare({ title, language }) {
      return {
        title: title || "Marketing site",
        subtitle: language
          ? `Locale: ${language} · nav, homepage, discovery & community`
          : "Set language via translations",
      };
    },
  },
});
