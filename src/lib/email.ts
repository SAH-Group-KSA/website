/** Practical email check: non-empty local@domain.tld (trimmed). */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Returns a localized error when email is missing or malformed; otherwise null. */
export function getEmailError(email: string, isAr: boolean): string | null {
  if (!email.trim()) {
    return isAr ? "البريد الإلكتروني مطلوب." : "Email is required.";
  }
  if (!isValidEmail(email)) {
    return isAr
      ? "يرجى إدخال بريد إلكتروني صالح."
      : "Please enter a valid email address.";
  }
  return null;
}
