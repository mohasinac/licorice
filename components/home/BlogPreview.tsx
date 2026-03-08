import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Blog } from "@/lib/types";

interface BlogPreviewProps {
  blogs: Blog[];
}

export async function BlogPreview({ blogs }: BlogPreviewProps) {

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between gap-4">
          <SectionHeading
            title="From the Licorice Journal"
            subtitle="Ayurvedic wisdom for modern living"
            align="left"
          />
          <Link
            href="/blog"
            className="bg-primary/5 text-primary hover:bg-primary/10 hidden shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors md:block"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/blog"
            className="bg-primary/5 text-primary hover:bg-primary/10 inline-block rounded-full px-5 py-2 text-sm font-medium transition-colors"
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
