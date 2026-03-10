// app/api/payment/razorpay/oauth/callback/route.ts
// Handles the Razorpay OAuth 2.0 callback.
// Exchanges the authorization code for access + refresh tokens and stores them
// encrypted in Firestore `settings/integrationKeys`.

import { type NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
import { updateIntegrationKeys } from "@/lib/db";
import { invalidateIntegrationKeysCache } from "@/lib/integration-keys";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  // Determine redirect base for the admin integrations page
  // Avoid hardcoding the locale — fall back to /en/ (admin always runs in English)
  const adminBase = process.env.NEXT_PUBLIC_ADMIN_LOCALE
    ? `/${process.env.NEXT_PUBLIC_ADMIN_LOCALE}`
    : "/en";
  const settingsUrl = `${appUrl}${adminBase}/admin/settings/integrations`;

  // User denied access
  if (error) {
    return NextResponse.redirect(
      `${settingsUrl}?razorpay_oauth=error&reason=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=error&reason=missing_params`);
  }

  // Validate CSRF state
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const stateDoc = await adminDb.collection("settings").doc("razorpayOAuthState").get();
    if (!stateDoc.exists) {
      return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=error&reason=invalid_state`);
    }
    const stateData = stateDoc.data() as { state: string; expiresAt: { toDate?: () => Date } | string };
    const storedState = stateData.state;
    const expiresAt =
      typeof stateData.expiresAt === "object" && typeof stateData.expiresAt.toDate === "function"
        ? stateData.expiresAt.toDate()
        : new Date(stateData.expiresAt as string);

    if (storedState !== state || expiresAt.getTime() < Date.now()) {
      return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=error&reason=invalid_state`);
    }

    // Consume the state (delete it so it can't be replayed)
    await adminDb.collection("settings").doc("razorpayOAuthState").delete();
  } catch {
    return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=error&reason=state_check_failed`);
  }

  const clientId = process.env.RAZORPAY_CLIENT_ID;
  const clientSecret = process.env.RAZORPAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${settingsUrl}?razorpay_oauth=error&reason=client_not_configured`,
    );
  }

  const redirectUri = `${appUrl}/api/payment/razorpay/oauth/callback`;

  // Exchange code for tokens
  let tokenData: {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in?: number;
    public_token?: string;
    razorpay_account_id?: string;
  };

  try {
    const tokenRes = await fetch("https://auth.razorpay.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("[razorpay/oauth/callback] Token exchange failed:", err);
      return NextResponse.redirect(
        `${settingsUrl}?razorpay_oauth=error&reason=token_exchange_failed`,
      );
    }

    tokenData = await tokenRes.json();
  } catch (err) {
    console.error("[razorpay/oauth/callback] Token exchange error:", err);
    return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=error&reason=network_error`);
  }

  // Calculate expiry
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : undefined;

  // Store encrypted tokens in Firestore
  try {
    await updateIntegrationKeys({
      razorpayOAuthAccessToken: encrypt(tokenData.access_token),
      ...(tokenData.refresh_token
        ? { razorpayOAuthRefreshToken: encrypt(tokenData.refresh_token) }
        : {}),
      ...(tokenData.razorpay_account_id
        ? { razorpayOAuthAccountId: tokenData.razorpay_account_id }
        : {}),
      ...(expiresAt ? { razorpayOAuthExpiresAt: expiresAt } : {}),
    });
    invalidateIntegrationKeysCache();
  } catch (err) {
    console.error("[razorpay/oauth/callback] Failed to save tokens:", err);
    return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=error&reason=save_failed`);
  }

  return NextResponse.redirect(`${settingsUrl}?razorpay_oauth=success`);
}
