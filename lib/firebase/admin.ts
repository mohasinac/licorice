// lib/firebase/admin.ts
// Thin shim — delegates to @mohasinac/db-firebase singletons.
// All existing callers import `adminDb` / `adminAuth` unchanged.

import "server-only";
import { getAdminDb, getAdminAuth, getAdminApp } from "@mohasinac/db-firebase";

export { getAdminApp };
export const adminDb = getAdminDb();
export const adminAuth = getAdminAuth();
