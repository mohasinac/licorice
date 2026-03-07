import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerUser } from "@/lib/auth";
import { getOrder, getOrderTimeline } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { ReturnRequestButton } from "@/components/account/ReturnRequestButton";
import type { Timestamp } from "firebase-admin/firestore";

export const metadata: Metadata = { title: "Order Details" };

function formatDate(val: Timestamp | Date | undefined): string {
  if (!val) return "—";
  const d = val instanceof Date ? val : (val as unknown as { toDate: () => Date }).toDate?.();
  return d ? d.toLocaleString("en-IN") : "—";
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await getServerUser();

  const [order, timeline] = await Promise.all([getOrder(id), getOrderTimeline(id)]);
  if (!order) notFound();
  if (user && order.userId !== user.uid) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/${locale}/account/orders`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Orders
        </Link>
        <h1 className="font-heading text-foreground text-2xl font-bold">{order.orderNumber}</h1>
        <StatusBadge status={order.orderStatus} type="order" />
      </div>

      <div className="space-y-6">
        {/* Items */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="text-foreground mb-3 font-semibold">Items</h2>
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
                <p className="text-foreground text-sm font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-border mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
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
          <h2 className="text-foreground mb-3 font-semibold">Payment</h2>
          <dl className="text-muted-foreground space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Method</dt>
              <dd className="uppercase">{order.paymentMethod}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Status</dt>
              <dd>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Placed</dt>
              <dd>{formatDate(order.createdAt as Timestamp | Date)}</dd>
            </div>
          </dl>
        </section>

        {/* Timeline */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="text-foreground mb-4 font-semibold">Tracking</h2>
          <OrderTimeline events={timeline} />
        </section>

        {/* Return request */}
        {order.orderStatus === "delivered" && (
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="text-foreground mb-2 font-semibold">Returns</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Returns accepted within 3 days of delivery for damaged, defective, wrong, or
              expired items only.
            </p>
            <ReturnRequestButton
              orderId={order.id}
              orderNumber={order.orderNumber}
              deliveredAt={
                order.deliveredAt instanceof Date
                  ? order.deliveredAt.toISOString()
                  : (order.deliveredAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? null
              }
            />
          </section>
        )}

        {/* Return status */}
        {(order.orderStatus === "return_requested" ||
          order.orderStatus === "return_picked_up") && (
          <section className="bg-amber-50 rounded-2xl p-5 shadow-sm">
            <h2 className="mb-2 font-semibold text-amber-800">Return in Progress</h2>
            <p className="text-sm text-amber-700">
              Your return request has been received and is being processed. We&apos;ll keep you
              updated via email.
            </p>
            {order.returnReason && (
              <p className="mt-2 text-xs text-amber-600">
                Reason: <span className="font-medium">{order.returnReason.replace(/_/g, " ")}</span>
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
