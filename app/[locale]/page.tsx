// app/[locale]/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getProducts,
  getBlogs,
  getCategories,
  getConcerns,
  getApprovedReviews,
  getHomepageSections,
} from "@/lib/db";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BrandValues } from "@/components/home/BrandValues";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import { BlogPreview } from "@/components/home/BlogPreview";
import { NewsletterBanner } from "@/components/home/NewsletterBanner";
import { InstagramReels } from "@/components/home/InstagramReels";
import { TrustBadgesStrip } from "@/components/home/TrustBadgesStrip";
import { ConcernGrid } from "@/components/home/ConcernGrid";
import { BrandStory } from "@/components/home/BrandStory";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("heroTitle"),
    description: t("heroSub"),
  };
}

export default async function HomePage() {
  const [
    featuredProducts,
    newArrivals,
    categories,
    concerns,
    reviews,
    blogs,
    homepageSections,
    locale,
  ] = await Promise.all([
    getProducts({ isFeatured: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getCategories(),
    getConcerns(),
    getApprovedReviews(6),
    getBlogs(undefined, 3),
    getHomepageSections(),
    getLocale() as Promise<Locale>,
  ]);

  const vis = homepageSections.sectionVisibility;

  return (
    <>
      <HeroBanner config={homepageSections.heroBanner} />
      <CategoryGrid categories={categories} />
      <ProductCarousel title="Bestsellers" products={featuredProducts} />
      <ProductCarousel title="New Arrivals" products={newArrivals} />
      {vis.showConcernGrid && <ConcernGrid concerns={concerns} locale={locale} />}
      {vis.showBeforeAfter && <BeforeAfterSlider />}
      {vis.showBrandStory && <BrandStory config={homepageSections.brandStory} />}
      {vis.showBrandValues && <BrandValues values={homepageSections.brandValues} />}
      {vis.showTestimonials && <TestimonialsCarousel reviews={reviews} />}
      {vis.showInstagramReels && <InstagramReels reels={homepageSections.instagramReels} />}
      {vis.showBlog && <BlogPreview blogs={blogs} />}
      {vis.showTrustBadges && <TrustBadgesStrip badges={homepageSections.trustBadges} />}
      {vis.showNewsletter && <NewsletterBanner />}
    </>
  );
}
