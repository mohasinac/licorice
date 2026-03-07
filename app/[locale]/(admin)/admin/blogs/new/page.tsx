import type { Metadata } from "next";
import { BlogForm } from "../BlogForm";

export const metadata: Metadata = { title: "New Blog Post — Admin — Licorice Herbals" };

export default async function NewBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-foreground mb-6 text-2xl font-bold">New Blog Post</h1>
      <BlogForm locale={locale} />
    </div>
  );
}
