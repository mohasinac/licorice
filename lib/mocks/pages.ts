// lib/mocks/pages.ts
import type { PageDoc } from "@/lib/types";

const now = new Date();

export const SEED_PAGES: (PageDoc & { id: string })[] = [
  {
    id: "about",
    title: "About Us",
    body: `<h2>Our Story</h2>
<p>Licorice Herbals was born from a simple belief — nature already has the answers. Founded by a team of Ayurveda enthusiasts and modern cosmetic scientists, we bridge ancient botanical wisdom with pharmaceutical-grade quality control.</p>
<h2>Our Mission</h2>
<p>We believe that effective skincare and hair care should be honest, natural, and accessible. Every ingredient in our products is selected for its proven Ayurvedic benefit — no fillers, no artificial fragrances, no compromises.</p>
<h2>Our Promise</h2>
<ul>
<li>100% natural, Ayurvedic formulations</li>
<li>Cruelty-free — never tested on animals</li>
<li>No parabens, sulphates, or harmful chemicals</li>
<li>Made with ethically sourced herbs</li>
<li>Dermatologist reviewed formulations</li>
</ul>`,
    metaDescription:
      "Learn the story behind Licorice Herbals — our mission, our values, and our passion for pure Ayurvedic wellness.",
    updatedAt: now,
  },
  {
    id: "shipping-policy",
    title: "Shipping Policy",
    body: `<h2>Shipping & Delivery</h2>
<p>We ship across India. Orders are processed within 1-2 business days.</p>
<ul>
<li><strong>Standard Delivery:</strong> 5-7 business days — ₹80 (Free above ₹999)</li>
<li><strong>Express Delivery:</strong> 2-3 business days — ₹120</li>
<li><strong>Same-Day Delivery:</strong> Available in Mumbai — ₹199</li>
</ul>
<p>Tracking details are shared via email and WhatsApp once your order is shipped.</p>`,
    metaDescription: "Learn about Licorice Herbals shipping options, delivery timelines, and charges.",
    updatedAt: now,
  },
  {
    id: "refund-policy",
    title: "Refund & Return Policy",
    body: `<h2>Returns</h2>
<p>If you're not satisfied, you may request a return within 7 days of delivery for unopened products in original packaging.</p>
<h2>Refunds</h2>
<p>Refunds are processed within 5-7 business days after we receive the returned item. The refund is credited to the original payment method.</p>
<p>Cash-on-delivery orders are refunded via bank transfer.</p>`,
    metaDescription: "Licorice Herbals refund and return policy — hassle-free returns within 7 days.",
    updatedAt: now,
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    body: `<h2>Terms of Service</h2>
<p>By using the Licorice Herbals website, you agree to these terms. Please read carefully.</p>
<p>All content on this website is the property of Licorice Herbals and is protected by copyright. Products are subject to availability. Prices may change without notice.</p>
<p>For questions about these terms, contact us at support@licoriceherbal.in.</p>`,
    metaDescription: "Terms and conditions for using the Licorice Herbals website and purchasing products.",
    updatedAt: now,
  },
  {
    id: "corporate-gifting",
    title: "Corporate Gifting",
    body: `<h2>Corporate Gifting by Licorice Herbals</h2>
<p>Celebrate your team, clients, and partners with premium Ayurvedic gift sets curated by Licorice Herbals.</p>
<h3>Why Choose Us</h3>
<ul>
<li>Customisable gift sets for any budget</li>
<li>Branded packaging with your company logo</li>
<li>Bulk discounts starting at 25 units</li>
<li>Pan-India delivery</li>
</ul>
<p>Contact us at corporate@licoriceherbal.in for a custom quote.</p>`,
    metaDescription: "Premium corporate gifting solutions from Licorice Herbals — customizable Ayurvedic gift sets.",
    updatedAt: now,
  },
];
