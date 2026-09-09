/**
 * Bilingual field helpers: both locales empty is OK;
 * if either EN or AR has content, the other is required.
 */

export type LocalePairValue = {
  en?: unknown;
  ar?: unknown;
} | null | undefined;

function isPortableTextFilled(blocks: unknown): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some((block) => {
    if (!block || typeof block !== "object") return false;
    const b = block as { _type?: string; children?: unknown[] };
    if (b._type !== "block") return true;
    if (!Array.isArray(b.children)) return false;
    return b.children.some((child) => {
      if (!child || typeof child !== "object") return false;
      const text = (child as { text?: string }).text;
      return typeof text === "string" && text.trim().length > 0;
    });
  });
}

export function isLocaleSideFilled(value: unknown, kind: "string" | "text" | "stringArray" | "portableText"): boolean {
  if (value == null) return false;
  switch (kind) {
    case "string":
    case "text":
      return typeof value === "string" && value.trim().length > 0;
    case "stringArray":
      return Array.isArray(value) && value.some((item) => typeof item === "string" && item.trim().length > 0);
    case "portableText":
      return isPortableTextFilled(value);
    default:
      return false;
  }
}

export function bothOrNeitherLocaleMessage(
  value: LocalePairValue,
  kind: "string" | "text" | "stringArray" | "portableText",
): true | string {
  if (!value) return true;
  const enFilled = isLocaleSideFilled(value.en, kind);
  const arFilled = isLocaleSideFilled(value.ar, kind);
  if (enFilled === arFilled) return true;
  if (enFilled && !arFilled) return "Arabic is required when English is set";
  return "English is required when Arabic is set";
}

/** True when the bilingual object has no content on either side. */
export function isLocalePairEmpty(
  value: LocalePairValue,
  kind: "string" | "text" | "stringArray" | "portableText",
): boolean {
  if (!value) return true;
  return !isLocaleSideFilled(value.en, kind) && !isLocaleSideFilled(value.ar, kind);
}
