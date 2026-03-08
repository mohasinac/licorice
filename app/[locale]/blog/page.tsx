import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getBlogs } from "@/lib/db";
import { BlogCard } from "@/components/blog/BlogCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BlogCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog — Licorice Herbals",
  description:
    "Ayurvedic skincare tips, hair care guides, diet advice, and wellness wisdom from Licorice Herbals.",
};

const CATEGORY_TABS: { value: BlogCategory | "all"; label: string }[] = [
  { value: "all", label: "All Posts" },
  { value: "skincare", label: "Skincare" },
  { value: "hair-care", label: "Hair Care" },
  { value: "diet-lifestyle", label: "Diet & Lifestyle" },
  { value: "ayurveda", label: "Ayurveda" },
];

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");
  const { category } = await searchParams;

  const activeCategory = CATEGORY_TABS.find((t) => t.value === category)
    ? (category as BlogCategory)
    : undefined;

  const blogs = await getBlogs(activeCategory);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="ayur-hero">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-accent mb-3 text-sm font-semibold tracking-widest uppercase">
            {t("theJournal")}
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            {t("licoriceHerbalsBlog")}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {t("blogSubtitle")}
          </p>
          <hr className="ayur-divider mt-8 w-32" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category tabs */}
        <div className="mb-10 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive =
              tab.value === "all" ? !activeCategory : tab.value === activeCategory;
            return (
              <Link
                key={tab.value}
                href={
                  tab.value === "all"
                    ? `/${locale}/blog`
                    : `/${locale}/blog?category=${tab.value}`
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-foreground font-medium">No posts found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Check back soon for new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
