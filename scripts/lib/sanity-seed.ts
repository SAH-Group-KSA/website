/**
 * Shared helpers for Phase 4 marketing seed scripts.
 * Uploads /public assets once, upserts deterministic localized documents,
 * and links AR/EN siblings for @sanity/document-internationalization.
 */

import "./load-env";

import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SanityClient } from "next-sanity";

export type SeedLocale = "ar" | "en";

export type SeedOptions = {
  force?: boolean;
  dryRun?: boolean;
};

const PUBLIC_ROOT = path.join(process.cwd(), "public");

const assetCache = new Map<string, string>();

export function createSeedClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "staging";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || !token) {
    throw new Error(
      "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.",
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });
}

export function docId(type: string, key: string, locale: SeedLocale): string {
  return `${type}.${key}.${locale}`;
}

export function translationMetadataId(type: string, key: string): string {
  return `translation.metadata.${type}.${key}`;
}

function publicPath(assetPath: string): string {
  const normalized = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return path.join(PUBLIC_ROOT, normalized);
}

function mimeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

/** Upload a /public asset and return the Sanity image asset _id. */
export async function uploadPublicAsset(
  client: SanityClient,
  assetPath: string | undefined | null,
): Promise<string | undefined> {
  if (!assetPath || typeof assetPath !== "string") return undefined;
  if (assetPath.startsWith("http")) return undefined;

  const cached = assetCache.get(assetPath);
  if (cached) return cached;

  const filePath = publicPath(assetPath);
  if (!existsSync(filePath)) {
    console.warn(`[seed] Missing asset: ${assetPath}`);
    return undefined;
  }

  const buffer = await readFile(filePath);
  const existing = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && source.id == $id][0]._id`,
    { id: `public:${assetPath}` },
  );
  if (existing) {
    assetCache.set(assetPath, existing);
    return existing;
  }

  const uploaded = await client.assets.upload("image", createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: mimeFor(filePath),
    source: { id: `public:${assetPath}`, name: assetPath },
  });

  assetCache.set(assetPath, uploaded._id);
  console.log(`[seed] Uploaded ${assetPath}`);
  return uploaded._id;
}

export function imageField(
  assetId: string | undefined,
  alt?: string,
): { _type: "imageWithAlt"; image?: { _type: "image"; asset: { _type: "reference"; _ref: string } }; alt?: string } | undefined {
  if (!assetId) return undefined;
  return {
    _type: "imageWithAlt",
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
    },
    ...(alt ? { alt } : {}),
  };
}

export async function imageFromPath(
  client: SanityClient,
  assetPath: string | undefined | null,
  alt?: string,
) {
  const assetId = await uploadPublicAsset(client, assetPath);
  return imageField(assetId, alt);
}

/** Random array item key (Sanity requires _key !== language id in v6 i18n). */
function randomArrayKey(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Translation reference in v6 @sanity/document-internationalization format.
 * Uses strong references (no _weak) so Studio does not auto-patch liveEdit metadata.
 */
export function createTranslationReference(
  language: SeedLocale,
  documentId: string,
) {
  return {
    _key: randomArrayKey(),
    _type: "internationalizedArrayReferenceValue" as const,
    language,
    value: {
      _type: "reference" as const,
      _ref: documentId,
    },
  };
}

export async function linkTranslationPair(
  client: SanityClient,
  schemaType: string,
  key: string,
  enId: string,
  arId: string,
): Promise<void> {
  const metadataId = translationMetadataId(schemaType, key);
  await client.createOrReplace({
    _id: metadataId,
    _type: "translation.metadata",
    schemaTypes: [schemaType],
    translations: [
      createTranslationReference("en", enId),
      createTranslationReference("ar", arId),
    ],
  });
}

export async function upsertLocalizedDocument(
  client: SanityClient,
  args: {
    type: string;
    key: string;
    locale: SeedLocale;
    fields: Record<string, unknown>;
    options?: SeedOptions;
  },
): Promise<string> {
  const id = docId(args.type, args.key, args.locale);
  const existing = await client.fetch<{ _rev?: string } | null>(
    `*[_id == $id][0]{ _rev }`,
    { id },
  );

  if (existing && !args.options?.force) {
    console.log(`[seed] Skipping existing ${id} (use --force to overwrite)`);
    return id;
  }

  if (args.options?.dryRun) {
    console.log(`[seed] dry-run would upsert ${id}`);
    return id;
  }

  if (args.options?.force) {
    const draftId = `drafts.${id}`;
    try {
      await client.delete(draftId);
      console.log(`[seed] Deleted draft ${draftId}`);
    } catch {
      // Draft may not exist — safe to ignore.
    }
  }

  await client.createOrReplace({
    _id: id,
    _type: args.type,
    language: args.locale,
    ...args.fields,
  });
  console.log(`[seed] Upserted ${id}`);
  return id;
}

export function blockKey(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
