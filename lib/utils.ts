/** Merges class names, filtering falsy values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Returns true when Firebase credentials are present and mock mode is off.
 * Safe to call from both client and server code.
 */
export function isFirebaseReady(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return false;
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  );
}
