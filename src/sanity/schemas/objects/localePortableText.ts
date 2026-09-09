import { defineArrayMember, defineField, defineType } from "sanity";
import { bothOrNeitherLocaleMessage } from "./localeValidation";

const portableTextBlocks = [
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "H2", value: "h2" },
      { title: "H3", value: "h3" },
    ],
    lists: [
      { title: "Bullet", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      decorators: [
        { title: "Strong", value: "strong" },
        { title: "Emphasis", value: "em" },
      ],
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            defineField({
              name: "href",
              type: "url",
              title: "URL",
              validation: (rule) =>
                rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
            }),
          ],
        },
      ],
    },
  }),
];

/** Field-level bilingual portable text (full bio, course description). */
export const localePortableText = defineType({
  name: "localePortableText",
  title: "Localized rich text",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "array",
      of: portableTextBlocks,
    }),
    defineField({
      name: "ar",
      title: "Arabic",
      type: "array",
      of: portableTextBlocks,
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => bothOrNeitherLocaleMessage(value, "portableText")),
});
