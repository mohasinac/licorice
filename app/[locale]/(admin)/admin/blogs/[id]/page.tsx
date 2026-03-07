import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogById } from "@/lib/db";
import { BlogForm } from "../BlogForm";

export const metadata: Metadata = { title: "Edit Blog Post — Admin — Licorice Herbals" };

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const blog = await getBlogById(id);
  if (!blog) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-foreground mb-6 text-2xl font-bold">Edit Blog Post</h1>
      <BlogForm blog={blog} locale={locale} />
    </div>
  );
}
