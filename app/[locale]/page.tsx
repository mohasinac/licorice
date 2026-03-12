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
  getActivePromoBanners,
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
import { PromoBannerStrip } from "@/components/product/PromoBannerStrip";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://licoriceherbal.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("heroTitle"),
    description: t("heroSub"),
    openGraph: {
      images: [{ url: "/logo.png", width: 512, height: 512, alt: "Licorice Herbals" }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        "en-IN": `${BASE_URL}/en`,
        "hi-IN": `${BASE_URL}/hi`,
        "mr-IN": `${BASE_URL}/mr`,
        "x-default": `${BASE_URL}/en`,
      },
    },
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
    promoBanners,
  ] = await Promise.all([
    getProducts({ isFeatured: true, limit: 8 }),
    getProducts({ limit: 8 }),
    getCategories(),
    getConcerns(),
    getApprovedReviews(6),
    getBlogs(undefined, 3),
    getHomepageSections(),
    getLocale() as Promise<Locale>,
    getActivePromoBanners(),
  ]);

  const vis = homepageSections.sectionVisibility;

  return (
    <>
      <HeroBanner config={homepageSections.heroBanner} />
      {promoBanners.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <PromoBannerStrip banners={promoBanners} />
        </section>
      )}
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
