import { defineField, defineType } from "sanity";

export const coach = defineType({
  name: "coach",
  title: "Coach",
  type: "document",
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "booking", title: "Booking & pricing" },
    { name: "publishing", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "profile",
      description:
        "Public URL key (e.g. ahmed-al-rashidi). Immutable after the coach is published.",
      options: { source: "name.en", maxLength: 96 },
      validation: (rule) => rule.required(),
      readOnly: ({ document }) => Boolean(document?.published),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "localeString",
      group: "profile",
    }),
    defineField({
      name: "specialty",
      title: "Specialty",
      type: "localeString",
      group: "profile",
    }),
    defineField({
      name: "bio",
      title: "Short bio (card)",
      type: "localeText",
      group: "profile",
    }),
    defineField({
      name: "fullBio",
      title: "Full bio (profile)",
      type: "localePortableText",
      group: "profile",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      group: "profile",
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
      name: "topics",
      title: "Topics",
      type: "localeStringArray",
      group: "profile",
    }),
    defineField({
      name: "languages",
      title: "Languages",
      type: "array",
      of: [{ type: "string" }],
      group: "profile",
      description: "Locale-independent labels (e.g. Arabic, English).",
    }),
    defineField({
      name: "credentials",
      title: "Credentials",
      type: "localeStringArray",
      group: "profile",
    }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "localeString",
      group: "profile",
    }),
    defineField({
      name: "sessionDuration",
      title: "Session duration",
      type: "string",
      group: "booking",
      description: 'e.g. "50 min"',
    }),
    defineField({
      name: "priceSar",
      title: "Session price (SAR)",
      type: "number",
      group: "booking",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "zohoBookingsServiceId",
      title: "Zoho Bookings service ID",
      type: "string",
      group: "booking",
      description: "Filled in Phase 7 when Bookings goes live.",
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      description: "Unpublished coaches are hidden when FEATURE_CMS is on.",
    }),
  ],
  preview: {
    select: {
      title: "name.en",
      subtitle: "specialty.en",
      media: "photo",
      published: "published",
    },
    prepare({ title, subtitle, media, published }) {
      return {
        title: title || "Untitled coach",
        subtitle: `${published ? "Published" : "Draft"}${subtitle ? ` · ${subtitle}` : ""}`,
        media,
      };
    },
  },
});
