import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogs } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlusCircle } from "lucide-react";
import type { BlogStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Blog Posts — Admin — Licorice Herbals" };

const TABS: { value: BlogStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

export default async function AdminBlogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab = "all" } = await searchParams;
  const activeTab = TABS.find((t) => t.value === tab) ? tab : "all";

  const blogs = await getAllBlogs(activeTab === "all" ? undefined : (activeTab as BlogStatus));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1 text-sm">{blogs.length} posts</p>
        </div>
        <Link
          href={`/${locale}/admin/blogs/new`}
          className="bg-primary text-primary-foreground hover:bg-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/${locale}/admin/blogs?tab=${t.value}`}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.value
                ? "border-primary text-primary border-b-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {blogs.length === 0 ? (
        <div className="bg-surface flex flex-col items-center rounded-2xl py-16 text-center shadow-sm">
          <p className="text-foreground font-medium">No posts found</p>
          <Link
            href={`/${locale}/admin/blogs/new`}
            className="text-primary mt-3 text-sm font-medium hover:underline"
          >
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-surface overflow-hidden rounded-2xl shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium tracking-wider uppercase">
                <th className="text-muted-foreground px-4 py-3">Title</th>
                <th className="text-muted-foreground px-4 py-3">Category</th>
                <th className="text-muted-foreground px-4 py-3">Author</th>
                <th className="text-muted-foreground px-4 py-3">Status</th>
                <th className="text-muted-foreground px-4 py-3">Date</th>
                <th className="text-muted-foreground px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => {
                const pubDate =
                  blog.publishedAt instanceof Date
                    ? blog.publishedAt
                    : blog.createdAt instanceof Date
                      ? blog.createdAt
                      : new Date();
                return (
                  <tr key={blog.id} className="hover:bg-background border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-foreground max-w-xs truncate font-medium">{blog.title}</p>
                      <p className="text-muted-foreground truncate text-xs">{blog.slug}</p>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{blog.category}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{blog.author}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={blog.status} />
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {pubDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/admin/blogs/${blog.id}`}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
