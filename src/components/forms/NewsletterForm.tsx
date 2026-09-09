"use client";

import { subscribeNewsletter } from "@/adapters/zoho/forms";
import { useId, useState } from "react";
import type { NewsletterContent } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import type { Locale } from "@/types/locale";

type Props = {
  data: NewsletterContent;
  className?: string;
  /** Compact footer layout uses a single-row form. */
  variant?: "default" | "inline" | "footer";
};

type ValidationError = "name" | "email" | null;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function NewsletterForm({
  data,
  className,
  variant = "default",
}: Props) {
  const locale = useLocale() as Locale;
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorType, setErrorType] = useState<ValidationError | "submit">(null);

  const isCompact = variant === "inline" || variant === "footer";

  if (status === "success") {
    return (
      <div
        className={cn(
          "newsletter-success",
          variant === "footer" && "newsletter-success-footer",
          className,
        )}
        role="status"
      >
        <span className="newsletter-success-check" aria-hidden="true">
          ✓
        </span>
        <b>{data.success}</b>
      </div>
    );
  }

  const resetErrors = () => {
    setStatus("idle");
    setErrorType(null);
  };

  return (
    <div className={cn("newsletter-form-wrap", className)}>
      <form
        className={cn(
          "newsletter-form",
          isCompact && "newsletter-form-inline newsletter-form-named",
          variant === "footer" && "newsletter-form-footer",
        )}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedFirst = firstName.trim();
          const trimmedLast = lastName.trim();
          const trimmedEmail = email.trim();

          if (!trimmedFirst || !trimmedLast) {
            setErrorType("name");
            setStatus("error");
            return;
          }
          if (!isValidEmail(trimmedEmail)) {
            setErrorType("email");
            setStatus("error");
            return;
          }

          void subscribeNewsletter({
            firstName: trimmedFirst,
            lastName: trimmedLast,
            email: trimmedEmail,
            locale,
            source: variant,
          }).then((result) => {
            if (result.ok) {
              setStatus("success");
            } else {
              setErrorType("submit");
              setStatus("error");
            }
          });
        }}
      >
        <VisuallyHidden as="label" htmlFor={firstNameId}>
          {data.firstNameLabel}
        </VisuallyHidden>
        <input
          autoComplete="given-name"
          id={firstNameId}
          name="newsletterFirstName"
          placeholder={data.firstNamePlaceholder}
          required
          type="text"
          value={firstName}
          onChange={(event) => {
            setFirstName(event.target.value);
            resetErrors();
          }}
        />
        <VisuallyHidden as="label" htmlFor={lastNameId}>
          {data.lastNameLabel}
        </VisuallyHidden>
        <input
          autoComplete="family-name"
          id={lastNameId}
          name="newsletterLastName"
          placeholder={data.lastNamePlaceholder}
          required
          type="text"
          value={lastName}
          onChange={(event) => {
            setLastName(event.target.value);
            resetErrors();
          }}
        />
        <div className="newsletter-form-email-row">
          <VisuallyHidden as="label" htmlFor={emailId}>
            {data.emailLabel}
          </VisuallyHidden>
          <input
            autoComplete="email"
            id={emailId}
            name="newsletterEmail"
            placeholder={data.placeholder}
            required
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              resetErrors();
            }}
          />
          <Button variant="gold" type="submit">
            {data.cta}
          </Button>
        </div>
      </form>
      {status === "error" ? (
        <p className="newsletter-status newsletter-error" role="alert">
          {errorType === "submit"
            ? data.submitError
            : errorType === "name"
              ? data.nameError
              : data.error}
        </p>
      ) : null}
    </div>
  );
}
