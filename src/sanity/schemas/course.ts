import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Course document — same locale rules as coach:
 * only slug is required; bilingual fields are optional but both-or-neither
 * (enforced on localeString / localePortableText object types).
 */
export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  groups: [
    { name: "details", title: "Course details", default: true },
    { name: "modules", title: "Modules" },
    { name: "publishing", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "details",
      description:
        "Public URL key. Immutable after the course is published.",
      options: { source: "title.en", maxLength: 96 },
      validation: (rule) => rule.required(),
      readOnly: ({ document }) => Boolean(document?.published),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      group: "details",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localePortableText",
      group: "details",
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "localeString",
      group: "details",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      group: "details",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "localeString",
          title: "Alt text",
        }),
      ],
    }),
    defineField({
      name: "priceSar",
      title: "Price (SAR)",
      type: "number",
      group: "details",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      group: "publishing",
      initialValue: false,
    }),
    defineField({
      name: "modules",
      title: "Modules",
      type: "array",
      group: "modules",
      of: [
        defineArrayMember({
          type: "object",
          name: "courseModule",
          title: "Module",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "localeString",
            }),
            defineField({
              name: "duration",
              title: "Duration",
              type: "string",
              description: 'e.g. "12 min"',
            }),
            defineField({
              name: "isPreview",
              title: "Free preview",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "video",
              title: "Video",
              type: "mux.video",
              description:
                "Uploads to Mux via the Studio plugin. Do not store video files in Sanity.",
            }),
          ],
          preview: {
            select: {
              title: "title.en",
              duration: "duration",
              isPreview: "isPreview",
            },
            prepare({ title, duration, isPreview }) {
              return {
                title: title || "Untitled module",
                subtitle: [duration, isPreview ? "Preview" : null]
                  .filter(Boolean)
                  .join(" · "),
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "level.en",
      media: "thumbnail",
      published: "published",
    },
    prepare({ title, subtitle, media, published }) {
      return {
        title: title || "Untitled course",
        subtitle: `${published ? "Published" : "Draft"}${subtitle ? ` · ${subtitle}` : ""}`,
        media,
      };
    },
  },
});
