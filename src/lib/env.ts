/**
 * Public environment accessors for future integrations.
 * Missing values return `undefined` — never throw at import time.
 * Secrets must only be read in Route Handlers / Server Actions (never in client components).
 */

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Strip inline `# comments` some editors append in `.env.local`.
  const trimmed = value.replace(/\s+#.*$/, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Server-only env lookup — do not use for NEXT_PUBLIC_* in client-imported modules. */
function read(key: string): string | undefined {
  return clean(process.env[key]);
}

export const env = {
  siteUrl: () => clean(process.env.NEXT_PUBLIC_SITE_URL),

  // Sanity (Phase 0 §2.2) — project/dataset are public; tokens are server-only
  sanityProjectId: () => clean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  sanityDataset: () => clean(process.env.NEXT_PUBLIC_SANITY_DATASET),
  sanityApiReadToken: () => read("SANITY_API_READ_TOKEN"),
  sanityApiWriteToken: () => read("SANITY_API_WRITE_TOKEN"),
  sanityRevalidateSecret: () => read("SANITY_REVALIDATE_SECRET"),

  // Supabase (Phase 0 §2.3) — URL + anon are public; service_role is server-only
  supabaseUrl: () => clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () => clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: () => read("SUPABASE_SERVICE_ROLE_KEY"),

  // Zoho One (Phase 2 — CRM OAuth; server-only)
  zohoClientId: () => read("ZOHO_CLIENT_ID"),
  zohoClientSecret: () => read("ZOHO_CLIENT_SECRET"),
  zohoRefreshToken: () => read("ZOHO_REFRESH_TOKEN"),
  zohoApiBase: () => read("ZOHO_API_BASE") ?? "https://www.zohoapis.sa",
  /** Derives from ZOHO_API_BASE when unset — SA CRM (.sa) must use campaigns.zoho.sa */
  zohoCampaignsApiBase: () => {
    const explicit = read("ZOHO_CAMPAIGNS_API_BASE");
    if (explicit) return explicit;
    const apiBase = read("ZOHO_API_BASE") ?? "https://www.zohoapis.sa";
    if (apiBase.includes("zohoapis.sa") || apiBase.includes("zoho.sa")) {
      return "https://campaigns.zoho.sa";
    }
    if (apiBase.includes("zohoapis.eu") || apiBase.includes("zoho.eu")) {
      return "https://campaigns.zoho.eu";
    }
    if (apiBase.includes("zohoapis.in") || apiBase.includes("zoho.in")) {
      return "https://campaigns.zoho.in";
    }
    return "https://campaigns.zoho.com";
  },
  zohoCampaignsListKey: () => read("ZOHO_CAMPAIGNS_LIST_KEY"),
  zohoBookingsOrgId: () => read("ZOHO_BOOKINGS_ORG_ID"),
  zohoSalesIqWidgetCode: () => clean(process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET),

  // Payments (KSA)
  moyasarPublishableKey: () => clean(process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY),
  moyasarSecretKey: () => read("MOYASAR_SECRET_KEY"),
  moyasarWebhookSecret: () => read("MOYASAR_WEBHOOK_SECRET"),
  tamaraApiToken: () => read("TAMARA_API_TOKEN"),
  tamaraNotificationToken: () => read("TAMARA_NOTIFICATION_TOKEN"),

  // Video — Mux (Phase 0 §2.4). All Mux keys are server-only — never NEXT_PUBLIC_.
  // Do not install @mux/* or add src/lib/mux.ts until Phase 9.
  videoPlatform: (): "mux" | "vimeo" | undefined => {
    const v = read("VIDEO_PLATFORM");
    return v === "mux" || v === "vimeo" ? v : undefined;
  },
  muxTokenId: () => read("MUX_TOKEN_ID"),
  muxTokenSecret: () => read("MUX_TOKEN_SECRET"),
  muxSigningKeyId: () => read("MUX_SIGNING_KEY_ID"),
  muxSigningPrivateKey: () => {
    const raw = read("MUX_SIGNING_PRIVATE_KEY");
    if (!raw) return undefined;
    const unescaped = raw.replace(/\\n/g, "\n");
    if (unescaped.includes("BEGIN")) return unescaped;
    try {
      const decoded = Buffer.from(unescaped, "base64").toString("utf8");
      return decoded.includes("BEGIN") ? decoded : unescaped;
    } catch {
      return unescaped;
    }
  },
  vimeoAccessToken: () => read("VIMEO_ACCESS_TOKEN"),

  // Analytics
  gtmId: () => clean(process.env.NEXT_PUBLIC_GTM_ID),
} as const;

export type PublicEnvKey = keyof typeof env;
