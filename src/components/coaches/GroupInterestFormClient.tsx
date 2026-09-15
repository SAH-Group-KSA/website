"use client";

import { useState } from "react";
import { submitGroupInterest } from "@/adapters/zoho/forms";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormField";
import type {
  GroupInterestFormLabels,
  GroupProgramOption,
} from "@/content/types";
import { getEmailError } from "@/lib/email";
import { requiredLabel } from "@/lib/form-labels";
import type { Locale } from "@/types/locale";

type Props = {
  labels: GroupInterestFormLabels;
  programs: GroupProgramOption[];
  locale: Locale;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function GroupInterestFormClient({ labels, programs, locale }: Props) {
  const isAr = locale === "ar";
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", org: "", message: "" });
  const [state, setState] = useState<FormState>("idle");
  const [selectionError, setSelectionError] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setSelectionError(true);
      return;
    }
    setSelectionError(false);

    const emailError = getEmailError(form.email, isAr);
    if (emailError) {
      setState("error");
      setError(emailError);
      return;
    }

    setState("submitting");
    setError("");

    const result = await submitGroupInterest({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone || undefined,
      organization: form.org || undefined,
      programId: selected,
      message: form.message || undefined,
      locale,
    });

    if (result.ok) {
      setState("success");
    } else {
      setState("error");
      setError("");
    }
  };

  if (state === "success") {
    return (
      <div className="apply-success" role="status">
        <div className="apply-success-icon" aria-hidden="true">✅</div>
        <h3>{labels.successTitle}</h3>
        <p>{labels.successBody}</p>
        <Button href="/coaches" variant="outline-dark" size="sm">
          {labels.browseCoaches}
        </Button>
      </div>
    );
  }

  const errorMessage =
    error ||
    (state === "error"
      ? isAr
        ? "حدث خطأ. يرجى المحاولة مرة أخرى."
        : "Something went wrong. Please try again."
      : "") ||
    (selectionError ? labels.programRequired : "");

  return (
    <form className="apply-form" onSubmit={handleSubmit} noValidate>
      {errorMessage ? <FormError>{errorMessage}</FormError> : null}

      <div
        role="radiogroup"
        aria-labelledby="group-program-legend"
        aria-invalid={selectionError || undefined}
      >
        <p className="mb-3 text-small text-muted" id="group-program-legend">
          {requiredLabel(labels.programLegend)}
        </p>
        <div className="group-programs-grid">
          {programs.map((p) => (
            <label key={p.id} className="group-program-option">
              <input
                type="radio"
                name="program"
                value={p.id}
                checked={selected === p.id}
                onChange={() => {
                  setSelected(p.id);
                  setSelectionError(false);
                }}
                required
              />
              <span className="group-program-option-title">{p.title}</span>
              <p>{p.desc}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="apply-form-row">
        <label>
          {requiredLabel(labels.fullName)}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder={labels.fullNamePlaceholder}
          />
        </label>
        <label>
          {requiredLabel(labels.email)}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="apply-form-row">
        <label>
          {labels.phone}
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+966 5X XXX XXXX"
          />
        </label>
        <label>
          {labels.organisation}
          <input
            type="text"
            name="org"
            value={form.org}
            onChange={handleChange}
            placeholder={labels.organisationPlaceholder}
          />
        </label>
      </div>

      <label>
        {labels.goals}
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={labels.goalsPlaceholder}
        />
      </label>

      <div className="form-footer">
        <p>{labels.consent}</p>
        <Button
          type="submit"
          variant="primary"
          disabled={state === "submitting" || !selected}
        >
          {state === "submitting" ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}
