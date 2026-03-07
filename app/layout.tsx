// app/layout.tsx — minimal root layout
// All locale-aware content lives in app/[locale]/layout.tsx.
// next-intl middleware redirects `/` → `/en` before this is ever rendered.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Licorice Herbals",
    template: "%s | Licorice Herbals",
  },
  description: "Pure Ayurvedic skincare — rooted in nature, proven by Ayurveda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
