/** Merges class names, filtering falsy values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Returns true when Firebase credentials are present and seed mode is off.
 * Safe to call from both client and server code.
 */
export function isFirebaseReady(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return false;
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  );
}

/**
 * Safely converts any timestamp-like value to a JS Date.
 * Handles: Date, Firestore admin Timestamp (.toDate()), serialised
 * Timestamp ({seconds} or {_seconds}), ISO string, and epoch ms number.
 * Returns `null` for falsy / unrecognised input.
 */
export function toSafeDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "number") return new Date(val);
  // Firestore admin Timestamp (has .toDate())
  if (typeof (val as Record<string, unknown>).toDate === "function") {
    return (val as { toDate: () => Date }).toDate();
  }
  // Serialised Firestore Timestamp — { seconds } or { _seconds }
  const secs =
    (val as Record<string, unknown>).seconds ?? (val as Record<string, unknown>)._seconds;
  if (typeof secs === "number") return new Date(secs * 1000);
  return null;
}
