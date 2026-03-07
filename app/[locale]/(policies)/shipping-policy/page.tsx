import * as React from "react";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/constants/site";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_RATE,
  COD_FEE,
  STANDARD_SLA,
  EXPRESS_SLA,
  SAME_DAY_SLA,
  PROCESSING_DAYS,
} from "@/constants/policies";

export const metadata: Metadata = {
  title: `Shipping Policy — ${BRAND_NAME}`,
};

function formatPrice(n: number) {
  return `₹${n}`;
}

export default function ShippingPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-foreground mb-2 text-4xl font-bold">Shipping Policy</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>Delivery Coverage</h2>
          <p>
            We ship all across India. International shipping is not available at this time. All
            orders are fulfilled from our warehouse and shipped via trusted courier partners.
          </p>

          <h2>Processing Time</h2>
          <p>
            Orders are processed within <strong>{PROCESSING_DAYS} business days</strong> of payment
            confirmation. Orders placed on weekends or public holidays are processed on the next
            working day.
          </p>

          <h2>Shipping Rates & SLA</h2>
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>SLA</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Standard</td>
                <td>{STANDARD_SLA}</td>
                <td>
                  Free above {formatPrice(FREE_SHIPPING_THRESHOLD)} · otherwise{" "}
                  {formatPrice(STANDARD_SHIPPING_RATE)}
                </td>
              </tr>
              <tr>
                <td>Express</td>
                <td>{EXPRESS_SLA}</td>
                <td>Calculated at checkout based on weight & destination</td>
              </tr>
              <tr>
                <td>Same Day (Mumbai only)</td>
                <td>{SAME_DAY_SLA}</td>
                <td>Calculated at checkout</td>
              </tr>
            </tbody>
          </table>

          <h2>Cash on Delivery (COD)</h2>
          <p>
            COD is available on eligible orders with a nominal fee of{" "}
            <strong>{formatPrice(COD_FEE)}</strong>. COD availability may vary by pincode and is
            shown at checkout after you enter your delivery address.
          </p>

          <h2>Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive a tracking number via email. You can also
            track your order at <strong>Track Order</strong> using your Order ID or AWB number.
          </p>

          <h2>Delivery Attempt & Failed Delivery</h2>
          <p>
            Our courier partners make up to 3 delivery attempts. If the parcel is undeliverable, it
            will be returned to our warehouse and we will contact you to reschedule.
          </p>

          <h2>Damaged in Transit</h2>
          <p>
            If your package arrives damaged, please photograph the parcel and product before opening
            and contact us within 24 hours of delivery. We will arrange a replacement immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
