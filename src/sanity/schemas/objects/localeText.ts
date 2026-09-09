import { defineField, defineType } from "sanity";
import { bothOrNeitherLocaleMessage } from "./localeValidation";

/** Field-level bilingual plain text (e.g. coach card bio). */
export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "ar",
      title: "Arabic",
      type: "text",
      rows: 4,
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => bothOrNeitherLocaleMessage(value, "text")),
});
