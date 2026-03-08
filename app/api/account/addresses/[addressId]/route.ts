import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { addressId } = await params;
  if (!addressId) return NextResponse.json({ error: "Missing addressId" }, { status: 400 });

  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("users").doc(user.uid).collection("addresses").doc(addressId).delete();

  return NextResponse.json({ ok: true });
}
