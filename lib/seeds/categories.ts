// lib/mocks/categories.ts
import type { Category } from "@/lib/types";

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat_face",
    label: "Face Care",
    slug: "face",
    description: "Oils, serums, face washes, and sunscreens for a radiant complexion.",
    imageUrl:
      "https://images.pexels.com/photos/3762876/pexels-photo-3762876.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "cat_body",
    label: "Body Care",
    slug: "body",
    description: "Nourishing body butters and lotions for soft, glowing skin.",
    imageUrl:
      "https://images.pexels.com/photos/5240604/pexels-photo-5240604.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "cat_hair",
    label: "Hair Care",
    slug: "hair",
    description: "Topical Ayurvedic oils for strong, healthy, lustrous hair.",
    imageUrl:
      "https://images.pexels.com/photos/8467963/pexels-photo-8467963.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "cat_powder",
    label: "Powder",
    slug: "powder",
    description: "Traditional ubtans and face packs rooted in Ayurvedic wisdom.",
    imageUrl:
      "https://images.pexels.com/photos/6978040/pexels-photo-6978040.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "cat_combo",
    label: "Combo Packs",
    slug: "combo",
    description: "Curated bundles for complete Ayurvedic skincare rituals.",
    imageUrl:
      "https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "cat_supplements",
    label: "Supplements",
    slug: "supplements",
    description: "Oral Ayurvedic tablets and capsules for beauty from within.",
    imageUrl:
      "https://images.pexels.com/photos/7615621/pexels-photo-7615621.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];
