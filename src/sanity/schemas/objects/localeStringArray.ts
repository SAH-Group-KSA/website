import { defineField, defineType } from "sanity";
import { bothOrNeitherLocaleMessage } from "./localeValidation";

/** Field-level bilingual string lists (topics, credentials). */
export const localeStringArray = defineType({
  name: "localeStringArray",
  title: "Localized string list",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "ar",
      title: "Arabic",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => bothOrNeitherLocaleMessage(value, "stringArray")),
});
