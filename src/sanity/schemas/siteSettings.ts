import { defineField, defineType } from "sanity";
import { localeSiblingPublishValidation } from "./documentLocalePair";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
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
      description:
        "Editor-facing label only. Create both AR and EN via Translations, then publish both.",
      validation: (rule) =>
        rule.required().custom(localeSiblingPublishValidation()),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
      description: "When off, global chrome falls back to static JSON.",
    }),
    defineField({ name: "meta", title: "Site meta", type: "metaContent" }),
    defineField({
      name: "nav",
      title: "Navigation",
      type: "array",
      of: [{ type: "navItem" }],
    }),
    defineField({ name: "cta", title: "CTA", type: "ctaContent" }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "footerContent",
    }),
    defineField({ name: "ui", title: "UI chrome", type: "uiContent" }),
    defineField({
      name: "megaNav",
      title: "Mega nav",
      type: "megaNavContent",
    }),
    defineField({
      name: "entities",
      title: "Entities",
      type: "array",
      of: [{ type: "entityContent" }],
      description: "Entity list used in mega-nav and homepage entity cards.",
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "contactContent",
      description: "Shared contact form labels (also used on /discovery).",
    }),
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
    },
    prepare({ title, language }) {
      return {
        title: title || "Site settings",
        subtitle: language
          ? `Locale: ${language} · nav, footer, mega menu`
          : "Set language via translations",
      };
    },
  },
});
