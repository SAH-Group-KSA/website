import { defineField, defineType } from "sanity";

export const linkCta = defineType({
  name: "linkCta",
  title: "Link CTA",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
  ],
});

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "object",
  fields: [
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "alt", type: "string" }),
  ],
});

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({ name: "id", type: "string", validation: (r) => r.required() }),
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 4, validation: (r) => r.required() }),
  ],
});

export const faqContent = defineType({
  name: "faqContent",
  title: "FAQ section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "items",
      type: "array",
      of: [{ type: "faqItem" }],
    }),
  ],
});

export const heroProofItem = defineType({
  name: "heroProofItem",
  title: "Hero proof item",
  type: "object",
  fields: [
    defineField({ name: "value", type: "string" }),
    defineField({ name: "label", type: "string" }),
  ],
});

export const heroContent = defineType({
  name: "heroContent",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "titleLines", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "subtitle", type: "string" }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "primaryCta", type: "linkCta" }),
    defineField({ name: "secondaryCta", type: "linkCta" }),
    defineField({ name: "proof", type: "array", of: [{ type: "heroProofItem" }] }),
    defineField({ name: "scrollLabel", type: "string" }),
    defineField({ name: "proofAriaLabel", type: "string" }),
    defineField({ name: "orbitAriaLabel", type: "string" }),
    defineField({ name: "orbitCenterAriaLabel", type: "string" }),
    defineField({ name: "scrollAriaLabel", type: "string" }),
  ],
});

export const promiseStep = defineType({
  name: "promiseStep",
  title: "Promise step",
  type: "object",
  fields: [
    defineField({ name: "id", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "highlight", type: "string" }),
    defineField({ name: "body", type: "text", rows: 3 }),
  ],
});

export const promiseContent = defineType({
  name: "promiseContent",
  title: "Promise",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "titleLines", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({ name: "cta", type: "linkCta" }),
    defineField({ name: "steps", type: "array", of: [{ type: "promiseStep" }] }),
  ],
});

export const metaContent = defineType({
  name: "metaContent",
  title: "Site meta",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "ogTitle", type: "string" }),
    defineField({ name: "ogDescription", type: "text", rows: 3 }),
    defineField({ name: "siteName", type: "string" }),
    defineField({ name: "tagline", type: "string" }),
    defineField({ name: "motto", type: "string" }),
  ],
});

export const navItem = defineType({
  name: "navItem",
  title: "Nav item",
  type: "object",
  fields: [
    defineField({ name: "id", type: "string" }),
    defineField({ name: "label", type: "string" }),
    defineField({ name: "href", type: "string" }),
    defineField({ name: "description", type: "string" }),
    defineField({ name: "entityId", type: "string" }),
    defineField({
      name: "children",
      type: "array",
      of: [{ type: "navItem" }],
    }),
  ],
});

export const ctaContent = defineType({
  name: "ctaContent",
  title: "CTA",
  type: "object",
  fields: [
    defineField({ name: "primary", type: "string" }),
    defineField({ name: "header", type: "string" }),
    defineField({ name: "path", type: "string" }),
    defineField({ name: "contact", type: "string" }),
    defineField({ name: "backToTop", type: "string" }),
  ],
});

export const footerLink = defineType({
  name: "footerLink",
  title: "Footer link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({ name: "href", type: "string" }),
  ],
});

export const footerColumn = defineType({
  name: "footerColumn",
  title: "Footer column",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({
      name: "links",
      type: "array",
      of: [{ type: "footerLink" }],
    }),
  ],
});

export const footerContent = defineType({
  name: "footerContent",
  title: "Footer",
  type: "object",
  fields: [
    defineField({ name: "logoAlt", type: "string" }),
    defineField({ name: "blurb", type: "text", rows: 3 }),
    defineField({ name: "services", type: "footerColumn" }),
    defineField({ name: "explore", type: "footerColumn" }),
    defineField({ name: "connect", type: "footerColumn" }),
    defineField({ name: "emailAddress", type: "string" }),
    defineField({ name: "locationLabel", type: "string" }),
    defineField({ name: "copyright", type: "string" }),
    defineField({ name: "motto", type: "string" }),
  ],
});

