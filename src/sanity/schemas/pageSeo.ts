import { defineField, defineType } from "sanity";
import { localeSiblingPublishValidation } from "./documentLocalePair";

const PAGE_KEYS = [
  "home",
  "discovery",
  "sahHuman",
  "seera",
  "sahNexus",
  "sahSponsor",
  "legoBySah",
  "sahImpact",
  "coaches",
  "coachesGroup",
  "courses",
  "communityApply",
  "authLogin",
  "authRegister",
  "authForgotPassword",
  "dashboard",
  "dashboardCourses",
  "dashboardBookings",
  "dashboardProfile",
  "notFound",
] as const;

export const pageSeo = defineType({
  name: "pageSeo",
  title: "Page SEO",
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
      name: "pageKey",
      title: "Page key",
      type: "string",
      description:
        "Must match a PageSeoKey in the app. Create both AR and EN via Translations, then publish both.",
      options: {
        list: PAGE_KEYS.map((value) => ({ title: value, value })),
        layout: "dropdown",
      },
      validation: (rule) =>
        rule.required().custom(localeSiblingPublishValidation("pageKey")),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "path",
      title: "Path",
      type: "string",
      description: "Locale-agnostic path, e.g. /coaches or /",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ogTitle",
      title: "OG title",
      type: "string",
    }),
    defineField({
      name: "ogDescription",
      title: "OG description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "OG image",
      type: "imageWithAlt",
    }),
    defineField({
      name: "absoluteTitle",
      title: "Absolute title",
      type: "boolean",
      description: "Skip the root title template (home brand titles).",
      initialValue: false,
    }),
    defineField({
      name: "robots",
      title: "Robots",
      type: "string",
      options: {
        list: [
          { title: "Index", value: "index" },
          { title: "No index", value: "noindex" },
        ],
        layout: "radio",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      pageKey: "pageKey",
      language: "language",
    },
    prepare({ title, pageKey, language }) {
      return {
        title: title || pageKey || "Page SEO",
        subtitle: [pageKey, language].filter(Boolean).join(" · "),
      };
    },
  },
});
