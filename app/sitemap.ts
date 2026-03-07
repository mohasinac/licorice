import type { MetadataRoute } from "next";
import { getProducts, getBlogs, getCategories, getConcerns } from "@/lib/db";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://licoriceherbal.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogs, categories, concerns] = await Promise.all([
    getProducts({ limit: 500 }),
    getBlogs(undefined, 100),
    getCategories(),
    getConcerns(),
  ]);

  const locales = routing.locales;
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ["", "/about", "/shop", "/consultation", "/contact", "/blog", "/combos", "/corporate-gifting"];
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.7,
      });
    }
  }

  // Product pages
  for (const product of products) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: product.updatedAt instanceof Date ? product.updatedAt : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // Blog pages
  for (const blog of blogs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${blog.slug}`,
        lastModified: blog.updatedAt instanceof Date ? blog.updatedAt : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Category pages
  for (const cat of categories) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/shop/${cat.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Concern pages
  for (const concern of concerns) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/concern/${concern.slug}`,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  // Policy pages
  const policyPages = ["/shipping-policy", "/refund-policy", "/terms"];
  for (const page of policyPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        changeFrequency: "monthly",
        priority: 0.3,
      });
    }
  }

  return entries;
}
