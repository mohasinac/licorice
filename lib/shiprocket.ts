// lib/shiprocket.ts
// Shiprocket API integration helpers.
// All functions are server-side only — never import in client components.

import type { Order } from "@/lib/types";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

export interface ShiprocketTokenCache {
  token: string;
  expiresAt: Date;
}

// ── Token management ──────────────────────────────────────────────────────────

/**
 * Get a valid Shiprocket JWT — fetches from /api/shiprocket/token which
 * handles Firestore caching and lazy refresh.
 */
export async function getToken(): Promise<string> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${appUrl}/api/shiprocket/token`, {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Failed to get Shiprocket token: ${res.status}`);
  }

  const data = await res.json();
  return data.token as string;
}

// ── Serviceability ────────────────────────────────────────────────────────────

export interface ServiceabilityResult {
  available: boolean;
  codAvailable: boolean;
  etaDays?: number;
  couriers?: Array<{ id: number; name: string; rate: number; etd: string }>;
}

export async function checkServiceability(
  pincode: string,
  weight: number,
  cod = false,
): Promise<ServiceabilityResult> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  // Mock mode — always serviceable
  if (!email || !password) {
    return { available: true, codAvailable: true, etaDays: 5 };
  }

  try {
    const token = await getToken();
    const params = new URLSearchParams({
      pickup_postcode: "400001", // default pickup (Mumbai)
      delivery_postcode: pincode,
      weight: String(weight / 1000), // grams → kg
      cod: cod ? "1" : "0",
    });

    const res = await fetch(`${SHIPROCKET_BASE}/courier/serviceability/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { available: false, codAvailable: false };

    const data = await res.json();
    const recommended = data?.data?.available_courier_companies ?? [];
    const codCouriers = recommended.filter((c: { cod: number }) => c.cod === 1);

    return {
      available: recommended.length > 0,
      codAvailable: codCouriers.length > 0,
      etaDays: recommended[0]?.estimated_delivery_days,
      couriers: recommended
        .slice(0, 5)
        .map((c: { id: number; courier_name: string; rate: number; etd: string }) => ({
          id: c.id,
          name: c.courier_name,
          rate: c.rate,
          etd: c.etd,
        })),
    };
  } catch {
    return { available: true, codAvailable: true, etaDays: 5 }; // fail-open
  }
}

// ── Shipment creation ─────────────────────────────────────────────────────────

export interface ShipmentResult {
  shiprocketOrderId: string;
  shiprocketShipmentId: string;
  awbCode?: string;
  courierName?: string;
  courierTrackingUrl?: string;
}

export async function createShipment(order: Order): Promise<ShipmentResult> {
  const token = await getToken();

  const pickupAddress = {
    pickup_location: "Primary",
  };

  const payload = {
    order_id: order.orderNumber,
    order_date: formatDate(order.createdAt),
    pickup_location: pickupAddress.pickup_location,
    channel_id: process.env.SHIPROCKET_CHANNEL_ID ?? "",
    billing_customer_name: order.billingAddress.name,
    billing_last_name: "",
    billing_address: order.billingAddress.line1,
    billing_address_2: order.billingAddress.line2 ?? "",
    billing_city: order.billingAddress.city,
    billing_pincode: order.billingAddress.pincode,
    billing_state: order.billingAddress.state,
    billing_country: "India",
    billing_email: order.guestEmail ?? "",
    billing_phone: order.billingAddress.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.variantId,
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    shipping_charges: order.shippingCharge,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: order.discount,
    sub_total: order.subtotal,
    length: 10,
    breadth: 10,
    height: 10,
    weight: order.items.reduce(
      (sum, item) => sum + item.quantity * 0.3, // fallback 300g per item
      0,
    ),
  };

  const res = await fetch(`${SHIPROCKET_BASE}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shiprocket create shipment failed: ${res.status} ${err}`);
  }

  const data = await res.json();

  return {
    shiprocketOrderId: String(data.order_id ?? ""),
    shiprocketShipmentId: String(data.shipment_id ?? ""),
    awbCode: data.awb_code ? String(data.awb_code) : undefined,
    courierName: data.courier_name,
    courierTrackingUrl: data.awb_code
      ? `https://shiprocket.co/tracking/${data.awb_code}`
      : undefined,
  };
}

// ── Shipment cancellation ─────────────────────────────────────────────────────

export async function cancelShipment(shiprocketOrderId: string): Promise<void> {
  if (!process.env.SHIPROCKET_EMAIL) return; // mock mode

  const token = await getToken();

  const res = await fetch(`${SHIPROCKET_BASE}/orders/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shiprocket cancel failed: ${res.status} ${err}`);
  }
}

