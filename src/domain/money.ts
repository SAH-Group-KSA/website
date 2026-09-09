/** Shared money representation — provider-agnostic. */
export type Money = {
  amount: number;
  currency: "SAR";
};

export type PaymentProvider = "moyasar" | "tamara";

export type CheckoutKind = "course" | "coaching_session";

export type CheckoutRequest = {
  kind: CheckoutKind;
  provider: PaymentProvider;
  amount: Money;
  /** CMS document key or coach slug / course slug. */
  productId: string;
  locale: "ar" | "en";
  returnUrl: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
};

export type CheckoutSession = {
  id: string;
  provider: PaymentProvider;
  /** Client redirect or embed URL. */
  checkoutUrl: string;
  status: "pending" | "not_configured";
};
