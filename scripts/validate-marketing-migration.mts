/**
 * Validate Phase 4 marketing migration parity between static JSON and Sanity.
 *
 * Usage:
 *   npm run validate:marketing
 *
 * Loads `.env.local` automatically (see scripts/lib/load-env.ts).
 */

import "./lib/load-env";

import enHome from "../src/content/en/home.json";
import arHome from "../src/content/ar/home.json";
import enPagesSeo from "../src/content/en/pages-seo.json";
import type { SiteContent } from "../src/content/types";
import type { PageSeoKey } from "../src/content/seo-types";
import { createSeedClient } from "./lib/sanity-seed";

const PAGE_KEYS = Object.keys(enPagesSeo) as PageSeoKey[];

async function main() {
  const client = createSeedClient();
  let errors = 0;

  for (const locale of ["en", "ar"] as const) {
    const settings = await client.fetch<Record<string, unknown> | null>(
      `*[_type == "siteSettings" && language == $locale][0]{ _id, title, nav, ui }`,
      { locale },
    );
    if (!settings) {
      console.error(`[validate] Missing siteSettings for ${locale}`);
      errors += 1;
    } else {
      console.log(`[validate] siteSettings ${locale}: ${settings._id}`);
    }

    const catalog = await client.fetch<Record<string, unknown> | null>(
      `*[_type == "homePage" && language == $locale][0]{ catalogPages }`,
      { locale },
    );
    const catalogPages = catalog?.catalogPages as Record<string, unknown> | undefined;
    if (!catalogPages?.coaches || !catalogPages?.courses) {
      console.error(`[validate] Missing catalogPages on homePage for ${locale}`);
      errors += 1;
    } else {
      console.log(`[validate] catalogPages ${locale}: ok`);
    }

    const applyForm = await client.fetch<Record<string, unknown> | null>(
      `*[_type == "homePage" && language == $locale][0].community.applyPage.form`,
      { locale },
    );
    if (!applyForm?.submit || !applyForm?.successTitle) {
      console.error(`[validate] Missing community.applyPage.form on homePage for ${locale}`);
      errors += 1;
    } else {
      console.log(`[validate] community.applyPage.form ${locale}: ok`);
    }

    const home = await client.fetch<Record<string, unknown> | null>(
      `*[_type == "homePage" && language == $locale][0]{ _id, title, faq, hero, nav }`,
      { locale },
    );
    if (!home) {
      console.error(`[validate] Missing homePage for ${locale}`);
      errors += 1;
    } else {
      console.log(`[validate] homePage ${locale}: ${home._id}`);
    }

    const seoCount = await client.fetch<number>(
      `count(*[_type == "pageSeo" && language == $locale])`,
      { locale },
    );
    if (seoCount < PAGE_KEYS.length) {
      console.error(
        `[validate] pageSeo ${locale}: expected ${PAGE_KEYS.length}, found ${seoCount}`,
      );
      errors += 1;
    } else {
      console.log(`[validate] pageSeo ${locale}: ${seoCount} docs`);
    }

    const companyCount = await client.fetch<number>(
      `count(*[_type == "companyPage" && language == $locale])`,
      { locale },
    );
    if (companyCount < 6) {
      console.error(
        `[validate] companyPage ${locale}: expected 6, found ${companyCount}`,
      );
      errors += 1;
    } else {
      console.log(`[validate] companyPage ${locale}: ${companyCount} docs`);
    }

    const expectedPrograms = (locale === "en" ? enHome : arHome as SiteContent)
      .programs.length;
    const programCount = await client.fetch<number>(
      `count(*[_type == "program" && language == $locale])`,
      { locale },
    );
    if (programCount < expectedPrograms) {
      console.error(
        `[validate] program ${locale}: expected ${expectedPrograms}, found ${programCount}`,
      );
      errors += 1;
    } else {
      console.log(`[validate] program ${locale}: ${programCount} docs`);
    }
  }

  const arSeoKeys = await client.fetch<string[]>(
    `*[_type == "pageSeo" && language == "ar"].pageKey`,
  );
  const enSeoKeys = await client.fetch<string[]>(
    `*[_type == "pageSeo" && language == "en"].pageKey`,
  );
  const missingAr = PAGE_KEYS.filter((key) => !arSeoKeys.includes(key));
  const missingEn = PAGE_KEYS.filter((key) => !enSeoKeys.includes(key));
  if (missingAr.length > 0 || missingEn.length > 0) {
    console.error("[validate] Missing SEO keys:", { missingAr, missingEn });
    errors += 1;
  }

  if (errors > 0) {
    console.error(`Validation failed with ${errors} issue(s).`);
    process.exit(1);
  }

  console.log("Validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
