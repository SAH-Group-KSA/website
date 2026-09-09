/**
 * Seed Phase 4 marketing content: homePage, companyPage, and program documents.
 *
 * Usage:
 *   npm run seed:marketing
 *   npm run seed:marketing -- --force
 */

import enHome from "../src/content/en/home.json";
import arHome from "../src/content/ar/home.json";
import {
  catalogPagesAr,
  catalogPagesEn,
} from "../src/content/defaults/catalog-pages";
import type { SiteContent } from "../src/content/types";
import type { CompanyEntityId } from "../src/lib/companies";
import {
  createSeedClient,
  imageFromPath,
  linkTranslationPair,
  type SeedLocale,
  type SeedOptions,
  upsertLocalizedDocument,
} from "./lib/sanity-seed";
import type { SanityClient } from "next-sanity";

const COMPANY_IDS: CompanyEntityId[] = [
  "human",
  "seera",
  "nexus",
  "connect",
  "lego",
  "impact",
];

const IMAGE_KEYS = new Set(["logo", "photo", "wordmark"]);

const SITE_SETTINGS_KEYS = [
  "meta",
  "nav",
  "cta",
  "footer",
  "ui",
  "megaNav",
  "contact",
  "entities",
] as const satisfies ReadonlyArray<keyof SiteContent>;

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  return {
    force: args.includes("--force"),
    dryRun: args.includes("--dry-run"),
  };
}

async function transformImages(
  client: SanityClient,
  value: unknown,
): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => transformImages(client, item)));
  }
  if (!value || typeof value !== "object") return value;

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(input)) {
    if (IMAGE_KEYS.has(key) && typeof child === "string" && child.startsWith("/")) {
      output[key] = await imageFromPath(client, child);
      continue;
    }
    output[key] = await transformImages(client, child);
  }

  return output;
}

function siteSettingsFields(content: SiteContent, locale: SeedLocale) {
  const fields: Record<string, unknown> = {};
  for (const key of SITE_SETTINGS_KEYS) {
    fields[key] = content[key];
  }
  if (fields.ui && typeof fields.ui === "object") {
    fields.ui = {
      ...(fields.ui as Record<string, unknown>),
      breadcrumbHome: locale === "ar" ? "الرئيسية" : "Home",
    };
  }
  return fields;
}

function homePageFields(content: SiteContent) {
  const {
    entityPages: _entityPages,
    programs: _programs,
    entityColors: _entityColors,
    locale: _locale,
    dir: _dir,
    meta: _meta,
    nav: _nav,
    cta: _cta,
    footer: _footer,
    ui: _ui,
    megaNav: _megaNav,
    contact: _contact,
    entities: _entities,
    catalogPages: _catalogPages,
    ...fields
  } = content;
  return fields;
}

async function seedSiteSettings(
  client: SanityClient,
  locale: SeedLocale,
  content: SiteContent,
  options: SeedOptions,
) {
  const fields = await transformImages(client, siteSettingsFields(content, locale));
  return upsertLocalizedDocument(client, {
    type: "siteSettings",
    key: "main",
    locale,
    options,
    fields: {
      title: locale === "ar" ? "إعدادات الموقع" : "Site settings",
      published: true,
      ...(fields as Record<string, unknown>),
    },
  });
}

async function seedHomePage(
  client: SanityClient,
  locale: SeedLocale,
  content: SiteContent,
  options: SeedOptions,
) {
  const fields = await transformImages(client, homePageFields(content));
  const catalogPages = locale === "ar" ? catalogPagesAr : catalogPagesEn;
  return upsertLocalizedDocument(client, {
    type: "homePage",
    key: "main",
    locale,
    options,
    fields: {
      title: locale === "ar" ? "الصفحة الرئيسية" : "Home page",
      published: true,
      catalogPages,
      ...(fields as Record<string, unknown>),
    },
  });
}

async function seedCompanyPages(
  client: SanityClient,
  locale: SeedLocale,
  content: SiteContent,
  options: SeedOptions,
) {
  const ids: string[] = [];
  for (const entityId of COMPANY_IDS) {
    const page = content.entityPages[entityId];
    const transformed = await transformImages(client, page);
    const id = await upsertLocalizedDocument(client, {
      type: "companyPage",
      key: entityId,
      locale,
      options,
      fields: {
        entityId,
        studioTitle: `${entityId} — ${locale.toUpperCase()}`,
        content: transformed,
        published: true,
      },
    });
    ids.push(id);
  }
  return ids;
}

async function seedPrograms(
  client: SanityClient,
  locale: SeedLocale,
  content: SiteContent,
  options: SeedOptions,
) {
  for (const program of content.programs) {
    await upsertLocalizedDocument(client, {
      type: "program",
      key: program.id,
      locale,
      options,
      fields: {
        programId: program.id,
        title: program.title,
        entity: program.entity,
        audience: program.audience,
        level: program.level,
        summary: program.summary,
        outcome: program.outcome,
        problem: program.problem,
        format: program.format,
        duration: program.duration,
        deliverables: program.deliverables,
        next: program.next,
        relatedEntities: program.relatedEntities ?? [],
        published: true,
      },
    });
  }
}

async function linkPairs(
  client: SanityClient,
  type: string,
  keys: string[],
  enIds: string[],
  arIds: string[],
  options: SeedOptions,
) {
  if (options.dryRun) return;
  for (let i = 0; i < keys.length; i += 1) {
    await linkTranslationPair(client, type, keys[i], enIds[i], arIds[i]);
  }
}

async function main() {
  const options = parseArgs();
  const client = createSeedClient();

  console.log("Seeding siteSettings (AR + EN)…");
  const settingsEnId = await seedSiteSettings(
    client,
    "en",
    enHome as SiteContent,
    options,
  );
  const settingsArId = await seedSiteSettings(
    client,
    "ar",
    arHome as SiteContent,
    options,
  );
  await linkTranslationPair(client, "siteSettings", "main", settingsEnId, settingsArId);

  console.log("Seeding homePage (AR + EN)…");
  const homeEnId = await seedHomePage(client, "en", enHome as SiteContent, options);
  const homeArId = await seedHomePage(client, "ar", arHome as SiteContent, options);
  await linkTranslationPair(client, "homePage", "main", homeEnId, homeArId);

  console.log("Seeding companyPage documents…");
  const companyEnIds = await seedCompanyPages(
    client,
    "en",
    enHome as SiteContent,
    options,
  );
  const companyArIds = await seedCompanyPages(
    client,
    "ar",
    arHome as SiteContent,
    options,
  );
  await linkPairs(
    client,
    "companyPage",
    COMPANY_IDS,
    companyEnIds,
    companyArIds,
    options,
  );

  console.log("Seeding program documents…");
  await seedPrograms(client, "en", enHome as SiteContent, options);
  await seedPrograms(client, "ar", arHome as SiteContent, options);

  const programKeys = (enHome as SiteContent).programs.map((program) => program.id);
  const programEnIds = programKeys.map((key) => `program.${key}.en`);
  const programArIds = programKeys.map((key) => `program.${key}.ar`);
  await linkPairs(
    client,
    "program",
    programKeys,
    programEnIds,
    programArIds,
    options,
  );

  console.log("Marketing seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
