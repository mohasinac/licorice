import * as React from "react";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/constants/site";

export const metadata: Metadata = {
  title: `Our Ingredients — ${BRAND_NAME}`,
  description:
    "Discover the powerful Ayurvedic ingredients behind every Licorice Herbals product — sourced ethically, backed by tradition.",
};

const INGREDIENTS = [
  {
    name: "Licorice (Mulethi)",
    benefit: "Brightens skin, fades pigmentation, and soothes inflammation.",
    category: "Skin Brightening",
  },
  {
    name: "Kumkumadi Oil",
    benefit:
      "A legendary Ayurvedic elixir for luminous, even-toned skin with saffron and sandalwood.",
    category: "Skin Brightening",
  },
  {
    name: "Neem",
    benefit: "Potent antibacterial that clears acne, purifies pores, and controls sebum.",
    category: "Acne & Purifying",
  },
  {
    name: "Tulsi (Holy Basil)",
    benefit: "Detoxifies skin, fights bacteria, and prevents breakouts with natural antioxidants.",
    category: "Acne & Purifying",
  },
  {
    name: "Manjistha",
    benefit: "Blood-purifying herb that clears blemishes and promotes an even complexion.",
    category: "Acne & Purifying",
  },
  {
    name: "Turmeric (Haldi)",
    benefit: "Anti-inflammatory and antioxidant — evens skin tone and adds a natural glow.",
    category: "Skin Brightening",
  },
  {
    name: "Saffron (Kesar)",
    benefit: "Precious spice that brightens, fights dark circles, and enhances skin radiance.",
    category: "Skin Brightening",
  },
  {
    name: "Ashwagandha",
    benefit:
      "Adaptogenic herb that firms skin, reduces fine lines, and boosts collagen production.",
    category: "Anti-Ageing",
  },
  {
    name: "Shatavari",
    benefit: "Rejuvenating herb that hydrates deeply and supports skin elasticity.",
    category: "Anti-Ageing",
  },
  {
    name: "Bhringraj",
    benefit:
      "The 'King of Hair' — strengthens roots, reduces hair fall, and promotes thick growth.",
    category: "Hair Care",
  },
  {
    name: "Amla (Indian Gooseberry)",
    benefit: "Rich in Vitamin C — nourishes hair follicles and prevents premature greying.",
    category: "Hair Care",
  },
  {
    name: "Aloe Vera",
    benefit: "Deeply hydrating, soothing, and healing — perfect for sensitive and dry skin.",
    category: "Hydration",
  },
  {
    name: "Shea Butter",
    benefit: "Intense moisturiser rich in vitamins A and E — seals in hydration and softens skin.",
    category: "Hydration",
  },
  {
    name: "Sandalwood (Chandan)",
    benefit: "Cools and calms skin, reduces tan, and imparts a natural fragrance.",
    category: "Skin Brightening",
  },
  {
    name: "Rose Water (Gulab Jal)",
    benefit: "Natural toner that balances pH, tightens pores, and refreshes the complexion.",
    category: "Hydration",
  },
  {
    name: "Coconut Oil",
    benefit:
      "Deep conditioner for hair and skin — locks in moisture and strengthens the hair shaft.",
    category: "Hair Care",
  },
] as const;

const CATEGORIES = [...new Set(INGREDIENTS.map((i) => i.category))];

export default function IngredientsPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="ayur-hero">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            Nature&apos;s Finest
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Our Ingredients
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-lg leading-relaxed">
            Every {BRAND_NAME} product starts with time-tested Ayurvedic ingredients — ethically
            sourced, transparently listed, and proven by tradition.
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      {/* Grouped ingredients */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="mb-12 last:mb-0">
            <h2 className="font-heading text-foreground mb-6 text-2xl font-bold">{cat}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INGREDIENTS.filter((i) => i.category === cat).map((ingredient) => (
                <div
                  key={ingredient.name}
                  className="ayur-card border-border rounded-2xl border bg-white p-5"
                >
                  <h3 className="font-heading text-foreground text-base font-semibold">
                    {ingredient.name}
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {ingredient.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
