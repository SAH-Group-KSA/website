import { notConfiguredResult } from "@/adapters/errors";
import type { AdapterResult } from "@/domain/lead";
import { features } from "@/lib/features";
import { track } from "@/adapters/analytics/track";

/**
 * Zoho Bookings — calendar only. Payment is Moyasar/Tamara after slot pick.
 * Store service ids on coach CMS documents (`zohoBookingsServiceId`).
 */
export async function getBookingsEmbedUrl(_input: {
  serviceId: string;
  locale: "ar" | "en";
}): Promise<AdapterResult & { url?: string }> {
  if (!features.bookings) return notConfiguredResult("Zoho Bookings");
  return notConfiguredResult("Zoho Bookings");
}

export async function confirmBookingAfterPayment(_input: {
  serviceId: string;
  slotId: string;
  paymentId: string;
  customerEmail: string;
}): Promise<AdapterResult> {
  track("booking_confirmed", { paymentId: _input.paymentId });
  if (!features.bookings) return notConfiguredResult("Zoho Bookings");
  return notConfiguredResult("Zoho Bookings");
}
