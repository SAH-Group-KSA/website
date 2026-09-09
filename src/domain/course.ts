import type { Money } from "@/domain/money";

/**
 * Locale-resolved course for UI.
 * Source today: static catalog. Later: CMS-backed course mapping.
 */
export type Course = {
  slug: string;
  title: string;
  description: string;
  level: string;
  modules: number;
  durationHours: number;
  price: Money;
  /** mux | vimeo — set when video integration is chosen. */
  videoPlatform?: "mux" | "vimeo";
  /** Hero / module media ids live on detail docs later. */
  thumbnail?: string;
  thumbnailAlt?: string;
};

export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
};

export type CourseDetail = Course & {
  modulesList: CourseModule[];
};

export type CourseRecord = {
  slug: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  level: string;
  levelAr: string;
  modules: number;
  durationHours: number;
  price: number;
  currency: "SAR";
  videoPlatform?: "mux" | "vimeo";
  thumbnail?: string;
  thumbnailAltEn?: string;
  thumbnailAltAr?: string;
};
