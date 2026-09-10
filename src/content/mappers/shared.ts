import { urlForImage } from "@/lib/sanity";

export type ImageWithAlt = {
  _type?: "imageWithAlt";
  image?: unknown;
  alt?: string | null;
};

/** Resolve Sanity imageWithAlt or legacy string path to a public URL string. */
export function resolveImageUrl(
  value: ImageWithAlt | string | null | undefined,
  fallback?: string,
): string | undefined {
  if (!value) return fallback;
  if (typeof value === "string") {
    return value.length > 0 ? value : fallback;
  }
  const url = urlForImage(value.image as Parameters<typeof urlForImage>[0]);
  return url ?? fallback;
}

/** Deep-merge CMS partials onto a base shell (CMS wins when defined). */
export function mergeDefined<T extends object>(
  fallback: T,
  partial: Partial<T> | null | undefined,
): T {
  if (!partial) return fallback;
  const out = { ...fallback } as T;
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined || value === null) continue;
    const existing = out[key as keyof T];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      out[key as keyof T] = mergeDefined(
        existing as object,
        value as object,
      ) as T[keyof T];
    } else {
      out[key as keyof T] = value as T[keyof T];
    }
  }
  return out;
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
