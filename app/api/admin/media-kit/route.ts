import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveMediaKitFile, deleteMediaKitFile } from "@/lib/db";
import type { MediaKitCategory } from "@/lib/types";

const VALID_CATEGORIES: MediaKitCategory[] = [
  "logo",
  "brand-guide",
  "press-release",
  "product-images",
  "other",
];

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
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

  if (typeof b.title !== "string" || b.title.length < 2) {
    return NextResponse.json({ error: "Title is required (min 2 chars)" }, { status: 400 });
  }
  if (typeof b.fileUrl !== "string" || !b.fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }
  if (typeof b.fileName !== "string" || !b.fileName) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }
  if (
    typeof b.category !== "string" ||
    !VALID_CATEGORIES.includes(b.category as MediaKitCategory)
  ) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const id = await saveMediaKitFile({
      title: b.title as string,
      description: (b.description as string) || "",
      fileUrl: b.fileUrl as string,
      fileName: b.fileName as string,
      fileSize: typeof b.fileSize === "number" ? b.fileSize : 0,
      mimeType: (b.mimeType as string) || "application/octet-stream",
      category: b.category as MediaKitCategory,
      sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
      isActive: b.isActive !== false,
    });
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save media kit file" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);
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
    return NextResponse.json({ error: "ID is required for update" }, { status: 400 });
  }
  if (typeof b.title !== "string" || b.title.length < 2) {
    return NextResponse.json({ error: "Title is required (min 2 chars)" }, { status: 400 });
  }
  if (typeof b.fileUrl !== "string" || !b.fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }
  if (
    typeof b.category !== "string" ||
    !VALID_CATEGORIES.includes(b.category as MediaKitCategory)
  ) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    await saveMediaKitFile({
      id: b.id as string,
      title: b.title as string,
      description: (b.description as string) || "",
      fileUrl: b.fileUrl as string,
      fileName: (b.fileName as string) || "",
      fileSize: typeof b.fileSize === "number" ? b.fileSize : 0,
      mimeType: (b.mimeType as string) || "application/octet-stream",
      category: b.category as MediaKitCategory,
      sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
      isActive: b.isActive !== false,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update media kit file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await deleteMediaKitFile(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete media kit file" }, { status: 500 });
  }
}
