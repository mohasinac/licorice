import { NextResponse, type NextRequest } from "next/server";
import { incrementMediaKitDownload } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (typeof b.id !== "string" || !b.id) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  try {
    await incrementMediaKitDownload(b.id as string);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 });
  }
}
