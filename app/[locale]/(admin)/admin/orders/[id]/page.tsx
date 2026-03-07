import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrder, getOrderTimeline } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { WhatsAppPaymentConfirm } from "@/components/admin/WhatsAppPaymentConfirm";
import { AdminOrderActions } from "./AdminOrderActions";
import type { Timestamp } from "firebase-admin/firestore";

export const metadata: Metadata = { title: "Order Detail — Admin" };

function formatDate(val: Timestamp | Date | undefined): string {
  if (!val) return "—";
  const d = val instanceof Date ? val : (val as unknown as { toDate: () => Date }).toDate?.();
  return d ? d.toLocaleString("en-IN") : "—";
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const [order, timeline] = await Promise.all([getOrder(id), getOrderTimeline(id)]);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Orders
        </Link>
        <h1 className="font-heading text-foreground text-2xl font-bold">{order.orderNumber}</h1>
        <StatusBadge status={order.orderStatus} type="order" />
        <StatusBadge status={order.paymentStatus} type="payment" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-4 font-semibold">Items</h2>
            <div className="divide-border divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-muted-foreground text-xs">{item.variantLabel}</p>
                    )}
                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-foreground shrink-0 text-sm font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-border mt-4 space-y-1 border-t pt-4 text-sm">
              <div className="text-muted-foreground flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>−₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="text-muted-foreground flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shippingCharge === 0 ? "Free" : `₹${order.shippingCharge.toFixed(2)}`}
                </span>
              </div>
              {order.codFee > 0 && (
                <div className="text-muted-foreground flex justify-between">
                  <span>COD Fee</span>
                  <span>₹{order.codFee.toFixed(2)}</span>
                </div>
              )}
              <div className="text-foreground flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* WhatsApp payment confirmation */}
          {order.paymentMethod === "whatsapp" && order.paymentStatus !== "paid" && (
            <section className="bg-surface rounded-2xl p-5 shadow-sm">
              <h2 className="text-foreground mb-4 font-semibold">WhatsApp Payment</h2>
              <WhatsAppPaymentConfirm
                orderId={order.id}
                orderNumber={order.orderNumber}
                proofImageUrl={order.whatsappProofImageUrl}
              />
            </section>
          )}

          {/* Order Status */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-4 font-semibold">Update Status</h2>
            <OrderStatusSelect orderId={order.id} currentStatus={order.orderStatus} />
          </section>

          {/* Admin actions (refund) */}
          <AdminOrderActions order={order} />

          {/* Timeline */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-4 font-semibold">Timeline</h2>
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events yet.</p>
            ) : (
              <ol className="space-y-4">
                {timeline.map((event, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current opacity-40" />
                    <div>
                      <p className="text-foreground font-medium capitalize">
                        {event.status.replace(/_/g, " ")}
                      </p>
                      {event.description && (
                        <p className="text-muted-foreground">{event.description}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {formatDate(event.createdAt as Timestamp | Date)} · {event.source}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Shipping address */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-3 font-semibold">Shipping Address</h2>
            <div className="text-muted-foreground space-y-0.5 text-sm">
              <p className="text-foreground font-medium">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.line1}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
              </p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </section>

          {/* Order meta */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-3 font-semibold">Details</h2>
            <dl className="text-muted-foreground space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Payment</dt>
                <dd className="uppercase">{order.paymentMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="capitalize">{order.shippingMode?.replace(/_/g, " ")}</dd>
              </div>
              {order.awbCode && (
                <div className="flex justify-between">
                  <dt>AWB</dt>
                  <dd>{order.awbCode}</dd>
                </div>
              )}
              {order.courierName && (
                <div className="flex justify-between">
                  <dt>Courier</dt>
                  <dd>{order.courierName}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Placed</dt>
                <dd>{formatDate(order.createdAt as Timestamp | Date)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
