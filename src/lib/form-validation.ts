import { getEmailError } from "@/lib/email";

type LocalizedLabel = { en: string; ar: string };

/** Required non-empty (after trim) text field. */
export function getRequiredFieldError(
  value: string,
  isAr: boolean,
  label: LocalizedLabel,
): string | null {
  if (!value.trim()) {
    return isAr ? `${label.ar} مطلوب.` : `${label.en} is required.`;
  }
  return null;
}

export function getNameError(name: string, isAr: boolean): string | null {
  return getRequiredFieldError(name, isAr, {
    en: "Full name",
    ar: "الاسم الكامل",
  });
}

export function getPasswordRequiredError(
  password: string,
  isAr: boolean,
): string | null {
  if (!password) {
    return isAr ? "كلمة المرور مطلوبة." : "Password is required.";
  }
  return null;
}

export function getCommunityRequiredError(
  communityId: string,
  isAr: boolean,
): string | null {
  if (communityId !== "impact" && communityId !== "lego") {
    return isAr ? "يرجى اختيار المجتمع." : "Please select a community.";
  }
  return null;
}

export function getMotivationError(
  motivation: string,
  isAr: boolean,
): string | null {
  return getRequiredFieldError(motivation, isAr, {
    en: "Motivation",
    ar: "الدافع",
  });
}

export function getMessageError(message: string, isAr: boolean): string | null {
  return getRequiredFieldError(message, isAr, {
    en: "Message",
    ar: "الرسالة",
  });
}

/**
 * First failing check among common lead fields (name + email).
 * Pass additional checks via `extra` (evaluated after name/email).
 */
export function getLeadValidationError(
  fields: { name: string; email: string },
  isAr: boolean,
  extra?: Array<string | null>,
): string | null {
  const nameError = getNameError(fields.name, isAr);
  if (nameError) return nameError;
  const emailError = getEmailError(fields.email, isAr);
  if (emailError) return emailError;
  return extra?.find((message): message is string => Boolean(message)) ?? null;
}

type AdapterFailure = {
  code?: string;
  message?: string;
};

/** Map adapter/API failure codes to a user-facing message. */
export function getFormSubmitError(
  result: AdapterFailure,
  isAr: boolean,
  fallback?: string,
): string {
  if (result.code === "validation") {
    return isAr
      ? "يرجى إكمال الحقول المطلوبة بشكل صحيح."
      : "Please complete the required fields correctly.";
  }
  if (result.code === "not_configured") {
    return (
      result.message ||
      (isAr
        ? "الإرسال غير متاح حالياً. حاول لاحقاً."
        : "Submissions are temporarily unavailable. Please try again later.")
    );
  }
  if (result.message && result.message !== "Submission failed" && result.message !== "Upstream error" && result.message !== "Network error") {
    return result.message;
  }
  return (
    fallback ||
    (isAr
      ? "حدث خطأ. يرجى المحاولة مرة أخرى."
      : "Something went wrong. Please try again.")
  );
}
