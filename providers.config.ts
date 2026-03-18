/**
 * providers.config.ts — Licorice Herbals
 *
 * Registers concrete implementations for all @mohasinac/contracts interfaces.
 * This file is the ONLY place in the project that knows which DB / auth /
 * email / storage providers are used.  Everything else depends on contracts.
 *
 * Swap a provider here and nothing else in the codebase changes.
 *
 * Import this file once at app startup — e.g. in app/layout.tsx or
 * app/[locale]/layout.tsx (any Server Component that runs before any
 * code that calls getProviders()).
 */

import { registerProviders } from "@mohasinac/contracts";
import {
  firebaseAuthProvider,
  firebaseSessionProvider,
} from "@mohasinac/auth-firebase";
import { createResendProvider } from "@mohasinac/email-resend";
import { firebaseStorageProvider } from "@mohasinac/storage-firebase";
import { firebaseDbProvider } from "@mohasinac/db-firebase";
import { tailwindAdapter } from "@mohasinac/css-tailwind";

registerProviders({
  // Auth — Firebase Auth + session cookie (__session)
  auth: firebaseAuthProvider,
  session: firebaseSessionProvider,

  // Database — Firebase Firestore via universal IDbProvider
  db: firebaseDbProvider,
  // Email — Resend
  email: createResendProvider({
    apiKey: process.env.RESEND_API_KEY!,
    fromEmail: "hello@licoriceherbal.in",
    fromName: "Licorice Herbals",
  }),

  // Storage — Firebase Storage (Admin SDK, server-side only)
  storage: firebaseStorageProvider,

  // CSS — Tailwind + twMerge
  style: tailwindAdapter,

  // payment — optional, add @mohasinac/payment-razorpay or payment-stripe
  // shipping — optional, add @mohasinac/shipping-shiprocket when needed
  // search  — optional, add @mohasinac/search-algolia when needed
});
