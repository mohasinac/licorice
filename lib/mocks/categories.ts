// lib/mocks/categories.ts
import type { Category } from "@/lib/types";

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat_face",
    label: "Face Care",
    slug: "face",
    description: "Oils, serums, face washes, and sunscreens for a radiant complexion.",
    imageUrl: "/images/categories/face.jpg",
  },
  {
    id: "cat_body",
    label: "Body Care",
    slug: "body",
    description: "Nourishing body butters and lotions for soft, glowing skin.",
    imageUrl: "/images/categories/body.jpg",
  },
  {
    id: "cat_hair",
    label: "Hair Care",
    slug: "hair",
    description: "Topical Ayurvedic oils for strong, healthy, lustrous hair.",
    imageUrl: "/images/categories/hair.jpg",
  },
  {
    id: "cat_powder",
    label: "Powder",
    slug: "powder",
    description: "Traditional ubtans and face packs rooted in Ayurvedic wisdom.",
    imageUrl: "/images/categories/powder.jpg",
  },
  {
    id: "cat_combo",
    label: "Combo Packs",
    slug: "combo",
    description: "Curated bundles for complete Ayurvedic skincare rituals.",
    imageUrl: "/images/categories/combo.jpg",
  },
  {
    id: "cat_supplements",
    label: "Supplements",
    slug: "supplements",
    description: "Oral Ayurvedic tablets and capsules for beauty from within.",
    imageUrl: "/images/categories/supplements.jpg",
  },
];
