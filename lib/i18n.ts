// lib/i18n.ts
// Locale utilities and LocalizedString helpers.
// next-intl routing config lives in i18n/routing.ts.

import type { Locale, LocalizedString } from "@/lib/types";

export const LOCALES: Locale[] = ["en", "hi", "mr"];
export const DEFAULT_LOCALE: Locale = "en";

export function getLocalizedValue(field: LocalizedString | string | undefined | null, locale: string): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return (field as LocalizedString)[locale as Locale] ?? (field as LocalizedString).en ?? "";
}

export function isValidLocale(locale: string): locale is Locale {
  return (LOCALES as string[]).includes(locale);
}

export { type Locale, type LocalizedString };
