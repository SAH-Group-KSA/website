import { defineField, defineType } from "sanity";
import { localeSiblingPublishValidation } from "./documentLocalePair";

export const programDocument = defineType({
  name: "program",
  title: "Program",
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
      name: "programId",
      title: "Program ID",
      type: "string",
      description: "Immutable slug used in URLs — must match both locales.",
      validation: (rule) =>
        rule.required().custom(localeSiblingPublishValidation("programId")),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "entity",
      type: "string",
      options: {
        list: [
          "human",
          "seera",
          "nexus",
          "connect",
          "lego",
          "impact",
          "group",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "audience",
      type: "string",
      options: {
        list: [
          { title: "Individual", value: "individual" },
          { title: "Organization", value: "organization" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "level", type: "number", validation: (r) => r.required() }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "outcome", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "problem", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "format", type: "string", validation: (r) => r.required() }),
    defineField({ name: "duration", type: "string", validation: (r) => r.required() }),
    defineField({ name: "deliverables", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "next", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({
      name: "relatedEntities",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "published", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: {
      title: "title",
      programId: "programId",
      language: "language",
      entity: "entity",
    },
    prepare({ title, programId, language, entity }) {
      return {
        title: title || programId || "Program",
        subtitle: [programId, entity, language].filter(Boolean).join(" · "),
      };
    },
  },
});

export const companyPage = defineType({
  name: "companyPage",
  title: "Company page",
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
      name: "entityId",
      title: "Entity ID",
      type: "string",
      options: {
        list: [
          { title: "SAH Human", value: "human" },
          { title: "SEERA", value: "seera" },
          { title: "SAH Nexus", value: "nexus" },
          { title: "SAH Sponsor", value: "connect" },
          { title: "LEGO by SAH", value: "lego" },
          { title: "SAH Impact", value: "impact" },
        ],
      },
      validation: (rule) =>
        rule.required().custom(localeSiblingPublishValidation("entityId")),
    }),
    defineField({
      name: "studioTitle",
      title: "Studio title",
      type: "string",
      description: "Editor-facing label only.",
    }),
    defineField({
      name: "content",
      title: "Page content",
      type: "entityPageContent",
      validation: (r) => r.required(),
    }),
    defineField({ name: "published", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: {
      entityId: "entityId",
      language: "language",
      studioTitle: "studioTitle",
    },
    prepare({ entityId, language, studioTitle }) {
      return {
        title: studioTitle || entityId || "Company page",
        subtitle: [entityId, language].filter(Boolean).join(" · "),
      };
    },
  },
});
