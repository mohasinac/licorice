import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { flagReview } from "@/lib/actions/reviews";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await flagReview({
    ...(body as object),
    reportedBy: user.uid,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
