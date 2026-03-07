import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserAddresses, saveUserAddress } from "@/lib/db";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
  country: z.string().default("India"),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await getUserAddresses(user.uid);
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const id = await saveUserAddress(user.uid, parsed.data);
  return NextResponse.json({ id });
}
