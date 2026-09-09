/**
 * Migrate translation.metadata documents to v6 i18n format:
 * - language field (not _key) + internationalizedArrayReferenceValue
 * - strong references (no _weak / _strengthenOnPublish — avoids Studio patch errors)
 *
 * Usage:
 *   npm run migrate:translation-metadata
 *   npm run migrate:translation-metadata -- --dry-run
 */

import {
  createSeedClient,
  createTranslationReference,
  type SeedLocale,
} from "./lib/sanity-seed";

type TranslationValue = {
  _ref?: string;
  _type?: string;
  _weak?: boolean;
  _strengthenOnPublish?: unknown;
};

type TranslationItem = {
  _key?: string;
  language?: string;
  _type?: string;
  value?: TranslationValue;
};

type MetadataDoc = {
  _id: string;
  schemaTypes?: string[];
  translations?: TranslationItem[];
};

const SUPPORTED_LOCALES = new Set<SeedLocale>(["en", "ar"]);

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes("--dry-run") };
}

function resolveLanguage(item: TranslationItem): SeedLocale | null {
  if (item.language === "en" || item.language === "ar") return item.language;
  if (item._key === "en" || item._key === "ar") return item._key;
  return null;
}

function isUpToDate(item: TranslationItem): boolean {
  if (item._type !== "internationalizedArrayReferenceValue") return false;
  if (!item.language || !SUPPORTED_LOCALES.has(item.language as SeedLocale)) {
    return false;
  }
  const value = item.value;
  if (!value?._ref || value._type !== "reference") return false;
  // Weak refs trigger OptimisticallyStrengthen → "read-only document" in Studio.
  if (value._weak || value._strengthenOnPublish) return false;
  return true;
}

function normalizeItem(item: TranslationItem): ReturnType<typeof createTranslationReference> {
  const language = resolveLanguage(item);
  const ref = item.value?._ref;
  if (!language || !ref) {
    throw new Error(
      `Cannot migrate translation item (missing language or ref): ${JSON.stringify(item)}`,
    );
  }
  return createTranslationReference(language, ref);
}

async function main() {
  const { dryRun } = parseArgs();
  const client = createSeedClient();

  const docs = await client.fetch<MetadataDoc[]>(
    `*[_type == "translation.metadata"]{ _id, schemaTypes, translations }`,
  );

  let migrated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const translations = doc.translations ?? [];
    const needsUpdate = translations.some((item) => !isUpToDate(item));

    if (!needsUpdate) {
      skipped += 1;
      continue;
    }

    const nextTranslations = translations.map((item) =>
      isUpToDate(item) ? item : normalizeItem(item),
    );

    if (dryRun) {
      console.log(`[migrate] dry-run would update ${doc._id}`);
      migrated += 1;
      continue;
    }

    await client
      .patch(doc._id)
      .set({ translations: nextTranslations })
      .commit();
    console.log(`[migrate] Updated ${doc._id}`);
    migrated += 1;
  }

  console.log(
    `Done. Migrated ${migrated} document(s), skipped ${skipped} already up to date.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
