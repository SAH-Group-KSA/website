/**
 * Phone normalisation shared by client validation and API routes.
 *
 * Saudi mobiles are the default: `05XXXXXXXX`, `5XXXXXXXX`, `9665XXXXXXXX`,
 * `+9665XXXXXXXX` and `009665XXXXXXXX` (spaces, dashes, dots and brackets
 * allowed) all normalise to `+9665XXXXXXXX`. Any other number written in
 * international form (`+` or `00` prefix, 8–15 digits) is accepted in E.164
 * form so applicants abroad are not locked out.
 */
export function normalizeSaudiMobile(input: string): string | null {
  const compact = input.trim().replace(/[\s\-().]/g, "");
  const isInternational = compact.startsWith("+") || compact.startsWith("00");
  const digits = compact.replace(/^(\+|00)/, "");
  if (!/^\d+$/.test(digits)) return null;

  const saudi = isInternational
    ? digits.match(/^966(5\d{8})$/)
    : digits.match(/^(?:966|0)?(5\d{8})$/);
  if (saudi) return `+966${saudi[1]}`;

  // A +966 number that is not a valid mobile is a typo, not a foreign number.
  if (isInternational && !digits.startsWith("966") && /^[1-9]\d{7,14}$/.test(digits)) {
    return `+${digits}`;
  }

  return null;
}

/**
 * Combine a picked calling code with the number typed next to it, returning
 * E.164 (`+…`) or `null` if invalid. A leading trunk `0` is dropped
 * (`050…` with +966 → `+96650…`). A full international number typed into the
 * field (`+…` / `00…`) takes precedence over the picker.
 */
export function composePhoneNumber(dialCode: string, national: string): string | null {
  const compact = national.trim().replace(/[\s\-().]/g, "");
  if (!compact) return null;
  if (compact.startsWith("+") || compact.startsWith("00")) {
    return normalizeSaudiMobile(compact);
  }
  return normalizeSaudiMobile(`+${dialCode}${compact.replace(/^0+/, "")}`);
}
