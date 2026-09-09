"use client";

import { useState } from "react";
import { submitCommunityApplication } from "@/adapters/zoho/forms";
import { Button } from "@/components/ui/Button";
import type { CommunityApplyFormLabels } from "@/content/types";
import type { Locale } from "@/types/locale";

type FormState = "idle" | "submitting" | "success" | "error";

type Props = {
  labels: CommunityApplyFormLabels;
  locale: Locale;
};

export function CommunityApplyFormClient({ labels, locale }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    community: "",
    profession: "",
    motivation: "",
    experience: "",
  });
  const [state, setState] = useState<FormState>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");

    const result = await submitCommunityApplication({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      communityId: form.community as "impact" | "lego",
      profession: form.profession || undefined,
      motivation: form.motivation,
      experience: form.experience || undefined,
      locale,
    });

    if (result.ok) {
      setState("success");
    } else {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="apply-success" role="status">
        <div className="apply-success-icon" aria-hidden="true">🎉</div>
        <h3>{labels.successTitle}</h3>
        <p>{labels.successIntro}</p>
        <ol
          className="dreq-next-steps"
          aria-label={labels.successStepsAriaLabel}
        >
          {labels.successSteps.map((step, i) => (
            <li
              key={i}
              className="dreq-next-step"
              data-done={i === 0 ? "" : undefined}
            >
              <span className="dreq-next-icon" aria-hidden="true">{step.icon}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <form className="apply-form" onSubmit={handleSubmit} noValidate>
      <label>
        {labels.community}
        <select name="community" value={form.community} onChange={handleChange} required>
          <option value="">{labels.communityPlaceholder}</option>
          <option value="impact">{labels.impactOption}</option>
          <option value="lego">{labels.legoOption}</option>
        </select>
      </label>

      <div className="apply-form-row">
        <label>
          {labels.fullName}
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
          {labels.email}
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
          {labels.profession}
          <input
            type="text"
            name="profession"
            value={form.profession}
            onChange={handleChange}
            placeholder={labels.professionPlaceholder}
          />
        </label>
      </div>

      <label>
        {labels.motivation}
        <textarea
          name="motivation"
          value={form.motivation}
          onChange={handleChange}
          required
          placeholder={labels.motivationPlaceholder}
        />
      </label>

      <label>
        {labels.experience}
        <textarea
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder={labels.experiencePlaceholder}
        />
      </label>

      <div className="form-footer">
        <p>{labels.consent}</p>
        <Button type="submit" variant="primary" disabled={state === "submitting"}>
          {state === "submitting" ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}
