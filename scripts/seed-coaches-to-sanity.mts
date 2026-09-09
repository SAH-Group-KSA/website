/**
 * One-time seed: all static COACH_RECORDS → Sanity dataset (Phase 2 §4.5).
 *
 * Usage:
 *   npm run seed:coaches
 *
 * Loads `.env.local` automatically (see scripts/lib/load-env.ts).
 */

import "./lib/load-env";

import { createClient } from "next-sanity";
import { COACH_RECORDS } from "../src/content/catalog/coaches";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "staging";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.",
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

function mapRecord(record: (typeof COACH_RECORDS)[number]) {
  return {
    slug: { _type: "slug" as const, current: record.slug },
    name: { en: record.name, ar: record.nameAr },
    specialty: { en: record.specialty, ar: record.specialtyAr },
    bio: { en: record.bio, ar: record.bioAr },
    fullBio: {
      en: record.fullBio ? toPortableText(record.fullBio) : [],
      ar: record.fullBioAr ? toPortableText(record.fullBioAr) : [],
    },
    topics: { en: record.topics, ar: record.topicsAr },
    languages: record.languages ?? ["Arabic", "English"],
    credentials: {
      en: record.credentials ?? [],
      ar: record.credentialsAr ?? record.credentials ?? [],
    },
    experience: {
      en: record.experience ?? "",
      ar: record.experienceAr ?? record.experience ?? "",
    },
    sessionDuration: record.sessionDuration ?? "60 min",
    priceSar: record.price,
    zohoBookingsServiceId: record.zohoBookingsServiceId,
    published: true,
  };
}

async function upsertCoach(record: (typeof COACH_RECORDS)[number]) {
  const existingId = await client.fetch<string | null>(
    `*[_type == "coach" && slug.current == $slug][0]._id`,
    { slug: record.slug },
  );

  const fields = mapRecord(record);

  if (existingId) {
    await client.patch(existingId).set(fields).commit();
    console.log(`Updated coach: ${record.slug}`);
  } else {
    await client.create({ _type: "coach", ...fields });
    console.log(`Created coach: ${record.slug}`);
  }
}

async function main() {
  console.log(`Seeding ${COACH_RECORDS.length} coaches to ${projectId}/${dataset}…`);
  for (const record of COACH_RECORDS) {
    await upsertCoach(record);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
