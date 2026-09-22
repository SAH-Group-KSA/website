"use client";

import { useState } from "react";
import type { PrivacyPolicyContent } from "@/content/types";
import { useConsent } from "@/lib/use-consent";

/**
 * Lets a visitor clear a stored consent choice so the banner reappears.
 *
 * Without this there is no way back: once "Decline" is stored, the banner
 * never shows again and the visitor cannot change their mind.
 */
export function CookieSettings({
  labels,
}: {
  labels: PrivacyPolicyContent["cookieSettings"];
}) {
  const { reset } = useConsent();
  const [done, setDone] = useState(false);

  return (
    <div className="ds-card ds-cookie-settings">
      <h2>{labels.heading}</h2>
      <p>{labels.body}</p>
      <button
        type="button"
        className="button button-outline button-small"
        onClick={() => {
          reset();
          setDone(true);
        }}
      >
        {labels.resetLabel}
      </button>
      <p aria-live="polite" className="ds-cookie-settings-status">
        {done ? labels.resetConfirmation : ""}
      </p>
    </div>
  );
}
