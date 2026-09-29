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
  /**
   * The visitor opened the SalesIQ chat widget.
   *
   * An intent signal, not a conversion: it fires on the float-button click,
   * before any message is sent. Deliberately absent from `META_EVENT_NAMES` for
   * that reason — counting it as a Meta "Contact" would inflate ad-reported
   * conversions with people who opened the widget and closed it again.
   */
  chat_opened: { locale: string; brand: string };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;
