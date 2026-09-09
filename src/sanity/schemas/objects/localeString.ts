import { defineField, defineType } from "sanity";
import { bothOrNeitherLocaleMessage } from "./localeValidation";

/** Field-level bilingual string — coaches / courses / catalog entities. */
export const localeString = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "string",
    }),
    defineField({
      name: "ar",
      title: "Arabic",
      type: "string",
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => bothOrNeitherLocaleMessage(value, "string")),
});
