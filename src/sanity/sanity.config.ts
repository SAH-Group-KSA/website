import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { documentInternationalization } from "@sanity/document-internationalization";
import { muxInput } from "sanity-plugin-mux-input";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

/**
 * Embedded Sanity Studio config.
 * Mux plugin options match Phase 9 defaults (signed uploads configured in Studio UI).
 */
export default defineConfig({
  name: "sah",
  title: `SAH Studio (${dataset})`,
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    muxInput({
      video_quality: "plus",
      max_resolution_tier: "1080p",
    }),
    documentInternationalization({
      supportedLanguages: [
        { id: "ar", title: "Arabic" },
        { id: "en", title: "English" },
      ],
      schemaTypes: ["homePage", "siteSettings", "pageSeo", "companyPage", "program"],
      languageField: "language",
      metadataOmnisearchVisibility: false,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
