// app/[locale]/layout.tsx
import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: {
      default: "Licorice Herbals — Pure Ayurvedic Skincare",
      template: "%s | Licorice Herbals",
    },
    description: t("heroSub"),
    openGraph: {
      siteName: "Licorice Herbals",
      locale: locale === "hi" ? "hi_IN" : locale === "mr" ? "mr_IN" : "en_IN",
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

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {siteConfig.announcementText && (
              <AnnouncementBar
                text={siteConfig.announcementText}
                link={siteConfig.announcementLink}
              />
            )}
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
            <CartDrawer />
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
      </body>
    </html>
  );
}
