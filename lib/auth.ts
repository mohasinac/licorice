// lib/auth.ts
// Server-side auth helpers for Server Components / Route Handlers.

import "server-only";
import type { NextRequest } from "next/server";
import type { AppUser } from "@/lib/types";

/**
 * Verifies the Firebase ID token from the Authorization header and returns
 * the decoded user. Returns null when Firebase is unconfigured (seed mode).
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

/**
 * Server-component variant — reads the Authorization header from `next/headers`.
 * In a typical browser request this returns null unless cookies/middleware set it.
 */
export async function getServerUser(): Promise<AppUser | null> {
  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    if (!token) return null;

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
