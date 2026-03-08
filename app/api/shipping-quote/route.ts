// app/api/shipping-quote/route.ts
// Returns shipping rates — either live from Shiprocket or from configured flat rates.

import { NextRequest, NextResponse } from "next/server";
import { getShippingRules } from "@/lib/db";

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode");
  const weightStr = req.nextUrl.searchParams.get("weight"); // grams
  const cod = req.nextUrl.searchParams.get("cod") === "1";

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  const rules = await getShippingRules();
  const weight = Math.max(Number(weightStr) || 500, 1); // min 1g, default 500g

  // ── If Shiprocket live rates are enabled, fetch them ────────────────────
  const shiprocketConfigured = !!(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);

  if (rules.useShiprocketRates && shiprocketConfigured) {
    try {
      const { checkServiceability } = await import("@/lib/shiprocket");
      const result = await checkServiceability(pincode, weight, cod);

      if (!result.available) {
        return NextResponse.json({
          source: "shiprocket",
          serviceable: false,
          rates: [],
        });
      }

      return NextResponse.json({
        source: "shiprocket",
        serviceable: true,
        codAvailable: result.codAvailable,
        etaDays: result.etaDays,
        rates:
          result.couriers?.map((c) => ({
            courierId: c.id,
            courierName: c.name,
            rate: c.rate,
            etd: c.etd,
          })) ?? [],
      });
    } catch (err) {
      console.warn("[shipping-quote] Shiprocket call failed — falling back to flat rates", err);
      // Fall through to flat rates below
    }
  }

  // ── Flat rates from settings ────────────────────────────────────────────
  const rates: { mode: string; label: string; rate: number; sla: string }[] = [
    {
      mode: "standard",
      label: "Standard Delivery",
      rate: rules.standardRate,
      sla: rules.standardSla ?? "5-7 business days",
    },
  ];

  if (rules.expressEnabled && rules.expressRate) {
    rates.push({
      mode: "express",
      label: "Express Delivery",
      rate: rules.expressRate,
      sla: rules.expressSla ?? "2-3 business days",
    });
  }

  if (rules.sameDayEnabled && rules.sameDayRate) {
    const sameDayCities = rules.sameDayCities ?? [];
    // Simple pincode prefix check for same-day cities
    const isSameDayPincode =
      sameDayCities.length === 0 ||
      sameDayCities.some((city) => {
        // Mumbai: 400xxx / 401xxx
        if (city.toLowerCase() === "mumbai") return /^40[01]/.test(pincode);
        return false;
      });

    if (isSameDayPincode) {
      rates.push({
        mode: "same_day",
        label: "Same Day Delivery",
        rate: rules.sameDayRate,
        sla: rules.sameDaySla ?? "Same day",
      });
    }
  }

  return NextResponse.json({
    source: "flat",
    serviceable: true,
    codAvailable: rules.codEnabled,
    rates,
    freeShippingThreshold: rules.freeShippingThreshold,
  });
}
