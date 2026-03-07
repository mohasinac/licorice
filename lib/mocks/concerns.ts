import type { Concern } from "@/lib/types";

export const SEED_CONCERNS: Concern[] = [
  {
    id: "con_pigmentation",
    label: "Pigmentation",
    slug: "pigmentation",
    description: "Dark spots, uneven skin tone, and hyperpigmentation.",
    imageUrl: "/images/concerns/pigmentation.jpg",
  },
  {
    id: "con_acne",
    label: "Acne & Pimples",
    slug: "acne",
    description: "Breakouts, clogged pores, and blemish-prone skin.",
    imageUrl: "/images/concerns/acne.jpg",
  },
  {
    id: "con_hair_fall",
    label: "Hair Fall",
    slug: "hair-fall",
    description: "Thinning hair, excessive shedding, and weak roots.",
    imageUrl: "/images/concerns/hair-fall.jpg",
  },
  {
    id: "con_dull_skin",
    label: "Dull Skin",
    slug: "dull-skin",
    description: "Lack of natural glow and tired-looking complexion.",
    imageUrl: "/images/concerns/dull-skin.jpg",
  },
  {
    id: "con_dryness",
    label: "Dryness",
    slug: "dryness",
    description: "Dry, flaky skin that needs deep hydration.",
    imageUrl: "/images/concerns/dryness.jpg",
  },
  {
    id: "con_dandruff",
    label: "Dandruff",
    slug: "dandruff",
    description: "Flaky, itchy scalp and persistent dandruff.",
    imageUrl: "/images/concerns/dandruff.jpg",
  },
  {
    id: "con_anti_ageing",
    label: "Anti-Ageing",
    slug: "anti-ageing",
    description: "Fine lines, wrinkles, and loss of skin elasticity.",
    imageUrl: "/images/concerns/anti-ageing.jpg",
  },
];
