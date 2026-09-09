/**
 * Require a matching AR/EN sibling when a document-level locale doc is published
 * (homePage, pageSeo, companyPage, program via @sanity/document-internationalization).
 */

type LocaleDoc = {
  _id?: string;
  _type?: string;
  language?: string;
  pageKey?: string;
  entityId?: string;
  programId?: string;
};

type ValidationContext = {
  document?: unknown;
  getClient: (opts: { apiVersion: string }) => {
    fetch: <T = unknown>(
      query: string,
      params?: Record<string, unknown>,
    ) => Promise<T>;
  };
};

function publishedId(id: string | undefined): string | null {
  if (!id) return null;
  return id.replace(/^drafts\./, "");
}

function otherLanguage(language: string): "ar" | "en" | null {
  if (language === "ar") return "en";
  if (language === "en") return "ar";
  return null;
}

async function siblingFromTranslationMetadata(
  client: ValidationContext["getClient"] extends (...args: infer _) => infer R
    ? R
    : never,
  docId: string,
  otherLang: "ar" | "en",
): Promise<string | null> {
  return client.fetch<string | null>(
    `*[_type == "translation.metadata" && references($docId)][0].translations[language == $otherLang][0].value._ref`,
    { docId, otherLang },
  );
}

async function requirePublishedSibling(
  client: ValidationContext["getClient"] extends (...args: infer _) => infer R
    ? R
    : never,
  options: {
    docId: string;
    otherLang: "ar" | "en";
    otherLabel: string;
    fallbackFilter: string;
    fallbackParams: Record<string, unknown>;
  },
): Promise<true | string> {
  const linkedSiblingId = await siblingFromTranslationMetadata(
    client,
    options.docId,
    options.otherLang,
  );

  const anyQuery = linkedSiblingId
    ? `*[_id == $siblingId || _id == $siblingDraftId][0]._id`
    : `*[${options.fallbackFilter}][0]._id`;

  const publishedQuery = linkedSiblingId
    ? `*[_id == $siblingId][0]._id`
    : `*[${options.fallbackFilter} && !(_id in path("drafts.**"))][0]._id`;

  const anyParams = linkedSiblingId
    ? {
        siblingId: linkedSiblingId,
        siblingDraftId: `drafts.${linkedSiblingId}`,
      }
    : options.fallbackParams;

  const publishedParams = linkedSiblingId
    ? { siblingId: linkedSiblingId }
    : options.fallbackParams;

  const siblingAnyId = await client.fetch<string | null>(anyQuery, anyParams);
  const siblingPublishedId = await client.fetch<string | null>(
    publishedQuery,
    publishedParams,
  );

  if (!siblingAnyId) {
    return `Create a matching ${options.otherLabel} translation (Translations), then publish it.`;
  }
  if (!siblingPublishedId) {
    return `Publish the matching ${options.otherLabel} translation as well. A published locale requires both AR and EN to be published.`;
  }
  return true;
}

export function localeSiblingPublishValidation(
  matchField?: "pageKey" | "entityId" | "programId",
) {
  return async (
    value: unknown,
    context: ValidationContext,
  ): Promise<true | string> => {
    const doc = context.document as LocaleDoc | undefined;
    if (!doc?._type || !doc.language) return true;

    const other = otherLanguage(doc.language);
    if (!other) return true;

    const id = publishedId(doc._id);
    if (!id) return true;

    const client = context.getClient({ apiVersion: "2024-01-01" });
    const otherLabel = other === "ar" ? "Arabic" : "English";

    // Only enforce once this document itself is published (not draft-only).
    const isPublished = await client.fetch<string | null>(
      `*[_id == $id][0]._id`,
      { id },
    );
    if (!isPublished) return true;

    if (doc._type === "homePage") {
      return requirePublishedSibling(client, {
        docId: id,
        otherLang: other,
        otherLabel,
        fallbackFilter: '_type == "homePage" && language == $lang',
        fallbackParams: { lang: other },
      });
    }

    if (doc._type === "siteSettings") {
      return requirePublishedSibling(client, {
        docId: id,
        otherLang: other,
        otherLabel,
        fallbackFilter: '_type == "siteSettings" && language == $lang',
        fallbackParams: { lang: other },
      });
    }

    if (doc._type === "pageSeo") {
      const pageKey = matchField === "pageKey" ? value : doc.pageKey;
      if (!pageKey || typeof pageKey !== "string") return true;
      return requirePublishedSibling(client, {
        docId: id,
        otherLang: other,
        otherLabel,
        fallbackFilter:
          '_type == "pageSeo" && language == $lang && pageKey == $pageKey',
        fallbackParams: { lang: other, pageKey },
      });
    }

    if (doc._type === "companyPage") {
      const entityId = matchField === "entityId" ? value : doc.entityId;
      if (!entityId || typeof entityId !== "string") return true;
      return requirePublishedSibling(client, {
        docId: id,
        otherLang: other,
        otherLabel,
        fallbackFilter:
          '_type == "companyPage" && language == $lang && entityId == $entityId',
        fallbackParams: { lang: other, entityId },
      });
    }

    if (doc._type === "program") {
      const programId = matchField === "programId" ? value : doc.programId;
      if (!programId || typeof programId !== "string") return true;
      return requirePublishedSibling(client, {
        docId: id,
        otherLang: other,
        otherLabel,
        fallbackFilter:
          '_type == "program" && language == $lang && programId == $programId',
        fallbackParams: { lang: other, programId },
      });
    }

    return true;
  };
}
