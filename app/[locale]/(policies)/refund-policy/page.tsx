import * as React from "react";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/constants/site";
import { RETURN_WINDOW_DAYS, REPLACEMENT_SLA_HOURS } from "@/constants/policies";

export const metadata: Metadata = {
  title: `Refund & Return Policy — ${BRAND_NAME}`,
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-foreground mb-2 text-4xl font-bold">
          Refund & Return Policy
        </h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>Return Eligibility</h2>
          <p>
            We accept returns within <strong>{RETURN_WINDOW_DAYS} days of delivery</strong> for the
            following reasons only:
          </p>
          <ul>
            <li>Product arrived damaged or broken</li>
            <li>Wrong product was delivered</li>
            <li>Product is defective or non-functional</li>
            <li>Product is expired upon receipt</li>
          </ul>
          <p>
            We do not accept returns for change of mind, personal dislike, or incompatibility with
            skin/hair type. Please read product descriptions and consult our free consultation
            service if you are unsure.
          </p>

          <h2>How to Initiate a Return</h2>
          <ol>
            <li>
              Contact us within {RETURN_WINDOW_DAYS} days of delivery via WhatsApp or email with:
              <ul>
                <li>Your order number</li>
                <li>Photographs of the damaged / defective / wrong product</li>
                <li>Brief description of the issue</li>
              </ul>
            </li>
            <li>Our team will review and respond within 24 hours.</li>
            <li>If approved, we will arrange a reverse pickup from your address.</li>
            <li>
              Replacement or refund will be processed within{" "}
              <strong>{REPLACEMENT_SLA_HOURS} hours</strong> of receiving the returned item.
            </li>
          </ol>

          <h2>Refund Method</h2>
          <p>Refunds are processed to the original payment method:</p>
          <ul>
            <li>
              <strong>Razorpay / UPI:</strong> 5–7 business days
            </li>
            <li>
              <strong>WhatsApp Payment:</strong> Manual bank transfer within 3 business days —
              please share your bank account details
            </li>
            <li>
              <strong>Cash on Delivery:</strong> Manual bank transfer within 3 business days
            </li>
          </ul>

          <h2>Non-Returnable Items</h2>
          <p>
            For hygiene reasons, opened products are non-returnable unless they arrived damaged,
            defective, or expired.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our return policy, please reach out via WhatsApp or
            email. We are committed to resolving every issue fairly and promptly.
          </p>
        </div>
      </div>
    </div>
  );
}
