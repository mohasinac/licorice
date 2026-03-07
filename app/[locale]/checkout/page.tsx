// app/[locale]/checkout/page.tsx
import { Metadata } from "next";
import { getPaymentSettings } from "@/lib/db";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const paymentSettings = await getPaymentSettings();
  return <CheckoutClient paymentSettings={paymentSettings} />;
}
