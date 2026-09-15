"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { requiredLabel } from "@/lib/form-labels";
import { cn } from "@/lib/utils";

type FormFieldProps = LabelHTMLAttributes<HTMLLabelElement> & {
  label: ReactNode;
  children: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
  /** When true and `label` is a string, appends a trailing ` *`. */
  required?: boolean;
};

/**
 * Shared label + control + error stack.
 * Parent form class (`.auth-form`, `.apply-form`, …) still owns input chrome.
 */
export function FormField({
  label,
  children,
  error,
  hint,
  className,
  required,
  ...rest
}: FormFieldProps) {
  const displayLabel =
    required && typeof label === "string" ? requiredLabel(label) : label;

  return (
    <label className={cn("form-field", className)} {...rest}>
      {displayLabel}
      {children}
      {hint ? <span className="field-hint text-small">{hint}</span> : null}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type FormErrorProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Form-level error banner. Place near the top of the form so it stays visible.
 * Scrolls into view when the message appears or changes.
 */
export function FormError({ children, className }: FormErrorProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [children]);

  return (
    <p ref={ref} className={cn("form-error", className)} role="alert">
      {children}
    </p>
  );
}

type FormShellProps = {
  children: ReactNode;
  className?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  noValidate?: boolean;
};

/** Thin form element that applies a domain form class via `className`. */
export function FormShell({
  children,
  className,
  onSubmit,
  noValidate = true,
}: FormShellProps) {
  return (
    <form className={cn(className)} onSubmit={onSubmit} noValidate={noValidate}>
      {children}
    </form>
  );
}
