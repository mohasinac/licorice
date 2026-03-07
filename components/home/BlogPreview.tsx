import Link from "next/link";
import { getLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Blog } from "@/lib/types";

interface BlogPreviewProps {
  blogs: Blog[];
}

export async function BlogPreview({ blogs }: BlogPreviewProps) {
  const locale = await getLocale();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeading
            title="From the Licorice Journal"
            subtitle="Ayurvedic wisdom for modern living"
            align="left"
          />
          <Link
            href={`/${locale}/blog`}
            className="text-primary hidden shrink-0 text-sm font-medium hover:underline md:block"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href={`/${locale}/blog`}
            className="text-primary text-sm font-medium hover:underline"
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
