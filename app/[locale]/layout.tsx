// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { getSiteConfig } from "@/lib/db";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackToTop } from "@/components/ui/BackToTop";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading-loaded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://licoriceherbal.in";

export const viewport: Viewport = {
  themeColor: "#2B1A6B",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "Licorice Herbals — Pure Ayurvedic Skincare",
      template: "%s | Licorice Herbals",
    },
    description: t("heroSub"),
    manifest: "/manifest.json",
    openGraph: {
      siteName: "Licorice Herbals",
      locale: locale === "hi" ? "hi_IN" : locale === "mr" ? "mr_IN" : "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      site: "@licoriceherbal",
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        "en-IN": `${BASE_URL}/en`,
        "hi-IN": `${BASE_URL}/hi`,
        "mr-IN": `${BASE_URL}/mr`,
        "x-default": `${BASE_URL}/en`,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const [messages, siteConfig] = await Promise.all([getMessages(), getSiteConfig()]);
  const logoUrl = siteConfig?.logoUrl || "/logo.png";

  return (
    <html lang={locale} suppressHydrationWarning className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <ThemeProvider>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {siteConfig?.announcementText && (
              <AnnouncementBar
                text={siteConfig.announcementText}
                link={siteConfig.announcementLink}
              />
            )}
            <Navbar logoUrl={logoUrl} />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer logoUrl={logoUrl} />
            <CartDrawer />
            <BackToTop />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#2B1A6B",
                  color: "#fff",
                  borderRadius: "0.5rem",
                },
              }}
            />
          </AuthProvider>
        </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
