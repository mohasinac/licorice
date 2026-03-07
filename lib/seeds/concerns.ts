// lib/mocks/concerns.ts
import type { Concern } from "@/lib/types";

export const SEED_CONCERNS: Concern[] = [
  {
    id: "concern_acne",
    label: "Acne & Pimples",
    slug: "pimples-open-pores",
    description:
      "Ayurvedic formulations with neem, tulsi, and manjistha to clear breakouts and reduce open pores.",
    imageUrl: "/images/concerns/acne.jpg",
  },
  {
    id: "concern_pigmentation",
    label: "Pigmentation & Melasma",
    slug: "pigmentation-melasma",
    description:
      "Licorice, kojic acid, and saffron-powered blends to fade dark patches and even skin tone.",
    imageUrl: "/images/concerns/pigmentation.jpg",
  },
  {
    id: "concern_brightening",
    label: "Brightening",
    slug: "brightening",
    description: "Kumkumadi oil, Vitamin C, and turmeric for a luminous, lit-from-within glow.",
    imageUrl: "/images/concerns/brightening.jpg",
  },
  {
    id: "concern_anti_ageing",
    label: "Anti-Ageing",
    slug: "anti-ageing",
    description: "Ashwagandha, shatavari, and potent oils to firm skin and reduce fine lines.",
    imageUrl: "/images/concerns/anti-ageing.jpg",
  },
  {
    id: "concern_tanning",
    label: "Tanning",
    slug: "tanning",
    description:
      "SPF-based and de-tan formulas to reverse sun damage and restore your natural skin tone.",
    imageUrl: "/images/concerns/tanning.jpg",
  },
  {
    id: "concern_dryness",
    label: "Dryness & Dull Skin",
    slug: "dryness",
    description: "Deep-moisturising butters, oils, and creams with shea, almond, and aloe vera.",
    imageUrl: "/images/concerns/dryness.jpg",
  },
  {
    id: "concern_hair_care",
    label: "Hair Fall & Dandruff",
    slug: "hair-care",
    description:
      "Bhringraj, amla, and Kesh-care formulas to strengthen roots and reduce hair fall.",
    imageUrl: "/images/concerns/hair-care.jpg",
  },
  {
    id: "concern_blemishes",
    label: "Blemishes & Dark Spots",
    slug: "blemishes-dark-spots",
    description: "Targeted serums and oils to fade post-acne marks and hyperpigmentation.",
    imageUrl: "/images/concerns/blemishes.jpg",
  },
];
