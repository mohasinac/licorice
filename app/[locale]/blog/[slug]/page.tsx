import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { getBlog, getBlogs, getProducts } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { BlogContent } from "@/components/blog/BlogContent";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { ProductCard } from "@/components/product/ProductCard";

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.filter((b) => b.status === "published").map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Post Not Found" };
  return {
    title: blog.metaTitle ?? `${blog.title} — Licorice Herbals`,
    description: blog.metaDescription ?? blog.excerpt,
    openGraph: {
      title: blog.metaTitle ?? blog.title,
      description: blog.metaDescription ?? blog.excerpt,
      images: blog.coverImage ? [{ url: blog.coverImage }] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  const publishDate =
    blog.publishedAt instanceof Date
      ? blog.publishedAt
      : typeof blog.publishedAt?.toDate === "function"
        ? blog.publishedAt.toDate()
        : new Date();
  const readTime = estimateReadTime(blog.body);

  // Fetch related posts (exclude current)
  const allBlogs = await getBlogs(undefined, 10);
  const relatedPosts = allBlogs.filter((b) => b.id !== blog.id).slice(0, 3);

  // Fetch related products
  let relatedProducts: Awaited<ReturnType<typeof getProducts>> = [];
  if (blog.relatedProducts.length > 0) {
    const allProducts = await getProducts();
    relatedProducts = allProducts.filter((p) => blog.relatedProducts.includes(p.id));
  }

  // Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    author: { "@type": "Person", name: blog.author },
    datePublished: publishDate.toISOString(),
    image: blog.coverImage || undefined,
    description: blog.excerpt,
    publisher: {
      "@type": "Organization",
      name: "Licorice Herbals",
    },
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Cover Image */}
      <div className="bg-primary/5 relative h-64 sm:h-80 lg:h-96">
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="bg-primary/10 flex h-full items-center justify-center">
            <p className="text-muted-foreground">No cover image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back link */}
        <Link
          href={`/${locale}/blog`}
          className="text-muted-foreground hover:text-foreground mt-8 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> All Posts
        </Link>

        {/* Header */}
        <header className="mt-6">
          <Badge variant="info">{blog.category}</Badge>
          <h1 className="font-heading text-foreground mt-3 text-3xl leading-tight font-bold sm:text-4xl">
            {blog.title}
          </h1>
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishDate.toISOString()}>
                {publishDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
          </div>
        </header>

        {/* Body */}
        <article className="mt-10">
          <BlogContent html={blog.body} />
        </article>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-border mt-16 border-t pt-12">
            <h2 className="font-heading text-foreground mb-6 text-xl font-bold">
              Products Mentioned
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Related Posts */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <RelatedPosts posts={relatedPosts} />
      </div>
    </div>
  );
}
