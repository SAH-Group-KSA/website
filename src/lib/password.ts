export const PASSWORD_MIN_LENGTH = 8;

const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

/** Password must be 8+ chars with upper, lower, number, and special character. */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    HAS_UPPERCASE.test(password) &&
    HAS_LOWERCASE.test(password) &&
    HAS_NUMBER.test(password) &&
    HAS_SPECIAL.test(password)
  );
}

export function passwordRequirementsMessage(isAr: boolean): string {
  return isAr
    ? "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم، ورمز خاص."
    : "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";
}

export function passwordPlaceholder(isAr: boolean): string {
  return isAr
    ? "8 أحرف، حرف كبير وصغير، رقم ورمز"
    : "8+ chars, upper, lower, number & symbol";
}
