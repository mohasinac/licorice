import * as React from "react";
import type { Metadata } from "next";
import { BRAND_NAME, SUPPORT_EMAIL } from "@/constants/site";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND_NAME}`,
  description: `Learn how ${BRAND_NAME} collects, uses, and protects your personal data in accordance with Indian privacy laws.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-foreground mb-2 text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Introduction</h2>
          <p>
            {BRAND_NAME} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to
            protecting your personal information and your right to privacy. This Privacy Policy
            explains what information we collect, how we use it, and what rights you have in
            relation to it.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect information that you provide directly when you:</p>
          <ul>
            <li>Create an account or place an order</li>
            <li>Subscribe to our newsletter</li>
            <li>Book a free consultation</li>
            <li>Contact us via the contact form, email, or WhatsApp</li>
            <li>Submit a product review</li>
            <li>Submit a corporate gifting inquiry</li>
          </ul>
          <p>This may include your name, email address, phone number, shipping address, and payment details.</p>

          <h2>3. Automatically Collected Information</h2>
          <p>
            When you visit our website, we may automatically collect certain information including
            your IP address, browser type, device information, pages visited, and referring URL.
            This information is used to improve our website experience and is not linked to your
            personal identity.
          </p>

          <h2>4. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process and fulfil your orders</li>
            <li>Communicate order status, shipping updates, and delivery confirmations</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send promotional emails and newsletters (only with your consent)</li>
            <li>Improve our products, services, and website experience</li>
            <li>Prevent fraud and ensure security</li>
          </ul>

          <h2>5. Sharing Your Information</h2>
          <p>
            We do not sell, rent, or trade your personal information. We may share your data with
            trusted third parties only when necessary to:
          </p>
          <ul>
            <li>Fulfil orders (shipping partners such as Shiprocket and courier services)</li>
            <li>Process payments (Razorpay, when selected)</li>
            <li>Send transactional emails (email service providers)</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including
            encrypted connections (HTTPS), secure payment processing, and access controls. However,
            no method of transmission over the Internet is 100% secure.
          </p>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies to keep you logged in and remember your cart. We do not use
            third-party tracking cookies. You can control cookies through your browser settings.
          </p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Unsubscribe from marketing communications at any time</li>
          </ul>

          <h2>9. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed
            to provide you services. Order records are retained for accounting and legal compliance
            purposes.
          </p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 18. We do not knowingly
            collect personal information from children.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with the updated date. We encourage you to review this page periodically.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your rights,
            please contact us at:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
