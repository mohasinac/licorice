// constants/theme.ts
// Single source of truth for brand tokens.
// These values mirror the CSS custom properties in app/globals.css — keep them in sync.

export const colors = {
  primary: "#2B1A6B",
  primaryForeground: "#FFFFFF",
  secondary: "#6B4FA0",
  accent: "#C9B99A",
  background: "#FAFAF7",
  foreground: "#1A0F3C",
  muted: "#F3F0F8",
  mutedForeground: "#6E5F9C",
  border: "#DDD5F0",
  destructive: "#C0392B",
  success: "#2E7D32",
  herb: "#3D6B4F",
  earth: "#8B7355",
  saffron: "#D4A55A",
} as const;

export const fonts = {
  heading: "Cormorant Garamond",
  body: "Inter",
  accentItalic: "Cormorant Garamond",
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const spacing = {
  section: "5rem", // py-20 on sections
  container: "80rem", // max-w-7xl
} as const;

export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
