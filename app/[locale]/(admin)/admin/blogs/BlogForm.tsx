"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Blog, BlogCategory, BlogStatus } from "@/lib/types";

const CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "skincare", label: "Skincare" },
  { value: "hair-care", label: "Hair Care" },
  { value: "diet-lifestyle", label: "Diet & Lifestyle" },
  { value: "ayurveda", label: "Ayurveda" },
];

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().min(10, "Excerpt is required (min 10 chars)").max(300),
  body: z.string().min(50, "Body is required (min 50 chars)"),
  coverImage: z.string().optional(),
  author: z.string().min(2, "Author is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  relatedProducts: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface BlogFormProps {
  blog?: Blog;
  locale: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export function BlogForm({ blog, locale }: BlogFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      excerpt: blog?.excerpt ?? "",
      body: blog?.body ?? "",
      coverImage: blog?.coverImage ?? "",
      author: blog?.author ?? "",
      category: blog?.category ?? "skincare",
      tags: blog?.tags?.join(", ") ?? "",
      relatedProducts: blog?.relatedProducts?.join(", ") ?? "",
      metaTitle: blog?.metaTitle ?? "",
      metaDescription: blog?.metaDescription ?? "",
      status: blog?.status ?? "draft",
      publishedAt: blog?.publishedAt
        ? (blog.publishedAt instanceof Date ? blog.publishedAt : new Date())
            .toISOString()
            .split("T")[0]
        : "",
    },
  });

  const titleValue = watch("title");

  function autoSlug() {
    if (!blog) {
      setValue("slug", slugify(titleValue));
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const payload = {
        id: blog?.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage ?? "",
        author: data.author,
        category: data.category,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        relatedProducts: data.relatedProducts
          ? data.relatedProducts
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        metaTitle: data.metaTitle ?? "",
        metaDescription: data.metaDescription ?? "",
        status: data.status,
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      };

      const res = await fetch(`/api/admin/blogs`, {
        method: blog ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save");
      }

      toast.success(blog ? "Post updated" : "Post created");
      router.push(`/${locale}/admin/blogs`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Title"
          placeholder="Blog post title"
          error={errors.title?.message}
          {...register("title", { onBlur: autoSlug })}
        />
        <Input
          label="Slug"
          placeholder="url-friendly-slug"
          error={errors.slug?.message}
          {...register("slug")}
        />
      </div>

      {/* Excerpt */}
      <Textarea
        label="Excerpt"
        placeholder="Short summary (shown on cards)"
        rows={2}
        error={errors.excerpt?.message}
        {...register("excerpt")}
      />

      {/* Body */}
      <div>
        <label className="text-foreground mb-1.5 block text-sm font-medium">Body (HTML)</label>
        <textarea
          className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 font-mono text-sm"
          rows={16}
          placeholder="<h2>...</h2><p>...</p>"
          {...register("body")}
        />
        {errors.body?.message && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
      </div>

      {/* Category + Author */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">Category</label>
          <select
            className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-sm"
            {...register("category")}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
        <Input
          label="Author"
          placeholder="Dr. Priya Sharma"
          error={errors.author?.message}
          {...register("author")}
        />
      </div>

      {/* Cover Image */}
      <Input
        label="Cover Image URL"
        placeholder="/images/blog/cover.jpg"
        error={errors.coverImage?.message}
        {...register("coverImage")}
      />

      {/* Tags + Related Products */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Tags (comma-separated)"
          placeholder="skincare, ayurveda, kumkumadi"
          error={errors.tags?.message}
          {...register("tags")}
        />
        <Input
          label="Related Product IDs (comma-separated)"
          placeholder="prod_kumkumadi_oil, prod_vitamin_c_serum"
          error={errors.relatedProducts?.message}
          {...register("relatedProducts")}
        />
      </div>

      {/* SEO */}
      <div className="border-border rounded-xl border p-4">
        <p className="text-foreground mb-3 text-sm font-semibold">SEO</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Meta Title"
            placeholder="Custom page title"
            error={errors.metaTitle?.message}
            {...register("metaTitle")}
          />
          <Input
            label="Meta Description"
            placeholder="Custom page description"
            error={errors.metaDescription?.message}
            {...register("metaDescription")}
          />
        </div>
      </div>

      {/* Status + Publish Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">Status</label>
          <select
            className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-sm"
            {...register("status")}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Input
          label="Publish Date"
          type="date"
          error={errors.publishedAt?.message}
          {...register("publishedAt")}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/blogs`)}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {blog ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
