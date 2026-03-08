// app/api/admin/blogs/route.ts
// POST — create blog, PATCH — update blog (admin only)
import { NextResponse, type NextRequest } from "next/server";
import { getServerUser } from "@/lib/auth";
import { saveBlog, deleteBlog } from "@/lib/db";
import type { BlogCategory, BlogStatus } from "@/lib/types";

const VALID_CATEGORIES: BlogCategory[] = ["skincare", "hair-care", "diet-lifestyle", "ayurveda"];
const VALID_STATUSES: BlogStatus[] = ["draft", "published", "archived"];

function validatePayload(body: Record<string, unknown>) {
  if (typeof body.title !== "string" || body.title.length < 3) {
    return "Title is required (min 3 chars)";
  }
  if (typeof body.slug !== "string" || !/^[a-z0-9-]+$/.test(body.slug)) {
    return "Slug must be lowercase alphanumeric with hyphens";
  }
  if (typeof body.body !== "string" || body.body.length < 50) {
    return "Body is required (min 50 chars)";
  }
  if (
    typeof body.category !== "string" ||
    !VALID_CATEGORIES.includes(body.category as BlogCategory)
  ) {
    return "Invalid category";
  }
  if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status as BlogStatus)) {
    return "Invalid status";
  }
  if (typeof body.author !== "string" || body.author.length < 2) {
    return "Author is required";
  }
  return null;
}

export async function POST(request: NextRequest) {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const err = validatePayload(b);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const blogData = {
    title: b.title as string,
    slug: b.slug as string,
    excerpt: (b.excerpt as string) || "",
    body: b.body as string,
    coverImage: (b.coverImage as string) || "",
    author: b.author as string,
    category: b.category as BlogCategory,
    tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
    relatedProducts: Array.isArray(b.relatedProducts) ? (b.relatedProducts as string[]) : [],
    metaTitle: (b.metaTitle as string) || "",
    metaDescription: (b.metaDescription as string) || "",
    status: b.status as BlogStatus,
    publishedAt: b.publishedAt ? new Date(b.publishedAt as string) : undefined,
  };

  const id = await saveBlog(blogData);
  return NextResponse.json({ success: true, id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (typeof b.id !== "string" || !b.id) {
    return NextResponse.json({ error: "Blog ID is required for update" }, { status: 400 });
  }

  const err = validatePayload(b);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const blogData = {
    id: b.id as string,
    title: b.title as string,
    slug: b.slug as string,
    excerpt: (b.excerpt as string) || "",
    body: b.body as string,
    coverImage: (b.coverImage as string) || "",
    author: b.author as string,
    category: b.category as BlogCategory,
    tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
    relatedProducts: Array.isArray(b.relatedProducts) ? (b.relatedProducts as string[]) : [],
    metaTitle: (b.metaTitle as string) || "",
    metaDescription: (b.metaDescription as string) || "",
    status: b.status as BlogStatus,
    publishedAt: b.publishedAt ? new Date(b.publishedAt as string) : undefined,
  };

  await saveBlog(blogData);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
  }

  await deleteBlog(id);
  return NextResponse.json({ success: true });
}