export const uiContent = defineType({
  name: "uiContent",
  title: "UI chrome",
  type: "object",
  fields: [
    defineField({ name: "close", type: "string" }),
    defineField({ name: "language", type: "string" }),
    defineField({ name: "menuOpen", type: "string" }),
    defineField({ name: "menuClose", type: "string" }),
    defineField({ name: "skipToContent", type: "string" }),
    defineField({ name: "backToTop", type: "string" }),
    defineField({ name: "backToHome", type: "string" }),
    defineField({
      name: "breadcrumbHome",
      title: "Breadcrumb home label",
      type: "string",
      description: 'Shown in breadcrumbs site-wide (e.g. "Home" / "الرئيسية").',
    }),
    defineField({ name: "primaryNav", type: "string" }),
    defineField({ name: "mobileNav", type: "string" }),
    defineField({ name: "footerNav", type: "string" }),
    defineField({ name: "signIn", type: "string" }),
    defineField({ name: "signOut", type: "string" }),
    defineField({ name: "dashboard", type: "string" }),
    defineField({ name: "myCourses", type: "string" }),
    defineField({ name: "myBookings", type: "string" }),
    defineField({ name: "myProfile", type: "string" }),
    defineField({ name: "editProfile", type: "string" }),
  ],
});

export const megaNavExploreGroup = defineType({
  name: "megaNavExploreGroup",
  title: "Mega nav explore group",
  type: "object",
  fields: [
    defineField({ name: "id", type: "string" }),
    defineField({ name: "label", type: "string" }),
    defineField({ name: "itemIds", type: "array", of: [{ type: "string" }] }),
  ],
});

export const megaNavContent = defineType({
  name: "megaNavContent",
  title: "Mega nav",
  type: "object",
  fields: [
    defineField({ name: "servicesEyebrow", type: "string" }),
    defineField({ name: "servicesTitle", type: "string" }),
    defineField({ name: "servicesBody", type: "text", rows: 3 }),
    defineField({ name: "servicesCtaLabel", type: "string" }),
    defineField({ name: "servicesCtaHref", type: "string" }),
    defineField({ name: "servicesExploreLabel", type: "string" }),
    defineField({ name: "humanStripLabel", type: "string" }),
    defineField({ name: "humanCoachingLabel", type: "string" }),
    defineField({ name: "humanGroupLabel", type: "string" }),
    defineField({ name: "humanCoursesLabel", type: "string" }),
    defineField({ name: "exploreEyebrow", type: "string" }),
    defineField({ name: "exploreTitle", type: "string" }),
    defineField({ name: "exploreBody", type: "text", rows: 3 }),
    defineField({
      name: "exploreGroups",
      type: "array",
      of: [{ type: "megaNavExploreGroup" }],
    }),
  ],
});

export const newsletterContent = defineType({
  name: "newsletterContent",
  title: "Newsletter",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "body", type: "text", rows: 3 }),
    defineField({ name: "firstNameLabel", type: "string" }),
    defineField({ name: "lastNameLabel", type: "string" }),
    defineField({ name: "firstNamePlaceholder", type: "string" }),
    defineField({ name: "lastNamePlaceholder", type: "string" }),
    defineField({ name: "emailLabel", type: "string" }),
    defineField({ name: "placeholder", type: "string" }),
    defineField({ name: "cta", type: "string" }),
    defineField({ name: "success", type: "string" }),
    defineField({ name: "error", type: "string" }),
    defineField({ name: "nameError", type: "string" }),
    defineField({ name: "submitError", type: "string" }),
    defineField({ name: "hint", type: "string" }),
  ],
});

export const entityPageOffering = defineType({
  name: "entityPageOffering",
  title: "Entity offering",
  type: "object",
  fields: [
    defineField({ name: "id", type: "string" }),
    defineField({ name: "href", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "body", type: "text", rows: 3 }),
  ],
});

export const entityPageContent = defineType({
  name: "entityPageContent",
  title: "Company page content",
  type: "object",
  fields: [
    defineField({ name: "hero", type: "heroContent" }),
    defineField({ name: "promise", type: "promiseContent" }),
    defineField({
      name: "offerings",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "items",
          type: "array",
          of: [{ type: "entityPageOffering" }],
        }),
      ],
    }),
    defineField({
      name: "profile",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({ name: "whenLabel", type: "string" }),
        defineField({ name: "audiencesLabel", type: "string" }),
        defineField({ name: "servicesLabel", type: "string" }),
        defineField({ name: "deliverablesLabel", type: "string" }),
        defineField({ name: "outcomesLabel", type: "string" }),
      ],
    }),
    defineField({
      name: "programs",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "journeys",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "title", type: "string" }),
      ],
    }),
    defineField({ name: "faq", type: "faqContent" }),
    defineField({ name: "contactContext", type: "text", rows: 3 }),
  ],
});

export const marketingObjectTypes = [
  linkCta,
  imageWithAlt,
  faqItem,
  faqContent,
  heroProofItem,
  heroContent,
  promiseStep,
  promiseContent,
  metaContent,
  navItem,
  ctaContent,
  footerLink,
  footerColumn,
  footerContent,
  uiContent,
  megaNavExploreGroup,
  megaNavContent,
  newsletterContent,
  entityPageOffering,
  entityPageContent,
];
