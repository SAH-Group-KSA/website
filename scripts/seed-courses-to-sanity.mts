/**
 * One-time Phase 6 seed: static course metadata → Sanity staging.
 *
 * Usage:
 *   npm run seed:courses
 *
 * New documents are unpublished and intentionally contain no curriculum,
 * thumbnail, or video. Existing editorial fields are never overwritten.
 */

import "./lib/load-env";

import { createClient } from "next-sanity";
import { COURSE_RECORDS } from "../src/content/catalog/courses";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "staging";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

if (dataset !== "staging") {
  console.error(
    `Refusing to seed dataset "${dataset}". Phase 6 course seeding is staging-only.`,
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

function blockKey(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function toPortableText(text: string) {
  return [
    {
      _type: "block" as const,
      _key: blockKey("block"),
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span" as const,
          _key: blockKey("span"),
          text,
          marks: [],
        },
      ],
    },
  ];
}

function mapRecord(record: (typeof COURSE_RECORDS)[number]) {
  return {
    slug: { _type: "slug" as const, current: record.slug },
    title: { en: record.titleEn, ar: record.titleAr },
    description: {
      en: toPortableText(record.descEn),
      ar: toPortableText(record.descAr),
    },
    level: { en: record.level, ar: record.levelAr },
    priceSar: record.price,
    published: false,
  };
}

async function seedCourse(record: (typeof COURSE_RECORDS)[number]) {
  const existingId = await client.fetch<string | null>(
    `*[_type == "course" && slug.current == $slug][0]._id`,
    { slug: record.slug },
  );
  const fields = mapRecord(record);

  if (existingId) {
    await client.patch(existingId).setIfMissing(fields).commit();
    console.log(`Preserved existing course: ${record.slug}`);
    return;
  }

  await client.create({ _type: "course", ...fields });
  console.log(`Created unpublished course: ${record.slug}`);
}

async function main() {
  console.log(
    `Seeding ${COURSE_RECORDS.length} unpublished courses to ${projectId}/${dataset}…`,
  );
  for (const record of COURSE_RECORDS) {
    await seedCourse(record);
  }
  console.log("Done. Complete curriculum and thumbnails in Studio before publishing.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
