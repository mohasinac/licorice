import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Order } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";

interface Props {
  order: Order;
  locale?: string;
}

function formatDate(val: unknown): string {
  const d = toSafeDate(val);
  return d ? d.toLocaleDateString("en-IN") : "—";
}

export function OrderCard({ order, locale = "en" }: Props) {
  return (
    <div className="ayur-card border-border rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-foreground font-semibold">{order.orderNumber}</p>
          <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.orderStatus} type="order" />
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      <p className="text-muted-foreground mb-3 text-sm">
        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹{order.total.toFixed(2)}
      </p>

      <Link
        href={`/${locale}/account/orders/${order.id}`}
        className="text-primary text-sm font-medium hover:underline"
      >
        View order →
      </Link>
    </div>
  );
}
