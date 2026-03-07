import * as React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/db";
import { getLocalizedValue } from "@/lib/i18n";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductImages } from "@/components/product/ProductImages";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductBadges } from "@/components/product/ProductBadges";
import { ProductTabs } from "@/components/product/ProductTabs";
import { BuyMoreSaveMore } from "@/components/product/BuyMoreSaveMore";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const name = getLocalizedValue(product.name, locale);
  const description = getLocalizedValue(
    product.metaDescription ?? product.shortDescription,
    locale,
  );
  const image = product.images[0];

  return {
    title: getLocalizedValue(product.metaTitle ?? product.name, locale),
    description,
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image, width: 800, height: 800, alt: name }] : undefined,
    },
  };
}

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const name = getLocalizedValue(product.name, locale);
  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1) + " Care";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: product.images,
    description: getLocalizedValue(product.shortDescription, locale),
    brand: { "@type": "Brand", name: "Licorice Herbals" },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      price: v.price,
      priceCurrency: "INR",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      sku: v.sku,
    })),
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Home", href: `/${locale}` },
              { label: "Shop", href: `/${locale}/shop` },
              { label: categoryLabel, href: `/${locale}/shop/${product.category}` },
              { label: name },
            ]}
            className="mb-6"
          />

          {/* Product hero: images + info */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <ProductImages images={product.images} productName={name} />
            <ProductInfo product={product} />
          </div>

          {/* Certifications */}
          {product.certifications.length > 0 && (
            <div className="mt-8">
              <ProductBadges certifications={product.certifications} />
            </div>
          )}

          {/* Buy More Save More */}
          {product.upsellProducts.length > 0 && (
            <div className="mt-10">
              <BuyMoreSaveMore upsellProductIds={product.upsellProducts} currentProduct={product} />
            </div>
          )}

          {/* Tabs — benefits, ingredients, how to use, FAQs */}
          <div className="mt-12">
            <ProductTabs product={product} />
          </div>

          {/* Full description */}
          <div className="mt-10">
            <SectionHeading title="About This Product" className="mb-4" />
            <div
              className="prose prose-slate max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: getLocalizedValue(product.description, locale),
              }}
            />
          </div>

          {/* Reviews placeholder section */}
          <div id="reviews" className="mt-14 scroll-mt-20">
            <SectionHeading
              title="Customer Reviews"
              subtitle={`${product.reviewCount} reviews · ${product.rating.toFixed(1)} / 5`}
              className="mb-6"
            />
            <p className="text-muted-foreground text-sm italic">
              Review display coming in Phase 5.
            </p>
          </div>

          {/* Related products */}
          {product.relatedProducts.length > 0 && (
            <div className="mt-14">
              <React.Suspense fallback={null}>
                <RelatedProducts
                  relatedIds={product.relatedProducts}
                  currentProductId={product.id}
                />
              </React.Suspense>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
