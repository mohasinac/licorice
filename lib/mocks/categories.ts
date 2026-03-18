import type { Category } from "@/lib/types";

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat_face",
    type: "category",
    label: "Face Care",
    slug: "face",
    description: "Ayurvedic face oils, cleansers, and treatments for radiant skin.",
    imageUrl: "/images/categories/face.jpg",
  },
  {
    id: "cat_body",
    type: "category",
    label: "Body Care",
    slug: "body",
    description: "Nourishing body oils, lotions, and scrubs for smooth, healthy skin.",
    imageUrl: "/images/categories/body.jpg",
  },
  {
    id: "cat_hair",
    type: "category",
    label: "Hair Care",
    slug: "hair",
    description: "Herbal hair oils, shampoos, and treatments for strong, lustrous hair.",
    imageUrl: "/images/categories/hair.jpg",
  },
  {
    id: "cat_powder",
    type: "category",
    label: "Herbal Powders",
    slug: "powder",
    description: "Traditional herbal powders for face packs and hair masks.",
    imageUrl: "/images/categories/powder.jpg",
  },
  {
    id: "cat_combo",
    type: "category",
    label: "Combo Sets",
    slug: "combo",
    description: "Curated bundles of our best products at special prices.",
    imageUrl: "/images/categories/combo.jpg",
  },
];