import * as React from "react";
import type { Metadata } from "next";
import { BRAND_NAME, SUPPORT_EMAIL } from "@/constants/site";

export const metadata: Metadata = {
  title: `Terms & Conditions — ${BRAND_NAME}`,
  description: `Read the Terms & Conditions governing your use of the ${BRAND_NAME} website, including product ordering, payment, shipping, and returns.`,
};

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-foreground mb-2 text-4xl font-bold">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the {BRAND_NAME} website and placing orders, you agree to be bound
            by these Terms & Conditions. If you do not agree, please do not use our website.
          </p>

          <h2>2. Products</h2>
          <p>
            All products are subject to availability. We reserve the right to discontinue any
            product at any time. Product images are for illustrative purposes; actual packaging may
            vary slightly.
          </p>

          <h2>3. Pricing</h2>
          <p>
            All prices are in Indian Rupees (INR) and inclusive of applicable taxes. We reserve the
            right to change prices without prior notice. The price at the time of order placement is
            the price charged.
          </p>

          <h2>4. Orders & Payment</h2>
          <p>
            Order confirmation is subject to payment verification. For WhatsApp payment orders,
            confirmation is sent after manual verification by our team. We reserve the right to
            cancel orders due to stock unavailability, payment issues, or suspected fraudulent
            activity.
          </p>

          <h2>5. Shipping & Delivery</h2>
          <p>
            Delivery timelines are estimates and not guaranteed. {BRAND_NAME} is not liable for
            delays caused by courier partners, natural events, or circumstances beyond our control.
          </p>

          <h2>6. Returns & Refunds</h2>
          <p>
            Please refer to our Refund & Return Policy for full details on eligible returns and the
            refund process.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, logos, and product descriptions —
            is the property of {BRAND_NAME} and may not be reproduced without written permission.
          </p>

          <h2>8. Disclaimer & Limitation of Liability</h2>
          <p>
            {BRAND_NAME} products are formulated for general skincare and wellness. Results may
            vary. Our products are not intended to diagnose, treat, cure, or prevent any medical
            condition. Consult a dermatologist for persistent skin conditions.
          </p>
          <p>
            To the maximum extent permitted by law, {BRAND_NAME} is not liable for any indirect,
            incidental, or consequential damages arising from product use or purchase.
          </p>

          <h2>9. Privacy</h2>
          <p>
            Your personal data is handled in accordance with our Privacy Policy. We do not sell or
            rent your data to third parties.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Disputes shall be subject to the
            exclusive jurisdiction of courts in Mumbai, Maharashtra.
          </p>

          <h2>11. Contact</h2>
          <p>
            For any queries regarding these terms, please email:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
