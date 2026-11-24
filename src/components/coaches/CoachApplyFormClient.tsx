"use client";

import { useRef, useState } from "react";
import { submitCoachApplication } from "@/adapters/zoho/forms";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormField";
import { LocaleLink } from "@/components/ui/LocaleLink";
import type { ApplyAsCoachFormLabels } from "@/content/types";
import {
  COACH_FIELD_LIMITS,
  COACH_LANGUAGE_IDS,
  COACH_SPECIALISATION_IDS,
  isLinkedInUrl,
  type CoachLanguageId,
  type CoachSpecialisationId,
} from "@/lib/coach-application";
import { isValidEmail } from "@/lib/email";
import { getFormSubmitError } from "@/lib/form-validation";
import { requiredLabel } from "@/lib/form-labels";
import { composePhoneNumber } from "@/lib/phone";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  flagEmoji,
  type PhoneCountry,
} from "@/lib/phone-countries";
import type { Locale } from "@/types/locale";

type FormState = "idle" | "submitting" | "success" | "error";

type Fields = {
  fullName: string;
  email: string;
  /** ISO code of the selected calling code. */
  phoneCountry: string;
  phone: string;
  city: string;
  specialisation: string;
  yearsExperience: string;
  certifications: string;
  linkedinUrl: string;
  language: string;
  bio: string;
  consent: boolean;
  website: string;
};

type FieldName = Exclude<
  keyof ApplyAsCoachFormLabels["errors"],
  "duplicateEmail" | "duplicatePhone" | "duplicate"
>;
type FieldErrors = Partial<Record<FieldName, string>>;

/** Validation order — also the order focus moves to the first invalid field. */
const FIELD_ORDER: FieldName[] = [
  "fullName",
  "email",
  "phone",
  "city",
  "specialisation",
  "yearsExperience",
  "linkedinUrl",
  "language",
  "bio",
  "consent",
];

const EMPTY: Fields = {
  fullName: "",
  email: "",
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  phone: "",
  city: "",
  specialisation: "",
  yearsExperience: "",
  certifications: "",
  linkedinUrl: "",
  language: "",
  bio: "",
  consent: false,
  website: "",
};

function dialCodeFor(iso: string): string {
  const country: PhoneCountry | undefined = PHONE_COUNTRIES.find((c) => c.iso === iso);
  return (country ?? PHONE_COUNTRIES[0]).dial;
}

function validate(form: Fields, errors: ApplyAsCoachFormLabels["errors"]): FieldErrors {
  const years = Number(form.yearsExperience);
  const checks: Record<FieldName, boolean> = {
    fullName: Boolean(form.fullName.trim()),
    email: isValidEmail(form.email),
    phone: composePhoneNumber(dialCodeFor(form.phoneCountry), form.phone) !== null,
    city: Boolean(form.city.trim()),
    specialisation: (COACH_SPECIALISATION_IDS as readonly string[]).includes(
      form.specialisation,
    ),
    yearsExperience:
      form.yearsExperience.trim() !== "" &&
      Number.isInteger(years) &&
      years >= 0 &&
      years <= COACH_FIELD_LIMITS.maxYears,
    linkedinUrl: !form.linkedinUrl.trim() || isLinkedInUrl(form.linkedinUrl),
    language: (COACH_LANGUAGE_IDS as readonly string[]).includes(form.language),
    bio: Boolean(form.bio.trim()),
    consent: form.consent,
  };
  const result: FieldErrors = {};
  for (const name of FIELD_ORDER) {
    if (!checks[name]) result[name] = errors[name];
  }
  return result;
}

type Props = {
  labels: ApplyAsCoachFormLabels;
  locale: Locale;
};