// ── Tracking ──────────────────────────────────────────────────────────────────

export interface TrackingEvent {
  status: string;
  activity: string;
  date: string;
  location: string;
}

export interface TrackingResult {
  awbCode: string;
  courierName: string;
  currentStatus: string;
  expectedDeliveryDate?: string;
  events: TrackingEvent[];
}

export async function trackByAwb(awb: string): Promise<TrackingResult | null> {
  if (!process.env.SHIPROCKET_EMAIL) {
    // Mock response for dev
    return {
      awbCode: awb,
      courierName: "BlueDart",
      currentStatus: "In Transit",
      expectedDeliveryDate: "2026-03-12",
      events: [
        {
          status: "Picked Up",
          activity: "Shipment picked up",
          date: "2026-03-08",
          location: "Mumbai",
        },
        {
          status: "In Transit",
          activity: "In transit to destination",
          date: "2026-03-09",
          location: "Pune",
        },
      ],
    };
  }

  try {
    const token = await getToken();
    const res = await fetch(`${SHIPROCKET_BASE}/courier/track/awb/${awb}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const tracking = data?.tracking_data;

    if (!tracking) return null;

    const events: TrackingEvent[] = (tracking.shipment_track_activities ?? []).map(
      (a: { status: string; activity: string; date: string; location: string }) => ({
        status: a.status,
        activity: a.activity,
        date: a.date,
        location: a.location ?? "",
      }),
    );

    return {
      awbCode: awb,
      courierName: tracking.shipment_track?.[0]?.courier_name ?? "",
      currentStatus: tracking.shipment_track?.[0]?.current_status ?? "",
      expectedDeliveryDate: tracking.shipment_track?.[0]?.edd,
      events,
    };
  } catch {
    return null;
  }
}

// ── Return shipment ───────────────────────────────────────────────────────────

export interface ReturnShipmentResult {
  returnShipmentId: string;
  awbCode?: string;
}

/**
 * Initiate a return pick-up via Shiprocket.
 * Requires the original shipment_id stored on the order.
 * In mock mode (no SHIPROCKET_EMAIL env) returns a fake result without API call.
 */
export async function createReturnShipment(
  shiprocketShipmentId: string,
): Promise<ReturnShipmentResult> {
  if (!process.env.SHIPROCKET_EMAIL) {
    // Mock mode — return fake IDs for development
    return {
      returnShipmentId: `mock-return-${Date.now()}`,
      awbCode: undefined,
    };
  }

  const token = await getToken();

  const res = await fetch(`${SHIPROCKET_BASE}/orders/return`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shipment_id: shiprocketShipmentId,
      // Shiprocket picks up at the delivery address and ships back to pickup origin
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shiprocket create return failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    returnShipmentId: String(data.shipment_id ?? data.return_shipment_id ?? ""),
    awbCode: data.awb_code ? String(data.awb_code) : undefined,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val: unknown): string {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  }
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  if (typeof val === "object" && "toDate" in (val as object)) {
    return (val as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

// ── Webhook HMAC validation ───────────────────────────────────────────────────

export function validateWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) return false; // misconfigured — safe reject

  const { createHmac } = require("crypto") as typeof import("crypto");
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}

// ── Status mapping ────────────────────────────────────────────────────────────

/**
 * Map Shiprocket event status strings to internal OrderStatus values.
 * Returns null for unknown / uninteresting statuses.
 */
export function mapShiprocketStatus(status: string): {
  orderStatus: import("@/lib/types").OrderStatus;
  description: string;
} | null {
  const s = status.toLowerCase();

  if (s.includes("pickup") || s.includes("picked up")) {
    return { orderStatus: "shipped", description: "Shipment picked up by courier" };
  }
  if (s.includes("in transit") || s.includes("transit")) {
    return { orderStatus: "shipped", description: `In transit: ${status}` };
  }
  if (s.includes("out for delivery")) {
    return { orderStatus: "out_for_delivery", description: "Out for delivery" };
  }
  if (s.includes("delivered")) {
    return { orderStatus: "delivered", description: "Order delivered successfully" };
  }
  if (s.includes("rto") || s.includes("return to origin")) {
    return { orderStatus: "return_picked_up", description: `Return initiated: ${status}` };
  }
  if (s.includes("cancelled") || s.includes("canceled")) {
    return { orderStatus: "cancelled", description: "Shipment cancelled by courier" };
  }

  return null; // ignore unknown statuses
}
