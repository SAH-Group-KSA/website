export type AnalyticsEventMap = {
  lead_submitted: {
    kind: "discovery" | "contact" | "group" | "community" | "program";
    locale: string;
    programId?: string;
  };
  newsletter_subscribed: { locale: string; source?: string };
  auth_sign_in: { emailDomain?: string };
  auth_sign_up: { emailDomain?: string };
  auth_reset_password: { emailDomain?: string };
  auth_sign_out: Record<string, never>;
  checkout_started: {
    provider: string;
    kind: string;
    productId: string;
  };
  booking_confirmed: { paymentId: string };
  wizard_step: { step: string; audience?: string };
  cta_click: { id: string; href?: string };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;
