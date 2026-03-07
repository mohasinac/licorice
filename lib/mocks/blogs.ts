// lib/mocks/blogs.ts
import type { Blog } from "@/lib/types";

const now = new Date();

export const SEED_BLOGS: Blog[] = [
  {
    id: "blog_kumkumadi_benefits",
    slug: "7-reasons-kumkumadi-oil-ayurvedas-best-kept-secret",
    title: "7 Reasons Kumkumadi Oil Is Ayurveda's Best-Kept Secret",
    excerpt:
      "Used in royal Ayurvedic courts for centuries, Kumkumadi oil is making a powerful comeback. Here's why every skincare lover needs it.",
    body: `<h2>What is Kumkumadi Oil?</h2>
<p>Kumkumadi Tailam is an ancient Ayurvedic formulation first described in the Ashtanga Hridaya, one of the oldest texts of Ayurvedic medicine. The name itself means "saffron oil" in Sanskrit — Kumkuma being saffron.</p>
<h2>1. Potent Brightening from Saffron</h2>
<p>Saffron (Crocus sativus) contains <strong>crocin and crocetin</strong>, compounds proven to inhibit melanin synthesis. Regular use noticeably brightens dull skin and reduces hyperpigmentation.</p>
<h2>2. Anti-Ageing with Natural Actives</h2>
<p>The oil is loaded with herbs like Manjishtha, Yashtimadhu, and Chandana — all of which have documented anti-oxidant and collagen-stimulating properties.</p>
<h2>3. Fades Pigmentation and Dark Spots</h2>
<p>Yashtimadhu (Licorice root) contains glabridin, a proven skin-brightening compound that inhibits tyrosinase, the enzyme responsible for dark spot formation.</p>
<h2>4. Works for All Skin Types</h2>
<p>Despite being an oil, Kumkumadi is non-comedogenic in small quantities. Sesame oil, the base carrier, has a comedogenic rating of 0-1 — making it safe for acne-prone skin.</p>
<h2>5. Ayurvedic Approval Across Centuries</h2>
<p>Unlike many modern actives, Kumkumadi has centuries of recorded use with a proven safety profile.</p>
<h2>6. Ritual Over Routine</h2>
<p>There's something deeply grounding about a 5-minute facial oil massage. The ritual itself reduces cortisol and boosts skin circulation.</p>
<h2>7. The Numbers Don't Lie</h2>
<p>In a 12-week independent study, participants using Kumkumadi oil showed 34% improvement in skin brightness and 28% reduction in hyperpigmentation scores.</p>`,
    coverImage: "/images/blog/kumkumadi-oil-blog.jpg",
    author: "Dr. Priya Sharma",
    category: "skincare",
    tags: ["kumkumadi", "face oil", "ayurveda", "brightening"],
    status: "published",
    relatedProducts: ["prod_kumkumadi_oil"],
    metaTitle: "7 Reasons Kumkumadi Oil Is Ayurveda's Best-Kept Secret | Licorice Herbals",
    metaDescription:
      "Discover why Kumkumadi oil has been Ayurveda's beauty secret for centuries — from brightening to anti-ageing.",
    publishedAt: new Date("2026-02-15"),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "blog_ubtan_guide",
    slug: "how-to-use-ubtan-for-glowing-skin-at-home",
    title: "How to Use Ubtan for Glowing Skin at Home",
    excerpt:
      "The ancient bridal beauty ritual is now accessible to everyone. Learn how to use ubtan correctly for maximum glow and even skin tone.",
    body: `<h2>What is Ubtan?</h2>
<p>Ubtan is a traditional Indian face and body mask made from natural ingredients like turmeric, sandalwood, gram flour, and saffron. Historically the bridal ritual, today it's accessible to everyone as a weekly skin treatment.</p>
<h2>How to Mix Ubtan</h2>
<p>The key is the liquid you mix it with:</p>
<ul>
<li><strong>For brightening:</strong> Mix with raw milk</li>
<li><strong>For oily/acne-prone skin:</strong> Mix with rose water or plain water</li>
<li><strong>For dry skin:</strong> Mix with curd or almond milk</li>
<li><strong>For extra glow:</strong> Mix with a few drops of honey</li>
</ul>
<h2>Step-by-Step Guide</h2>
<ol>
<li>Take 1 tablespoon of Licorice Brightening Ubtan in a clean bowl.</li>
<li>Add liquid slowly and mix to a smooth, spreadable paste.</li>
<li>Apply with fingertips or a brush in upward strokes.</li>
<li>Leave for 15–20 minutes until semi-dry.</li>
<li>With damp fingers, gently rotate in small circles to exfoliate.</li>
<li>Rinse with lukewarm water.</li>
<li>Follow with your favourite serum and moisturiser.</li>
</ol>`,
    coverImage: "/images/blog/ubtan-guide-blog.jpg",
    author: "Kavita Nair",
    category: "skincare",
    tags: ["ubtan", "face mask", "brightening", "natural beauty"],
    status: "published",
    relatedProducts: ["prod_brightening_ubtan"],
    metaTitle: "How to Use Ubtan for Glowing Skin at Home | Licorice Herbals",
    metaDescription:
      "A complete guide to using ubtan — the ancient Ayurvedic face mask — for brightening, de-tanning, and glowing skin.",
    publishedAt: new Date("2026-02-28"),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "blog_ayurvedic_hair",
    slug: "ayurvedic-guide-to-healthy-strong-hair",
    title: "The Ayurvedic Guide to Healthy, Strong Hair",
    excerpt:
      "From oiling rituals to diet, Ayurveda has a holistic approach to hair health. Here's everything you need to know.",
    body: `<h2>The Ayurvedic View of Hair Health</h2>
<p>In Ayurveda, healthy hair is a reflection of balanced doshas and good overall health. Hair fall is often linked to excess Pitta (heat), nutritional deficiencies, and chronic stress.</p>
<h2>The Power of Hair Oiling (Abhyanga)</h2>
<p>Scalp oiling, or Kesh Abhyanga in Sanskrit, is a cornerstone practice. The benefits go beyond conditioning:</p>
<ul>
<li>Improves blood circulation to hair follicles</li>
<li>Reduces stress through the massage action</li>
<li>Nourishes the scalp microbiome</li>
</ul>
<h2>Top 5 Ayurvedic Herbs for Hair</h2>
<h3>1. Bhringraj — The King of Hair Herbs</h3>
<p>Bhringraj stimulates blood flow to the scalp and has been shown to perform comparably to Minoxidil in some studies for hair growth stimulation.</p>
<h3>2. Amla — The Vitamin C Powerhouse</h3>
<p>Indian gooseberry is among the richest natural sources of Vitamin C, essential for collagen synthesis in the hair follicle.</p>
<h3>3. Brahmi — The Scalp Soother</h3>
<p>Brahmi (Bacopa monnieri) calms the nervous system and directly reduces stress-related hair fall.</p>
<h3>4. Neem</h3>
<p>Neem's anti-fungal properties keep the scalp healthy and free of dandruff.</p>
<h3>5. Methi (Fenugreek)</h3>
<p>Rich in proteins and nicotinic acid — strengthens the hair shaft and adds shine.</p>
<h2>Inside Out: Diet for Hair Health</h2>
<p>No topical treatment works to its full potential without adequate nutrition. Key nutrients for hair growth: Protein (keratin building block), Iron (carries oxygen to follicles), Zinc, Biotin, and Vitamin D.</p>`,
    coverImage: "/images/blog/ayurvedic-hair-blog.jpg",
    author: "Dr. Priya Sharma",
    category: "hair-care",
    tags: ["hair care", "ayurveda", "bhringraj", "hair fall"],
    status: "published",
    relatedProducts: ["prod_hair_repair_oil", "prod_keshli_tablets"],
    metaTitle: "The Ayurvedic Guide to Healthy, Strong Hair | Licorice Herbals",
    metaDescription:
      "Discover Ayurvedic secrets for strong, healthy hair — from oiling rituals and herbs to diet tips for hair growth.",
    publishedAt: new Date("2026-03-01"),
    createdAt: now,
    updatedAt: now,
  },
];
