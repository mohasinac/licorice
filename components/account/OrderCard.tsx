import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Order } from "@/lib/types";
import type { Timestamp } from "firebase-admin/firestore";

interface Props {
  order: Order;
  locale?: string;
}

function formatDate(val: Timestamp | Date | undefined): string {
  if (!val) return "—";
  const d = val instanceof Date ? val : (val as unknown as { toDate: () => Date }).toDate?.();
  return d ? d.toLocaleDateString("en-IN") : "—";
}

export function OrderCard({ order, locale = "en" }: Props) {
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-foreground font-semibold">{order.orderNumber}</p>
          <p className="text-muted-foreground text-sm">
            {formatDate(order.createdAt as Timestamp | Date)}
          </p>
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
