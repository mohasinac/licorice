// app/api/shiprocket/token/route.ts
// Fetch and cache a Shiprocket JWT in Firestore with a 24h TTL.
// GET  → returns { token }  (from cache if valid, else refreshes)
// Credentials are resolved from Firestore integrationKeys first, then env vars.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TokenCache {
  token: string;
  expiresAt: { _seconds?: number; toDate?: () => Date } | number | Date;
}

function cacheIsValid(cache: TokenCache): boolean {
  const { expiresAt } = cache;
  let exp: Date;
  if (expiresAt instanceof Date) {
    exp = expiresAt;
  } else if (typeof expiresAt === "object" && expiresAt !== null) {
    exp =
      typeof (expiresAt as { toDate?: () => Date }).toDate === "function"
        ? (expiresAt as { toDate: () => Date }).toDate()
        : new Date((expiresAt as { _seconds: number })._seconds * 1000);
  } else {
    exp = new Date(expiresAt as number);
  }
  return exp.getTime() > Date.now() + 60_000; // 1-minute buffer
}

export async function GET(): Promise<Response> {
  const { resolveKeys } = await import("@/lib/integration-keys");
  const keys = await resolveKeys();
  const email = keys.shiprocketEmail;
  const password = keys.shiprocketPassword;

  if (!email || !password) {
    // Shiprocket not configured — return a placeholder for mock/dev
    return Response.json({ token: "mock-shiprocket-token" });
  }

  // 1. Check Firestore cache
  try {
      const { adminDb } = await import("@/lib/firebase/admin");
      const doc = await adminDb.collection("settings").doc("shiprocketToken").get();
      if (doc.exists) {
        const cache = doc.data() as TokenCache;
        if (cacheIsValid(cache)) {
          return Response.json({ token: cache.token });
        }
      }
    } catch (err) {
      console.warn("[shiprocket/token] Firestore cache read failed", err);
  }

  // 2. Fetch fresh token from Shiprocket
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return new Response("Shiprocket auth failed", { status: 502 });
  }

  const data = (await res.json()) as { token: string };
  const token = data.token;

  // 3. Store in Firestore cache
  try {
      const { adminDb } = await import("@/lib/firebase/admin");
      const { FieldValue } = await import("firebase-admin/firestore");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h
      await adminDb.collection("settings").doc("shiprocketToken").set({
        token,
        expiresAt,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.warn("[shiprocket/token] Firestore cache write failed", err);
  }

  return Response.json({ token });
}
