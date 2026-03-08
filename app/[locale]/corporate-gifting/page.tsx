import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CorporateGiftingForm } from "./CorporateGiftingForm";

export const metadata: Metadata = {
  title: "Corporate Gifting — Licorice Herbals",
  description:
    "Gift premium Ayurvedic products to your team and clients. Custom branding, volume discounts, curated sets.",
};

export default function CorporateGiftingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="ayur-hero">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            For Businesses
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Corporate Gifting
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Thoughtful, premium Ayurvedic gifts that make an impression — for your team, clients,
            and special occasions.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <CorporateGiftingForm />
      </div>
    </div>
  );
}
