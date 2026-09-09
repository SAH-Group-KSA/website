import type { FormEvent, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = LabelHTMLAttributes<HTMLLabelElement> & {
  label: ReactNode;
  children: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
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
  ...rest
}: FormFieldProps) {
  return (
    <label className={cn("form-field", className)} {...rest}>
      {label}
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
