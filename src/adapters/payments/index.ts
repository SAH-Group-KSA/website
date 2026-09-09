import { notConfiguredResult } from "@/adapters/errors";
import type { CheckoutRequest, CheckoutSession } from "@/domain/money";
import type { AdapterResult } from "@/domain/lead";
import { features } from "@/lib/features";
import { track } from "@/adapters/analytics/track";

/**
 * Checkout — Moyasar (cards/mada/Apple Pay) + Tamara (BNPL).
 * Do not introduce Stripe for customer-facing checkout.
 */

export async function createCheckoutSession(
  input: CheckoutRequest,
): Promise<AdapterResult & { session?: CheckoutSession }> {
  track("checkout_started", {
    provider: input.provider,
    kind: input.kind,
    productId: input.productId,
  });
  if (!features.checkout) {
    return notConfiguredResult(`Checkout (${input.provider})`);
  }
  return notConfiguredResult(`Checkout (${input.provider})`);
}

export async function createMoyasarCheckout(
  input: Omit<CheckoutRequest, "provider">,
) {
  return createCheckoutSession({ ...input, provider: "moyasar" });
}

export async function createTamaraCheckout(
  input: Omit<CheckoutRequest, "provider">,
) {
  return createCheckoutSession({ ...input, provider: "tamara" });
}
