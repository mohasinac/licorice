"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Order } from "@/lib/types";

interface Props {
  orders: Order[];
}

const columns: Column<Order>[] = [
  {
    key: "orderNumber",
    header: "Order #",
    sortable: true,
    render: (o) => (
      <Link href={`/admin/orders/${o.id}`} className="text-primary font-medium hover:underline">
        {o.orderNumber}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (o) => (
      <div className="text-foreground text-sm">
        <p className="font-medium">{o.shippingAddress?.name ?? "—"}</p>
        <p className="text-muted-foreground">{o.guestEmail ?? ""}</p>
      </div>
    ),
  },
  {
    key: "createdAt",
    header: "Date",
    sortable: true,
    render: (o) => {
      const d =
        o.createdAt instanceof Date
          ? o.createdAt
          : new Date(
              (o.createdAt as { toDate?: () => Date })?.toDate?.() ??
                (o.createdAt as unknown as string),
            );
      return <span className="text-muted-foreground text-sm">{d.toLocaleDateString("en-IN")}</span>;
    },
  },
  {
    key: "total",
    header: "Total",
    sortable: true,
    render: (o) => <span className="text-foreground font-medium">₹{o.total.toFixed(2)}</span>,
  },
  {
    key: "paymentMethod",
    header: "Payment",
    render: (o) => (
      <span className="text-muted-foreground text-sm uppercase">{o.paymentMethod}</span>
    ),
  },
  {
    key: "paymentStatus",
    header: "Payment Status",
    render: (o) => <StatusBadge status={o.paymentStatus} type="payment" />,
  },
  {
    key: "orderStatus",
    header: "Order Status",
    render: (o) => <StatusBadge status={o.orderStatus} type="order" />,
  },
  {
    key: "actions",
    header: "",
    render: (o) => (
      <Link href={`/admin/orders/${o.id}`} className="text-primary text-sm hover:underline">
        View →
      </Link>
    ),
  },
];

export function AdminOrdersTable({ orders }: Props) {
  return (
    <DataTable
      columns={columns}
      data={orders}
      keyExtractor={(o) => o.id}
      emptyMessage="No orders found."
      pageSize={25}
    />
  );
}
