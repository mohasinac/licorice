// constants/categories.ts

export interface CategoryDef {
  id: string;
  label: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface ConcernDef {
  id: string;
  label: string;
  slug: string;
  description: string;
  icon?: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "cat_face",
    label: "Face Care",
    slug: "face",
    description: "Oils, serums, face washes, and sunscreens for a radiant complexion.",
  },
  {
    id: "cat_body",
    label: "Body Care",
    slug: "body",
    description: "Nourishing body butters and lotions for soft, glowing skin.",
  },
  {
    id: "cat_hair",
    label: "Hair Care",
    slug: "hair",
    description: "Topical Ayurvedic oils for strong, healthy, lustrous hair.",
  },
  {
    id: "cat_powder",
    label: "Powder",
    slug: "powder",
    description: "Traditional ubtans and face packs rooted in Ayurvedic wisdom.",
  },
  {
    id: "cat_combo",
    label: "Combo Packs",
    slug: "combo",
    description: "Curated bundles for complete Ayurvedic skincare rituals.",
  },
  {
    id: "cat_supplements",
    label: "Supplements",
    slug: "supplements",
    description: "Oral Ayurvedic tablets and capsules for beauty from within.",
  },
];

export const CONCERNS: ConcernDef[] = [
  {
    id: "concern_acne",
    label: "Acne & Pimples",
    slug: "pimples-open-pores",
    description:
      "Ayurvedic formulations with neem, tulsi, and manjistha to clear breakouts and reduce open pores.",
  },
  {
    id: "concern_pigmentation",
    label: "Pigmentation & Melasma",
    slug: "pigmentation-melasma",
    description:
      "Licorice, kojic acid, and saffron-powered blends to fade dark patches and even skin tone.",
  },
  {
    id: "concern_brightening",
    label: "Brightening",
    slug: "brightening",
    description: "Kumkumadi oil, Vitamin C, and turmeric for a luminous, lit-from-within glow.",
  },
  {
    id: "concern_anti_ageing",
    label: "Anti-Ageing",
    slug: "anti-ageing",
    description: "Ashwagandha, shatavari, and potent oils to firm skin and reduce fine lines.",
  },
  {
    id: "concern_tanning",
    label: "Tanning",
    slug: "tanning",
    description:
      "SPF-based and de-tan formulas to reverse sun damage and restore your natural skin tone.",
  },
  {
    id: "concern_dryness",
    label: "Dryness & Dull Skin",
    slug: "dryness",
    description: "Deep-moisturising butters, oils, and creams with shea, almond, and aloe vera.",
  },
  {
    id: "concern_hair_care",
    label: "Hair Fall & Dandruff",
    slug: "hair-care",
    description:
      "Bhringraj, amla, and Kesh-care formulas to strengthen roots and reduce hair fall.",
  },
  {
    id: "concern_blemishes",
    label: "Blemishes & Dark Spots",
    slug: "blemishes-dark-spots",
    description: "Targeted serums and oils to fade post-acne marks and hyperpigmentation.",
  },
];
