// lib/auth.ts
// Server-side auth helpers for Server Components / Route Handlers.

import "server-only";
import type { NextRequest } from "next/server";
import type { AppUser } from "@/lib/types";

/**
 * Verifies the Firebase ID token from the Authorization header and returns
 * the decoded user. Returns null when Firebase is unconfigured (mock mode).
 */
export async function getCurrentUser(request: NextRequest): Promise<AppUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    const decoded = await adminAuth.verifyIdToken(token);

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
      photoURL: decoded.picture ?? undefined,
      role: (decoded["role"] as AppUser["role"]) ?? "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch {
    return null;
  }
}

/**
 * Returns true if the given Firebase UID belongs to an admin user.
 */
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.["role"] === "admin";
  } catch {
    return false;
  }
}
