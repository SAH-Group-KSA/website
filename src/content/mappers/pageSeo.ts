import type { PageSeo, PageSeoKey } from "@/content/seo-types";
import {
  asString,
  resolveImageUrl,
  type ImageWithAlt,
} from "@/content/mappers/shared";

export type SanityPageSeoDocument = {
  pageKey?: string | null;
  title?: string | null;
  description?: string | null;
  path?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: ImageWithAlt | string | null;
  absoluteTitle?: boolean | null;
  robots?: "index" | "noindex" | null;
};

export function mapPageSeoDocument(
  doc: unknown,
  fallback: PageSeo,
): PageSeo | null {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc as SanityPageSeoDocument;
  const title = asString(raw.title);
  const description = asString(raw.description);
  const path = asString(raw.path);
  if (!title || !description || !path) return null;

  const ogImage = resolveImageUrl(raw.ogImage, fallback.ogImage);

  return {
    title,
    description,
    path,
    ogTitle: asString(raw.ogTitle) || undefined,
    ogDescription: asString(raw.ogDescription) || undefined,
    ogImage,
    ogImageAlt:
      typeof raw.ogImage === "object" && raw.ogImage?.alt
        ? asString(raw.ogImage.alt)
        : fallback.ogImageAlt,
    absoluteTitle:
      typeof raw.absoluteTitle === "boolean"
        ? raw.absoluteTitle
        : fallback.absoluteTitle,
    robots: raw.robots === "noindex" ? "noindex" : fallback.robots,
  };
}

export function pageKeyFromDocument(doc: unknown): PageSeoKey | null {
  if (!doc || typeof doc !== "object") return null;
  const key = (doc as SanityPageSeoDocument).pageKey;
  return typeof key === "string" ? (key as PageSeoKey) : null;
}
