import { Metadata } from "next";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import { TrackForm } from "./TrackForm";
import { getOrder, getOrderTimeline } from "@/lib/db";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { trackByAwb } from "@/lib/shiprocket";
import type { Timestamp } from "firebase-admin/firestore";

export const metadata: Metadata = {
  title: "Track Your Order — Licorice Herbals",
  description: "Enter your order ID or AWB number to track your Licorice Herbals order.",
};

function formatDate(val: Timestamp | Date | undefined): string {
  if (!val) return "—";
  const d = val instanceof Date ? val : (val as unknown as { toDate: () => Date }).toDate?.();
  return d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; awb?: string; email?: string }>;
}

export default async function TrackPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId, awb, email } = await searchParams;

  // No query yet — show form only
  if (!orderId && !awb) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <Package className="text-primary mx-auto mb-4 h-12 w-12" />
          <h1 className="font-heading text-foreground text-3xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">
            Enter your Order ID or AWB tracking number to see the latest status.
          </p>
        </div>
        <TrackForm />
      </div>
    );
  }

  // Attempt to look up order by orderId first
  let order = null;
  let timeline: Awaited<ReturnType<typeof getOrderTimeline>> = [];
  let trackingData: Awaited<ReturnType<typeof trackByAwb>> = null;
  let awbToUse = awb ?? "";

  if (orderId) {
    order = await getOrder(orderId);
    if (order) {
      // Verify email for guest/public access
      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = email.trim().replace(/\D/g, "");
        const emailMatches =
          order.guestEmail?.toLowerCase() === normalizedEmail ||
          order.shippingAddress?.phone?.replace(/\D/g, "") === normalizedPhone;
        if (!emailMatches) {
          order = null; // hide order if email doesn&apos;t match
        }
      }
      if (order) {
        timeline = await getOrderTimeline(orderId);
        awbToUse = order.awbCode ?? order.manualAwbCode ?? "";
      }
    }
  } else if (awb) {
    // Look up by AWB
    awbToUse = awb;
    // We can only get live tracking — no Firestore lookup without orderId
  }

  // Fetch live Shiprocket tracking if we have an AWB
  if (awbToUse) {
    trackingData = await trackByAwb(awbToUse).catch(() => null);
  }

  const notFound = !order && !trackingData;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header with search form */}
      <div className="mb-8">
        <h1 className="font-heading text-foreground mb-4 text-2xl font-bold">Track Order</h1>
        <TrackForm
          initialOrderId={orderId}
          initialAwb={awb}
          initialEmail={email}
        />
      </div>

      {notFound ? (
        <div className="bg-surface rounded-2xl p-8 text-center shadow-sm">
          <Search className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
          <h2 className="text-foreground font-semibold">Order Not Found</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            We couldn&apos;t find an order matching the details you entered. Please check and try again.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="text-primary mt-4 inline-block text-sm hover:underline"
          >
            Contact Support
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order summary card */}
          {order && (
            <section className="bg-surface rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-foreground text-xl font-bold">
                    {order.orderNumber}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    Placed {formatDate(order.createdAt as Timestamp | Date)}
                  </p>
                </div>
                <StatusBadge status={order.orderStatus} type="order" />
              </div>

              {/* Items summary */}
              <div className="border-border mt-4 border-t pt-4">
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.variantLabel} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping info */}
              {(order.courierName || order.manualCourierName || awbToUse) && (
                <div className="border-border mt-4 border-t pt-4">
                  <div className="text-sm">
                    {(order.courierName || order.manualCourierName) && (
                      <p className="text-muted-foreground">
                        Courier:{" "}
                        <span className="text-foreground font-medium">
                          {order.courierName ?? order.manualCourierName}
                        </span>
                      </p>
                    )}
                    {awbToUse && (
                      <p className="text-muted-foreground mt-0.5">
                        AWB:{" "}
                        <span className="text-foreground font-mono text-xs font-medium">
                          {awbToUse}
                        </span>
                      </p>
                    )}
                    {order.courierTrackingUrl && (
                      <a
                        href={order.courierTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary mt-1 inline-block text-sm hover:underline"
                      >
                        Track on courier website ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Live tracking from Shiprocket */}
          {trackingData && (
            <section className="bg-surface rounded-2xl p-5 shadow-sm">
              <h3 className="text-foreground mb-1 font-semibold">
                Live Tracking — {trackingData.courierName}
              </h3>
              {trackingData.expectedDeliveryDate && (
                <p className="text-muted-foreground mb-4 text-sm">
                  Expected delivery:{" "}
                  <span className="text-foreground font-medium">
                    {trackingData.expectedDeliveryDate}
                  </span>
                </p>
              )}
              {trackingData.events.length > 0 ? (
                <ol className="space-y-4">
                  {trackingData.events.map((event, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <div className="bg-primary/20 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
                      <div>
                        <p className="text-foreground font-medium">{event.status}</p>
                        {event.activity && event.activity !== event.status && (
                          <p className="text-muted-foreground">{event.activity}</p>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {event.date} {event.location ? `· ${event.location}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground text-sm">No tracking events yet.</p>
              )}
            </section>
          )}

          {/* Firestore timeline (from webhook-stored events) */}
          {timeline.length > 0 && (
            <section className="bg-surface rounded-2xl p-5 shadow-sm">
              <h3 className="text-foreground mb-4 font-semibold">Order History</h3>
              <OrderTimeline events={timeline} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
