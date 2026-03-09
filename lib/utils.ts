/** Merges class names, filtering falsy values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
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

/**
 * Sanitises HTML to prevent XSS when rendering with dangerouslySetInnerHTML.
 * Strips scripts, event handlers, and dangerous tags while preserving safe
 * formatting elements used in rich-text content.
 */
export function sanitizeHtml(dirty: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sanitize = require("sanitize-html") as typeof import("sanitize-html");
  return sanitize(dirty, {
    allowedTags: sanitize.defaults.allowedTags.concat(["img", "iframe"]),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      "*": ["class", "style", "id", "target"],
      iframe: ["src", "allow", "allowfullscreen", "frameborder", "width", "height"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
