// lib/mocks/testimonials.ts
import type { Testimonial } from "@/lib/types";

const now = new Date();

export const SEED_TESTIMONIALS: (Testimonial & { id: string })[] = [
  {
    id: "test_1",
    customerName: "Priya Menon",
    city: "Mumbai",
    rating: 5,
    text: "The Kumkumadi Oil has completely transformed my skin. The glow is real and visible within weeks!",
    productId: "prod_kumkumadi_oil",
    isActive: true,
    sortOrder: 1,
    createdAt: now,
  },
  {
    id: "test_2",
    customerName: "Ananya Reddy",
    city: "Hyderabad",
    rating: 5,
    text: "I've tried many Vitamin C serums before — this one is the gentlest and most effective. No irritation, just results.",
    productId: "prod_vitamin_c_serum",
    isActive: true,
    sortOrder: 2,
    createdAt: now,
  },
  {
    id: "test_3",
    customerName: "Sneha Kulkarni",
    city: "Pune",
    rating: 4,
    text: "The Neem Face Wash keeps my skin clear without stripping moisture. Love it!",
    productId: "prod_neem_face_wash",
    isActive: true,
    sortOrder: 3,
    createdAt: now,
  },
  {
    id: "test_4",
    customerName: "Ritu Sharma",
    city: "Delhi",
    rating: 5,
    text: "My hair fall has reduced noticeably after using the Hair Repair Oil for a month. Highly recommend.",
    productId: "prod_hair_repair_oil",
    isActive: true,
    sortOrder: 4,
    createdAt: now,
  },
  {
    id: "test_5",
    customerName: "Meera Nair",
    city: "Kochi",
    rating: 5,
    text: "Loved the consultation experience. Dr. Sharma recommended the perfect routine for my skin type.",
    isActive: true,
    sortOrder: 5,
    createdAt: now,
  },
];
