// app/api/pincode-check/route.ts
// Checks Shiprocket serviceability for a given pincode.
// Falls back to "always serviceable" in mock / dev mode.

import { NextRequest, NextResponse } from "next/server";

const MUMBAI_PINCODES_PREFIX = ["400", "401"];

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode");
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  // Mock/dev mode — always serviceable
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const shiprocketConfigured = !!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);

  if (useMock || !shiprocketConfigured) {
    const isMumbai = MUMBAI_PINCODES_PREFIX.some((p) => pincode.startsWith(p));
    return NextResponse.json({
      serviceable: true,
      eta: "5–7 business days",
      codAvailable: true,
      sameDayAvailable: isMumbai,
    });
  }

  try {
    // Fetch Shiprocket JWT token
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/shiprocket/token`);
    if (!tokenRes.ok) throw new Error("Could not obtain Shiprocket token");
    const { token } = (await tokenRes.json()) as { token: string };

    // Call Shiprocket serviceability API
    const checkRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=400001&delivery_postcode=${pincode}&cod=1&weight=0.5`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!checkRes.ok) throw new Error("Shiprocket serviceability check failed");
    const checkData = (await checkRes.json()) as {
      data?: { available_courier_companies?: { cod?: number; estimated_delivery_days?: number }[] };
    };

    const couriers = checkData.data?.available_courier_companies ?? [];
    const serviceable = couriers.length > 0;
    const codAvailable = couriers.some((c) => c.cod === 1);
    const etaDays = couriers.map((c) => c.estimated_delivery_days ?? 99);
    const minEta = etaDays.length > 0 ? Math.min(...etaDays) : 99;

    return NextResponse.json({
      serviceable,
      eta: serviceable ? `${minEta}–${minEta + 2} business days` : undefined,
      codAvailable,
      sameDayAvailable: false,
    });
  } catch (err) {
    console.warn("[pincode-check] Shiprocket call failed — falling back to mock", err);
    return NextResponse.json({
      serviceable: true,
      eta: "5–7 business days",
      codAvailable: true,
      sameDayAvailable: false,
    });
  }
}
