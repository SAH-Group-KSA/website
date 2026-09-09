import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { env } from "@/lib/env";

const projectId = env.sanityProjectId() ?? "";
const dataset = env.sanityDataset() ?? "staging";
const apiVersion = "2024-01-01";

/**
 * Server-side Sanity client for CMS reads when FEATURE_CMS is on.
 * Uses the CDN when a read token is present; never import into client components.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // Tokenized reads should hit the API — CDN can serve stale cleared fields.
  useCdn: false,
  token: env.sanityApiReadToken(),
});

const imageBuilder =
  projectId.length > 0 ? createImageUrlBuilder({ projectId, dataset }) : null;

/** Absolute CDN URL for a Sanity image source, or undefined if missing. */
export function urlForImage(
  source: SanityImageSource | null | undefined,
): string | undefined {
  if (!source || !imageBuilder) return undefined;
  try {
    const built = imageBuilder.image(source).auto("format").url();
    if (built) return built;
  } catch {
    // fall through to asset.url when present (expanded GROQ asset->)
  }

  if (typeof source === "object" && source !== null && "asset" in source) {
    const asset = (source as { asset?: { url?: string | null } | null }).asset;
    if (asset?.url) return asset.url;
  }
  return undefined;
}

export const COACHES_QUERY = `*[_type == "coach" && published == true] | order(name.en asc) {
  _id,
  "slug": slug.current,
  name,
  specialty,
  bio,
  fullBio,
  photo{
    ...,
    asset->
  },
  topics,
  languages,
  credentials,
  experience,
  sessionDuration,
  priceSar,
  zohoBookingsServiceId,
  published
}`;

export const COACH_BY_SLUG_QUERY = `*[_type == "coach" && published == true && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  name,
  specialty,
  bio,
  fullBio,
  photo{
    ...,
    asset->
  },
  topics,
  languages,
  credentials,
  experience,
  sessionDuration,
  priceSar,
  zohoBookingsServiceId,
  published
}`;

export const COACH_SLUGS_QUERY = `*[_type == "coach" && published == true].slug.current`;

export const COURSES_QUERY = `*[_type == "course" && published == true] | order(title.en asc) {
  _id,
  "slug": slug.current,
  title,
  description,
  level,
  thumbnail{ ..., asset-> },
  priceSar,
  published,
  modules[] {
    _key,
    title,
    duration,
    isPreview,
    video {
      asset->{
        playbackId,
        assetId,
        status
      }
    }
  }
}`;

export const COURSE_BY_SLUG_QUERY = `*[_type == "course" && published == true && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  title,
  description,
  level,
  thumbnail{ ..., asset-> },
  priceSar,
  published,
  modules[] {
    _key,
    title,
    duration,
    isPreview,
    video {
      asset->{
        playbackId,
        assetId,
        status
      }
    }
  }
}`;

export const COURSE_SLUGS_QUERY = `*[_type == "course" && published == true].slug.current`;

export const HOME_PAGE_QUERY = `*[_type == "homePage" && language == $locale && published != false][0]{
  ...,
  entities[]{ ..., logo{ ..., asset-> } },
  partners[]{ ..., logo{ ..., asset-> }, wordmark{ ..., asset-> } },
  initiatives{
    ...,
    cards[]{ ..., logo{ ..., asset-> } }
  },
  about{
    ...,
    founders[]{ ..., photo{ ..., asset-> } }
  },
  community{
    ...,
    cards[]{ ..., logo{ ..., asset-> } }
  },
  catalogPages
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && language == $locale && published != false][0]{
  ...,
  entities[]{ ..., logo{ ..., asset-> } }
}`;

export const COMPANY_PAGES_QUERY = `*[_type == "companyPage" && language == $locale && published != false]{
  entityId,
  content
}`;

export const PROGRAMS_QUERY = `*[_type == "program" && language == $locale && published != false] | order(programId asc) {
  programId,
  title,
  entity,
  audience,
  level,
  summary,
  outcome,
  problem,
  format,
  duration,
  deliverables,
  next,
  relatedEntities,
  published
}`;

export const PAGE_SEO_QUERY = `*[_type == "pageSeo" && language == $locale && pageKey == $pageKey][0] {
  pageKey,
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  ogImage{ ..., asset-> },
  absoluteTitle,
  robots
}`;

export const PAGE_SEO_ALL_QUERY = `*[_type == "pageSeo" && language == $locale] {
  pageKey,
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  ogImage{ ..., asset-> },
  absoluteTitle,
  robots
}`;
