// constants/categories.ts
// Concerns, collections, and brands are all categories — unified by CategoryType.

import type { CategoryType } from "@/lib/types";

export interface CategoryDef {
  id: string;
  type: CategoryType;
  label: string;
  slug: string;
  description: string;
  icon?: string;
}

/** @deprecated Use CategoryDef — ConcernDef is the same shape. */
export type ConcernDef = CategoryDef;

export const CATEGORIES: CategoryDef[] = [
  {
    id: "cat_face",
    type: "category",
    label: "Face Care",
    slug: "face",
    description: "Oils, serums, face washes, and sunscreens for a radiant complexion.",
  },
  {
    id: "cat_body",
    type: "category",
    label: "Body Care",
    slug: "body",
    description: "Nourishing body butters and lotions for soft, glowing skin.",
  },
  {
    id: "cat_hair",
    type: "category",
    label: "Hair Care",
    slug: "hair",
    description: "Topical Ayurvedic oils for strong, healthy, lustrous hair.",
  },
  {
    id: "cat_powder",
    type: "category",
    label: "Powder",
    slug: "powder",
    description: "Traditional ubtans and face packs rooted in Ayurvedic wisdom.",
  },
  {
    id: "cat_combo",
    type: "category",
    label: "Combo Packs",
    slug: "combo",
    description: "Curated bundles for complete Ayurvedic skincare rituals.",
  },
  {
    id: "cat_supplements",
    type: "category",
    label: "Supplements",
    slug: "supplements",
    description: "Oral Ayurvedic tablets and capsules for beauty from within.",
  },
];

export const CONCERNS: CategoryDef[] = [
  {
    id: "concern_acne",
    type: "concern",
    label: "Acne & Pimples",
    slug: "pimples-open-pores",
    description:
      "Ayurvedic formulations with neem, tulsi, and manjistha to clear breakouts and reduce open pores.",
  },
  {
    id: "concern_pigmentation",
    type: "concern",
    label: "Pigmentation & Melasma",
    slug: "pigmentation-melasma",
    description:
      "Licorice, kojic acid, and saffron-powered blends to fade dark patches and even skin tone.",
  },
  {
    id: "concern_brightening",
    type: "concern",
    label: "Brightening",
    slug: "brightening",
    description: "Kumkumadi oil, Vitamin C, and turmeric for a luminous, lit-from-within glow.",
  },
  {
    id: "concern_anti_ageing",
    type: "concern",
    label: "Anti-Ageing",
    slug: "anti-ageing",
    description: "Ashwagandha, shatavari, and potent oils to firm skin and reduce fine lines.",
  },
  {
    id: "concern_tanning",
    type: "concern",
    label: "Tanning",
    slug: "tanning",
    description:
      "SPF-based and de-tan formulas to reverse sun damage and restore your natural skin tone.",
  },
  {
    id: "concern_dryness",
    type: "concern",
    label: "Dryness & Dull Skin",
    slug: "dryness",
    description: "Deep-moisturising butters, oils, and creams with shea, almond, and aloe vera.",
  },
  {
    id: "concern_hair_care",
    type: "concern",
    label: "Hair Fall & Dandruff",
    slug: "hair-care",
    description:
      "Bhringraj, amla, and Kesh-care formulas to strengthen roots and reduce hair fall.",
  },
  {
    id: "concern_blemishes",
    type: "concern",
    label: "Blemishes & Dark Spots",
    slug: "blemishes-dark-spots",
    description: "Targeted serums and oils to fade post-acne marks and hyperpigmentation.",
  },
];
