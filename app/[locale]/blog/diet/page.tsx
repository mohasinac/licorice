import type { Metadata } from "next";
import Link from "next/link";
import { getBlogs } from "@/lib/db";
import { BlogCard } from "@/components/blog/BlogCard";

export const metadata: Metadata = {
  title: "Diet & Lifestyle — Licorice Herbals Blog",
  description:
    "Ayurvedic diet tips, lifestyle advice, and holistic wellness guides from Licorice Herbals.",
};

export default async function DietBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const blogs = await getBlogs("diet-lifestyle");

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="bg-primary/5 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-primary mb-2 text-sm font-semibold tracking-widest uppercase">
            Wellness
          </p>
          <h1 className="font-heading text-foreground text-4xl font-bold">Diet & Lifestyle</h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Ayurvedic nutrition and lifestyle practices for glowing skin and strong hair.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/blog`}
            className="text-primary text-sm font-medium hover:underline"
          >
            ← All Blog Posts
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-foreground font-medium">No diet & lifestyle posts yet</p>
            <p className="text-muted-foreground mt-1 text-sm">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
