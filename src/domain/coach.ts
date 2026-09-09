import type { Money } from "@/domain/money";

/**
 * Locale-resolved coach for UI.
 * Source today: static catalog. Later: CMS-backed coach mapping.
 */
export type Coach = {
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  fullBio?: string;
  rating: number;
  reviewCount: number;
  price: Money;
  experience?: string;
  credentials?: string[];
  topics: string[];
  languages?: string[];
  sessionDuration?: string;
  /** Zoho Bookings service / staff id when bookings go live. */
  zohoBookingsServiceId?: string;
  photo?: string;
  reviews?: CoachReview[];
};

export type CoachReview = {
  author: string;
  rating: number;
  body: string;
  date: string;
};

/** Bilingual raw record before locale resolution (static / CMS draft shape). */
export type CoachRecord = {
  slug: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  bio: string;
  bioAr: string;
  fullBio?: string;
  fullBioAr?: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: "SAR";
  experience?: string;
  experienceAr?: string;
  credentials?: string[];
  credentialsAr?: string[];
  topics: string[];
  topicsAr: string[];
  languages?: string[];
  languagesAr?: string[];
  sessionDuration?: string;
  zohoBookingsServiceId?: string;
  photo?: string;
  reviews?: CoachReview[];
};
