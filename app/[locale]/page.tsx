// app/[locale]/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProducts, getBlogs, getCategories, getApprovedReviews } from "@/lib/db";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BrandValues } from "@/components/home/BrandValues";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import { BlogPreview } from "@/components/home/BlogPreview";
import { NewsletterBanner } from "@/components/home/NewsletterBanner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("heroTitle"),
    description: t("heroSub"),
  };
}

export default async function HomePage() {
  const [featuredProducts, newArrivals, categories, reviews, blogs] = await Promise.all([
    getProducts({ isFeatured: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getCategories(),
    getApprovedReviews(6),
    getBlogs(undefined, 3),
  ]);

  return (
    <>
      <HeroBanner />
      <CategoryGrid categories={categories} />
      <ProductCarousel title="Bestsellers" products={featuredProducts} />
      <ProductCarousel title="New Arrivals" products={newArrivals} />
      <BrandValues />
      <BeforeAfterSlider />
      <TestimonialsCarousel reviews={reviews} />
      <BlogPreview blogs={blogs} />
      <NewsletterBanner />
    </>
  );
}
