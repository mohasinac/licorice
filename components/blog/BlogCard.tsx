import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getLocalizedValue } from "@/lib/i18n";
import type { Blog, Locale } from "@/lib/types";

interface BlogCardProps {
  blog: Blog;
}

export async function BlogCard({ blog }: BlogCardProps) {
  const locale = (await getLocale()) as Locale;
  const title = getLocalizedValue(blog.title, locale);
  const excerpt = getLocalizedValue(blog.excerpt, locale);

  const publishDate = blog.publishedAt instanceof Date ? blog.publishedAt : new Date();

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="ayur-card group border-border flex flex-col overflow-hidden rounded-2xl border bg-white"
    >
      {/* Thumbnail */}
      <div className="bg-surface relative aspect-video overflow-hidden">
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-surface text-muted-foreground flex h-full items-center justify-center">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Badge variant="info">{blog.category}</Badge>
        <h3 className="font-heading text-foreground group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">{excerpt}</p>
        <div className="text-muted-foreground mt-auto flex items-center gap-1.5 pt-2 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={publishDate.toISOString()}>
            {publishDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
      </div>
    </Link>
  );
}
