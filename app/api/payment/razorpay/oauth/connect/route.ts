// app/api/payment/razorpay/oauth/connect/route.ts
// Initiates the Razorpay OAuth 2.0 flow.
// POST → stores CSRF state in Firestore, returns { authUrl } for the frontend to redirect to.
//
// Required env vars:
//   RAZORPAY_CLIENT_ID         — OAuth client ID from Razorpay Partner dashboard
//   RAZORPAY_CLIENT_SECRET     — OAuth client secret (used only in callback)
//   NEXT_PUBLIC_APP_URL        — e.g. https://yourdomain.com

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminCheck = await isAdmin(user.uid);
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = process.env.RAZORPAY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "RAZORPAY_CLIENT_ID is not configured. Set it in your environment to enable OAuth.",
      },
      { status: 501 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const redirectUri = `${appUrl}/api/payment/razorpay/oauth/callback`;

  // Generate a random state token and store it in Firestore for CSRF protection
  const state = randomBytes(24).toString("hex");
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    await adminDb.collection("settings").doc("razorpayOAuthState").set({
      state,
      initiatedBy: user.uid,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to initiate OAuth flow" }, { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read_write",
    state,
  });

  const authUrl = `https://auth.razorpay.com/authorize?${params.toString()}`;
  return NextResponse.json({ authUrl });
}
