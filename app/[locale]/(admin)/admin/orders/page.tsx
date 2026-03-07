import { Metadata } from "next";
import Link from "next/link";
import { getOrders } from "@/lib/db";
import { AdminOrdersTable } from "./AdminOrdersTable";

export const metadata: Metadata = {
  title: "Orders — Admin",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">{orders.length} orders</p>
        </div>
      </div>
      <AdminOrdersTable orders={orders} />
    </div>
  );
}
