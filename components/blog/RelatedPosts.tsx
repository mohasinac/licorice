import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Blog } from "@/lib/types";

interface RelatedPostsProps {
  posts: Blog[];
}

export async function RelatedPosts({ posts }: RelatedPostsProps) {
  const locale = await getLocale();
  const t = await getTranslations("blog");

  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <SectionHeading title={t("morePosts")} align="left" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} blog={post} />
        ))}
      </div>
    </section>
  );
}