export function CoachApplyFormClient({ labels, locale }: Props) {
  const isAr = locale === "ar";
  const formRef = useRef<HTMLFormElement>(null);
  // Render time, for the server's minimum-fill-time spam check.
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState<Fields>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<FormState>("idle");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target;
    const name = target.name as keyof Fields;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((f) => ({ ...f, [name]: value }));
    // A new calling code can make the typed number valid, so clear its error.
    const errorKey = name === "phoneCountry" ? "phone" : name;
    if (errorKey in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey as FieldName];
        return next;
      });
    }
  };

  const submit = async () => {
    const errors = validate(form, labels.errors);
    setFieldErrors(errors);
    const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
    if (firstInvalid) {
      setState("idle");
      setSubmitError("");
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)
        ?.focus();
      return;
    }

    setState("submitting");
    setSubmitError("");

    const result = await submitCoachApplication({
      name: form.fullName.trim(),
      email: form.email.trim(),
      phone: composePhoneNumber(dialCodeFor(form.phoneCountry), form.phone) ?? form.phone,
      city: form.city.trim(),
      specialisation: form.specialisation as CoachSpecialisationId,
      yearsExperience: Number(form.yearsExperience),
      certifications: form.certifications.trim() || undefined,
      linkedinUrl: form.linkedinUrl.trim() || undefined,
      language: form.language as CoachLanguageId,
      bio: form.bio.trim(),
      consent: true,
      locale,
      website: form.website || undefined,
      startedAt,
    });

    if (result.ok) {
      setState("success");
    } else if (result.code === "duplicate") {
      // Resubmitting won't help, so point at the field instead of offering retry.
      const field =
        result.field === "Email" ? "email" : result.field === "Mobile" ? "phone" : null;
      if (field) {
        setState("idle");
        setFieldErrors({
          [field]:
            field === "email"
              ? labels.errors.duplicateEmail
              : labels.errors.duplicatePhone,
        });
        formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`)?.focus();
      } else {
        setState("error");
        setSubmitError(labels.errors.duplicate);
      }
    } else {
      setState("error");
      setSubmitError(getFormSubmitError(result, isAr));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  if (state === "success") {
    return (
      <div className="apply-success" role="status">
        <div className="apply-success-icon" aria-hidden="true">
          🎉
        </div>
        <h3>{labels.successTitle}</h3>
        <p>{labels.successBody}</p>
      </div>
    );
  }

  /** Props wiring a control to its inline error message. */
  const errorProps = (name: FieldName) => ({
    "data-field": name,
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `coach-${name}-error` : undefined,
  });

  const fieldError = (name: FieldName) =>
    fieldErrors[name] ? (
      <span id={`coach-${name}-error`} className="field-error">
        {fieldErrors[name]}
      </span>
    ) : null;

  const submitting = state === "submitting";

  return (
    <form
      ref={formRef}
      className="apply-form coach-apply-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {state === "error" && submitError ? (
        <div className="coach-apply-submit-error">
          <FormError>{submitError}</FormError>
          <Button type="button" variant="outline" size="sm" onClick={() => void submit()}>
            {labels.retry}
          </Button>
        </div>
      ) : null}

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div className="coach-apply-hp" aria-hidden="true">
        <label>
          {labels.honeypotLabel}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="apply-form-row">
        <label>
          {requiredLabel(labels.fullName)}
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            maxLength={COACH_FIELD_LIMITS.name}
            autoComplete="name"
            placeholder={labels.fullNamePlaceholder}
            {...errorProps("fullName")}
          />
          {fieldError("fullName")}
        </label>
        <label>
          {requiredLabel(labels.email)}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            {...errorProps("email")}
          />
          {fieldError("email")}
        </label>
      </div>

      <div className="apply-form-row">
        <div>
          <label htmlFor="coach-phone">{requiredLabel(labels.phone)}</label>
          <div className="coach-apply-phone" dir="ltr">
            <div className="coach-apply-dial">
              <span aria-hidden="true">
                {flagEmoji(form.phoneCountry)} +{dialCodeFor(form.phoneCountry)}
              </span>
              <span className="coach-apply-dial-caret" aria-hidden="true">
                ▾
              </span>
              <select
                name="phoneCountry"
                value={form.phoneCountry}
                onChange={handleChange}
                aria-label={labels.phoneCountry}
                autoComplete="tel-country-code"
              >
                {PHONE_COUNTRIES.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {flagEmoji(country.iso)} {isAr ? country.name.ar : country.name.en} (+
                    {country.dial})
                  </option>
                ))}
              </select>
            </div>
            <input
              id="coach-phone"
              type="tel"
              name="phone"
              inputMode="tel"
              value={form.phone}
              onChange={handleChange}
              required
              autoComplete="tel-national"
              placeholder={
                form.phoneCountry === DEFAULT_PHONE_COUNTRY
                  ? labels.phonePlaceholder
                  : labels.phonePlaceholderIntl
              }
              {...errorProps("phone")}
            />
          </div>
          {fieldError("phone") ?? (
            <span className="field-hint text-small">{labels.phoneHint}</span>
          )}
        </div>
        <label>
          {requiredLabel(labels.city)}
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            maxLength={COACH_FIELD_LIMITS.city}
            autoComplete="address-level2"
            placeholder={labels.cityPlaceholder}
            {...errorProps("city")}
          />
          {fieldError("city")}
        </label>
      </div>

      <div className="apply-form-row">
        <label>
          {requiredLabel(labels.specialisation)}
          <select
            name="specialisation"
            value={form.specialisation}
            onChange={handleChange}
            required
            {...errorProps("specialisation")}
          >
            <option value="">{labels.specialisationPlaceholder}</option>
            {labels.specialisationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError("specialisation")}
        </label>
        <label>
          {requiredLabel(labels.yearsExperience)}
          <input
            type="number"
            name="yearsExperience"
            inputMode="numeric"
            min={0}
            max={COACH_FIELD_LIMITS.maxYears}
            step={1}
            value={form.yearsExperience}
            onChange={handleChange}
            required
            placeholder={labels.yearsExperiencePlaceholder}
            {...errorProps("yearsExperience")}
          />
          {fieldError("yearsExperience")}
        </label>
      </div>

      <div className="apply-form-row">
        <label>
          {labels.certifications}
          <input
            type="text"
            name="certifications"
            value={form.certifications}
            onChange={handleChange}
            maxLength={COACH_FIELD_LIMITS.certifications}
            placeholder={labels.certificationsPlaceholder}
          />
        </label>
        <label>
          {labels.linkedinUrl}
          <input
            type="url"
            name="linkedinUrl"
            inputMode="url"
            value={form.linkedinUrl}
            onChange={handleChange}
            autoComplete="url"
            dir="ltr"
            placeholder={labels.linkedinUrlPlaceholder}
            {...errorProps("linkedinUrl")}
          />
          {fieldError("linkedinUrl")}
        </label>
      </div>

      <fieldset
        className="coach-apply-fieldset"
        aria-invalid={fieldErrors.language ? true : undefined}
        aria-describedby={fieldErrors.language ? "coach-language-error" : undefined}
      >
        <legend>{requiredLabel(labels.language)}</legend>
        <div className="form-segment coach-apply-segment">
          {labels.languageOptions.map((option, i) => (
            <label key={option.id}>
              <input
                type="radio"
                name="language"
                value={option.id}
                checked={form.language === option.id}
                onChange={handleChange}
                required
                data-field={i === 0 ? "language" : undefined}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {fieldError("language")}
      </fieldset>

      <label>
        {requiredLabel(labels.bio)}
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          required
          maxLength={COACH_FIELD_LIMITS.bio}
          placeholder={labels.bioPlaceholder}
          {...errorProps("bio")}
        />
        {fieldError("bio")}
      </label>

      <div>
        <label className="coach-apply-consent">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            required
            {...errorProps("consent")}
          />
          <span>
            {labels.consent}{" "}
            <LocaleLink href="/privacy-policy" className="prose-link">
              {labels.privacyPolicyLink}
            </LocaleLink>
            . *
          </span>
        </label>
        {fieldError("consent")}
      </div>

      <div className="form-footer">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}
