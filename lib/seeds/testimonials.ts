// lib/mocks/testimonials.ts
import type { Testimonial } from "@/lib/types";

const now = new Date();

export const SEED_TESTIMONIALS: (Testimonial & { id: string })[] = [
  {
    id: "test_1",
    customerName: "Priya Sharma",
    city: "Mumbai",
    rating: 5,
    text: "The Kumkumadi Oil has completely transformed my skin. I've been using it for 3 months and the glow is unreal. My pigmentation has faded significantly!",
    productId: "prod_kumkumadi_oil",
    isActive: true,
    sortOrder: 1,
    createdAt: now,
  },
  {
    id: "test_2",
    customerName: "Ananya Patel",
    city: "Ahmedabad",
    rating: 5,
    text: "I was sceptical about Ayurvedic products but Licorice Herbals changed my mind. The Vitamin C Serum is lightweight and actually works. My dark spots have reduced noticeably.",
    productId: "prod_vitamin_c_serum",
    isActive: true,
    sortOrder: 2,
    createdAt: now,
  },
  {
    id: "test_3",
    customerName: "Rahul Deshmukh",
    city: "Pune",
    rating: 4,
    text: "The Keshli tablets have helped reduce my hair fall drastically in just 6 weeks. Highly recommend for anyone dealing with hair thinning.",
    productId: "prod_keshli_tablets",
    isActive: true,
    sortOrder: 3,
    createdAt: now,
  },
  {
    id: "test_4",
    customerName: "Sneha Nair",
    city: "Bangalore",
    rating: 5,
    text: "The Brightening Ubtan is my holy grail! I use it twice a week and my skin has never looked better. It's gentle yet effective — true Ayurvedic magic.",
    isActive: true,
    sortOrder: 4,
    createdAt: now,
  },
  {
    id: "test_5",
    customerName: "Meera Joshi",
    city: "Delhi",
    rating: 5,
    text: "I love the entire range. The packaging is beautiful, the products smell amazing, and most importantly — they deliver results. Finally a brand I can trust.",
    isActive: true,
    sortOrder: 5,
    createdAt: now,
  },
];
