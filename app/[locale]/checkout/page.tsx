// app/[locale]/checkout/page.tsx
import { Metadata } from "next";
import { getPaymentSettings, getShippingRules } from "@/lib/db";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [paymentSettings, shippingRules] = await Promise.all([
    getPaymentSettings(),
    getShippingRules(),
  ]);
  return (
    <CheckoutClient
      paymentSettings={paymentSettings}
      gstPercent={shippingRules.gstPercent ?? 0}
      gstIncluded={shippingRules.gstIncluded ?? true}
      useShiprocketRates={shippingRules.useShiprocketRates ?? false}
    />
  );
}
