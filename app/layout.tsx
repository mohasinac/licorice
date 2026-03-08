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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
