import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// All @mohasinac/* packages are resolved via tsconfig paths pointing to their
// src/ directories — transpilePackages tells Next.js/webpack to compile them.
const MOHASINAC_PACKAGES = [
  "@mohasinac/contracts",
  "@mohasinac/core",
  "@mohasinac/tokens",
  "@mohasinac/errors",
  "@mohasinac/utils",
  "@mohasinac/validation",
  "@mohasinac/http",
  "@mohasinac/next",
  "@mohasinac/react",
  "@mohasinac/ui",
  "@mohasinac/monitoring",
  "@mohasinac/seo",
  "@mohasinac/security",
  "@mohasinac/css-tailwind",
  "@mohasinac/css-vanilla",
  "@mohasinac/db-firebase",
  "@mohasinac/auth-firebase",
  "@mohasinac/email-resend",
  "@mohasinac/storage-firebase",
  "@mohasinac/feat-layout",
  "@mohasinac/feat-forms",
  "@mohasinac/feat-filters",
  "@mohasinac/feat-media",
  "@mohasinac/feat-search",
  "@mohasinac/feat-categories",
  "@mohasinac/feat-blog",
  "@mohasinac/feat-reviews",
  "@mohasinac/feat-faq",
  "@mohasinac/feat-auth",
  "@mohasinac/feat-account",
  "@mohasinac/feat-homepage",
  "@mohasinac/feat-products",
  "@mohasinac/feat-wishlist",
  "@mohasinac/feat-cart",
  "@mohasinac/feat-payments",
  "@mohasinac/feat-checkout",
  "@mohasinac/feat-orders",
  "@mohasinac/feat-admin",
  "@mohasinac/feat-consultation",
  "@mohasinac/feat-concern",
  "@mohasinac/feat-corporate",
  "@mohasinac/feat-before-after",
  "@mohasinac/cli",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  transpilePackages: MOHASINAC_PACKAGES,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
