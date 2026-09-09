/**
 * Feature flags — all off until credentials + adapters are live.
 *
 * Use static `process.env.FEATURE_*` reads so Next.js can inline flags into
 * client bundles via `next.config.ts` `env` (dynamic `process.env[key]` does not).
 */

function flag(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === "1" || value === "true" || value === "yes";
}

export const features = {
  /** Swap static content facades to the future CMS. */
  cms: flag(process.env.FEATURE_CMS),
  /** Supabase Auth + dashboard guard. */
  auth: flag(process.env.FEATURE_AUTH),
  /** Zoho CRM lead posts — gated in `/api/zoho/*` (server). Client adapters always fetch. */
  zohoForms: flag(process.env.FEATURE_ZOHO_FORMS),
  /** Zoho Campaigns newsletter. */
  newsletter: flag(process.env.FEATURE_NEWSLETTER),
  /** Zoho Bookings embeds / API. */
  bookings: flag(process.env.FEATURE_BOOKINGS),
  /** Moyasar + Tamara checkout. */
  checkout: flag(process.env.FEATURE_CHECKOUT),
  /** Course player (Mux or Vimeo). */
  video: flag(process.env.FEATURE_VIDEO),
  /** Zoho SalesIQ chat widget. */
  salesIq: flag(process.env.FEATURE_SALESIQ),
  /** GTM / Zoho Analytics / custom track sink. */
  analytics: flag(process.env.FEATURE_ANALYTICS),
  /** Future: site search. */
  search: flag(process.env.FEATURE_SEARCH),
  /** Future: blog routes. */
  blog: flag(process.env.FEATURE_BLOG),
  /** Future: store / cart. */
  store: flag(process.env.FEATURE_STORE),
} as const;

export type FeatureKey = keyof typeof features;
