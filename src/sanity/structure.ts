import type { StructureResolver } from "sanity/structure";

const LISTED_TYPES = new Set([
  "homePage",
  "siteSettings",
  "pageSeo",
  "companyPage",
  "program",
  "coach",
  "course",
]);

/** System types managed by plugins — not for direct desk editing. */
const HIDDEN_TYPES = new Set(["translation.metadata"]);

/**
 * Studio navigation — groups marketing content for editors without splitting documents.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .child(
          S.documentTypeList("siteSettings")
            .title("Site settings")
            .defaultOrdering([{ field: "language", direction: "asc" }]),
        ),
      S.listItem()
        .title("Marketing site")
        .child(
          S.documentTypeList("homePage")
            .title("Marketing site")
            .defaultOrdering([{ field: "language", direction: "asc" }]),
        ),
      S.listItem()
        .title("Page SEO")
        .child(
          S.documentTypeList("pageSeo")
            .title("Page SEO")
            .defaultOrdering([{ field: "pageKey", direction: "asc" }]),
        ),
      S.listItem()
        .title("Company pages")
        .child(
          S.documentTypeList("companyPage")
            .title("Company pages")
            .defaultOrdering([{ field: "entityId", direction: "asc" }]),
        ),
      S.listItem()
        .title("Programs")
        .child(
          S.documentTypeList("program")
            .title("Programs")
            .defaultOrdering([{ field: "programId", direction: "asc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Coaches")
        .child(S.documentTypeList("coach").title("Coaches")),
      S.listItem()
        .title("Courses")
        .child(S.documentTypeList("course").title("Courses")),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? "";
        return !LISTED_TYPES.has(id) && !HIDDEN_TYPES.has(id);
      }),
    ]);
