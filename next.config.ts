import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    FEATURE_AUTH: process.env.FEATURE_AUTH ?? "0",
    FEATURE_CMS: process.env.FEATURE_CMS ?? "0",
    FEATURE_ZOHO_FORMS: process.env.FEATURE_ZOHO_FORMS ?? "0",
    FEATURE_NEWSLETTER: process.env.FEATURE_NEWSLETTER ?? "0",
    FEATURE_BOOKINGS: process.env.FEATURE_BOOKINGS ?? "0",
    FEATURE_CHECKOUT: process.env.FEATURE_CHECKOUT ?? "0",
    FEATURE_VIDEO: process.env.FEATURE_VIDEO ?? "0",
    FEATURE_SALESIQ: process.env.FEATURE_SALESIQ ?? "0",
    FEATURE_ANALYTICS: process.env.FEATURE_ANALYTICS ?? "0",
    FEATURE_SEARCH: process.env.FEATURE_SEARCH ?? "0",
    FEATURE_BLOG: process.env.FEATURE_BLOG ?? "0",
    FEATURE_STORE: process.env.FEATURE_STORE ?? "0",
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["next-intl", "clsx", "tailwind-merge", "motion"],
  },
  images: {
    // AppImage defaults quality=100 for visual parity with prototype assets.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Avoid picking the parent ~/package-lock.json as the Turbopack root.
  turbopack: {
    root: process.cwd(),
  },
  /**
   * Canonical public URLs (single `[locale]` app tree):
   * - `/`  serves Arabic via rewrite to `/ar`
   * - `/ar` redirects to `/`
   * - `/en` is handled by next-intl middleware
   */
  async redirects() {
    return [
      {
        source: "/ar",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ar/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/en/studio",
        destination: "/studio",
        permanent: false,
      },
      {
        source: "/en/studio/:path*",
        destination: "/studio/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/ar",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
