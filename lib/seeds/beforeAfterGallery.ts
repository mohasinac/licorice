import type { BeforeAfterItem } from "@/lib/db";

export const SEED_BEFORE_AFTER: (BeforeAfterItem & { id: string })[] = [
  {
    id: "ba_1",
    beforeImage: "/images/placeholder-before.webp",
    afterImage: "/images/placeholder-after.webp",
    productId: "prod_kumkumadi_oil",
    caption: "4 weeks of Kumkumadi Oil — visible glow & reduced pigmentation",
    sortOrder: 1,
  },
  {
    id: "ba_2",
    beforeImage: "/images/placeholder-before.webp",
    afterImage: "/images/placeholder-after.webp",
    productId: "prod_vitamin_c_serum",
    caption: "6 weeks with Vitamin C Serum — dark spots faded noticeably",
    sortOrder: 2,
  },
  {
    id: "ba_3",
    beforeImage: "/images/placeholder-before.webp",
    afterImage: "/images/placeholder-after.webp",
    caption: "8 weeks of consistent Ayurvedic routine — clearer, even-toned skin",
    sortOrder: 3,
  },
];
