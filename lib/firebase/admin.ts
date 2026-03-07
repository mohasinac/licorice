// lib/firebase/admin.ts
// Firebase Admin SDK — server-only, never imported in client code.
// Initializes with the service account credentials from environment variables.

import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    // During build / mock mode the admin SDK is never actually used,
    // but we still need to return a valid app reference.
    return initializeApp({ projectId: projectId ?? "licorice-dev" });
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminDb: Firestore = getFirestore(getAdminApp());
export const adminAuth: Auth = getAuth(getAdminApp());
