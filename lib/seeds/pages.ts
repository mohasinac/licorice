// lib/mocks/pages.ts
import type { PageDoc } from "@/lib/types";

export const SEED_PAGES: (PageDoc & { id: string })[] = [
  {
    id: "about",
    title: "About Us",
    body: `<h2>Rooted in Nature. Proven by Ayurveda.</h2>
<p>Licorice Herbals was founded with a single purpose — to bring the healing wisdom of Ayurveda into your daily ritual, without compromise.</p>
<h3>Our Mission</h3>
<p>We believe that nature already has the answers. Our products are formulated using traditional Ayurvedic recipes — time-tested over centuries — combined with modern quality standards to deliver results you can trust.</p>
<p>Every ingredient we use is selected for its proven benefit. No fillers. No artificial fragrances. No compromises.</p>
<h3>Our Promise</h3>
<ul>
<li>100% natural, Ayurvedic formulations</li>
<li>Cruelty-free — never tested on animals</li>
<li>No parabens, sulphates, or harmful chemicals</li>
<li>Made with ethically sourced herbs</li>
<li>Dermatologist reviewed formulations</li>
</ul>
<h3>What We Stand For</h3>
<p><strong>Ayurvedic Authenticity</strong> — Every formula traces its roots to classical Ayurvedic texts, adapted for modern efficacy.</p>
<p><strong>Transparency</strong> — We list every ingredient — nothing hidden. You always know what you put on your skin.</p>
<p><strong>Sustainability</strong> — Recyclable packaging, responsibly sourced raw materials, and a low-waste production process.</p>`,
    metaTitle: "About Us — Licorice Herbals",
    metaDescription:
      "Learn the story behind Licorice Herbals — our mission, our values, and our passion for pure Ayurvedic wellness.",
    updatedAt: new Date(),
  },
  {
    id: "shipping-policy",
    title: "Shipping Policy",
    body: `<h2>Shipping Policy</h2>
<p>We offer nationwide shipping across India. International shipping is not available at this time.</p>
<h3>Shipping Rates</h3>
<ul>
<li><strong>Free Shipping</strong> on orders above ₹999</li>
<li><strong>Standard Shipping:</strong> ₹80 (5–7 business days)</li>
<li><strong>Express Shipping:</strong> ₹120 (2–3 business days)</li>
<li><strong>Same-Day Delivery:</strong> ₹199 (Mumbai only)</li>
</ul>
<h3>Processing Time</h3>
<p>Orders are processed within 1–2 business days. Orders placed on weekends or holidays are processed on the next business day.</p>
<h3>Cash on Delivery</h3>
<p>COD is available on eligible orders with an additional fee of ₹50. COD availability depends on pincode serviceability.</p>
<h3>Order Tracking</h3>
<p>Once your order ships, you'll receive an email with your tracking number. You can also track your order from your account page or via our <a href="/track">Track Order</a> page.</p>`,
    metaTitle: "Shipping Policy — Licorice Herbals",
    metaDescription:
      "Free shipping above ₹999. Standard delivery in 5–7 business days. Express and same-day options available.",
    updatedAt: new Date(),
  },
  {
    id: "refund-policy",
    title: "Refund & Return Policy",
    body: `<h2>Refund & Return Policy</h2>
<h3>Return Window</h3>
<p>You may request a return within <strong>3 days</strong> of delivery for items that are damaged, defective, wrong, or expired.</p>
<h3>Eligibility</h3>
<ul>
<li>Only damaged, defective, wrong, or expired items are eligible for return</li>
<li>Products must be unused and in their original packaging</li>
<li>Photo evidence of damage is required when filing a return request</li>
</ul>
<h3>Refund Process</h3>
<p>Once your return is received and inspected, we'll process your refund within 5–7 business days. Refunds are issued to the original payment method.</p>
<h3>Replacements</h3>
<p>Replacements are dispatched within 24 hours of receiving the returned item, subject to stock availability.</p>
<h3>How to Request a Return</h3>
<p>Log in to your account, go to your order, and click "Request Return". Alternatively, contact our support team.</p>`,
    metaTitle: "Refund & Return Policy — Licorice Herbals",
    metaDescription:
      "3-day return window for damaged or defective items. Refunds processed within 5–7 business days.",
    updatedAt: new Date(),
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    body: `<h2>Terms & Conditions</h2>
<p>By using the Licorice Herbals website and purchasing our products, you agree to the following terms and conditions.</p>
<h3>General</h3>
<p>Licorice Herbals reserves the right to update these terms at any time. Continued use of the website constitutes acceptance of the updated terms.</p>
<h3>Products</h3>
<p>All products are for external use only unless specifically stated otherwise. Results may vary. Always perform a patch test before using a new product.</p>
<h3>Pricing</h3>
<p>All prices are in Indian Rupees (₹) and include applicable taxes. We reserve the right to modify prices without prior notice.</p>
<h3>Intellectual Property</h3>
<p>All content on this website — including text, images, logos, and product descriptions — is the property of Licorice Herbals and may not be reproduced without permission.</p>
<h3>Liability</h3>
<p>Licorice Herbals is not liable for any adverse reactions caused by product misuse or failure to follow usage instructions.</p>`,
    metaTitle: "Terms & Conditions — Licorice Herbals",
    metaDescription: "Terms and conditions for using the Licorice Herbals website and purchasing our products.",
    updatedAt: new Date(),
  },
  {
    id: "corporate-gifting",
    title: "Corporate Gifting",
    body: `<h2>Corporate Gifting</h2>
<p>Elevate your corporate gifting with Licorice Herbals' premium Ayurvedic wellness hampers. Perfect for employee appreciation, client gifts, festival celebrations, and corporate events.</p>
<h3>Why Choose Us</h3>
<ul>
<li>Premium, handcrafted Ayurvedic products</li>
<li>Custom branding and packaging options</li>
<li>Bulk pricing with attractive discounts</li>
<li>Pan-India delivery</li>
<li>Dedicated account manager</li>
</ul>
<h3>Popular Hamper Options</h3>
<p>Choose from our curated hampers or create a custom selection tailored to your budget and preferences. We offer hampers starting from ₹500 per unit.</p>`,
    metaTitle: "Corporate Gifting — Licorice Herbals",
    metaDescription:
      "Premium Ayurvedic corporate gifts. Custom branding, bulk pricing, pan-India delivery.",
    updatedAt: new Date(),
  },
];
