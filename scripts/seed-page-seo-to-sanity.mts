/**
 * Seed page SEO documents from static JSON into Sanity (Phase 4.1).
 *
 * Usage:
 *   npm run seed:page-seo
 *   npm run seed:page-seo -- --force
 *
 * Loads `.env.local` automatically (see scripts/lib/load-env.ts).
 */

import "./lib/load-env";

import enPagesSeo from "../src/content/en/pages-seo.json";
import arPagesSeo from "../src/content/ar/pages-seo.json";
import type { PageSeoKey } from "../src/content/seo-types";
import {
  createSeedClient,
  imageFromPath,
  linkTranslationPair,
  type SeedLocale,
  type SeedOptions,
  upsertLocalizedDocument,
} from "./lib/sanity-seed";

const PAGE_KEYS = Object.keys(enPagesSeo) as PageSeoKey[];

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  return {
    force: args.includes("--force"),
    dryRun: args.includes("--dry-run"),
  };
}

async function seedPageSeoKey(
  pageKey: PageSeoKey,
  locale: SeedLocale,
  options: SeedOptions,
) {
  const client = createSeedClient();
  const bundle = locale === "ar" ? arPagesSeo : enPagesSeo;
  const record = bundle[pageKey];
  const ogImage = await imageFromPath(client, record.ogImage, record.ogImageAlt);

  return upsertLocalizedDocument(client, {
    type: "pageSeo",
    key: pageKey,
    locale,
    options,
    fields: {
      pageKey,
      title: record.title,
      description: record.description,
      path: record.path,
      ogTitle: record.ogTitle,
      ogDescription: record.ogDescription,
      ogImage,
      absoluteTitle: record.absoluteTitle ?? false,
      robots: record.robots ?? "index",
    },
  });
}

async function main() {
  const options = parseArgs();
  const client = createSeedClient();
  console.log(`Seeding ${PAGE_KEYS.length} page SEO keys (AR + EN)…`);

  for (const pageKey of PAGE_KEYS) {
    const enId = await seedPageSeoKey(pageKey, "en", options);
    const arId = await seedPageSeoKey(pageKey, "ar", options);
    if (!options.dryRun) {
      await linkTranslationPair(client, "pageSeo", pageKey, enId, arId);
    }
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
