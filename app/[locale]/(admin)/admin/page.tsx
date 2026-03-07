import { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  MessageCircle,
  Star,
  LifeBuoy,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { getOrders, getProducts, getApprovedReviews } from "@/lib/db";
import { isFirebaseReady } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard — Licorice Herbals" };

// Colour map for order status slices in the donut chart
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  ready_to_ship: "#06b6d4",
  shipped: "#6366f1",
  out_for_delivery: "#f97316",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  return_requested: "#f43f5e",
  return_picked_up: "#ec4899",
  refunded: "#6b7280",
};

// Server-side dashboard stats
async function getDashboardStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start30Days = new Date(now);
  start30Days.setDate(start30Days.getDate() - 29);
  start30Days.setHours(0, 0, 0, 0);

  // In mock mode return placeholder stats
  if (!isFirebaseReady()) {
    // Build 30 zero-revenue points for the chart
    const revenue30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start30Days);
      d.setDate(d.getDate() + i);
      return {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        amount: 0,
      };
    });

    return {
      revenueToday: 0,
      revenueThisMonth: 0,
      ordersToday: 0,
      pendingConfirmation: 0,
      pendingWhatsApp: 0,
      lowStockCount: 0,
      openTickets: 0,
      pendingReviews: 0,
      recentOrders: [] as Awaited<ReturnType<typeof getOrders>>,
      revenue30Days,
      orderStatusToday: [] as { label: string; count: number; color: string }[],
      topProducts30Days: [] as { name: string; revenue: number; units: number }[],
    };
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { Timestamp: AdminTimestamp } = await import("firebase-admin/firestore");

    // Fetch stats in parallel
    const [
      ordersSnap,
      pendingConfirmSnap,
      pendingWASnap,
      openTicketsSnap,
      pendingReviewsSnap,
      recentOrdersSnap,
      todayOrdersSnap,
    ] = await Promise.all([
      // Paid orders in last 30 days for revenue + top products
      adminDb
        .collection("orders")
        .where("paymentStatus", "==", "paid")
        .where("createdAt", ">=", AdminTimestamp.fromDate(start30Days))
        .orderBy("createdAt", "desc")
        .limit(300)
        .get(),

      // Pending confirmation (confirmed + processing)
      adminDb
        .collection("orders")
        .where("orderStatus", "in", ["confirmed", "processing", "ready_to_ship"])
        .get(),

      // WhatsApp payments pending
      adminDb
        .collection("orders")
        .where("paymentStatus", "in", ["pending_whatsapp", "proof_submitted"])
        .get(),

      // Open support tickets
      adminDb.collection("supportTickets").where("status", "==", "open").get(),

      // Pending reviews
      adminDb.collection("reviews").where("status", "==", "pending").get(),

      // Recent 10 orders (all statuses)
      adminDb.collection("orders").orderBy("createdAt", "desc").limit(10).get(),

      // All today's orders for status donut
      adminDb
        .collection("orders")
        .where("createdAt", ">=", AdminTimestamp.fromDate(startOfDay))
        .limit(200)
        .get(),
    ]);

    // Compute revenue today + this month + 30-day daily buckets
    let revenueToday = 0;
    let revenueThisMonth = 0;
    let ordersToday = 0;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Build daily revenue map for last 30 days
    const dailyRevenue: Map<string, number> = new Map();
    for (let i = 0; i < 30; i++) {
      const d = new Date(start30Days);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyRevenue.set(key, 0);
    }

    // Top products accumulator: productId → { name, revenue, units }
    const productTotals: Map<string, { name: string; revenue: number; units: number }> = new Map();

    ordersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const total = data.total ?? 0;
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);

      if (createdAt >= startOfDay) {
        revenueToday += total;
        ordersToday++;
      }
      if (createdAt >= startOfMonth) {
        revenueThisMonth += total;
      }

      // 30-day daily bucket
      const dayKey = createdAt.toISOString().slice(0, 10);
      if (dailyRevenue.has(dayKey)) {
        dailyRevenue.set(dayKey, (dailyRevenue.get(dayKey) ?? 0) + total);
      }

      // Top products
      const items: Array<{ productId: string; name: string; price: number; quantity: number }> =
        data.items ?? [];
      items.forEach((item) => {
        const existing = productTotals.get(item.productId);
        const itemRevenue = (item.price ?? 0) * (item.quantity ?? 1);
        if (existing) {
          existing.revenue += itemRevenue;
          existing.units += item.quantity ?? 1;
        } else {
          productTotals.set(item.productId, {
            name: item.name ?? item.productId,
            revenue: itemRevenue,
            units: item.quantity ?? 1,
          });
        }
      });
    });

    // Build 30-day revenue array
    const revenue30Days = Array.from(dailyRevenue.entries()).map(([dateStr, amount]) => {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        amount,
      };
    });

    // Top 5 products by revenue
    const topProducts30Days = Array.from(productTotals.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Low stock from products
    const productsSnap = await adminDb.collection("products").where("isActive", "==", true).get();
    const lowStockCount = productsSnap.docs.filter((d) => {
      const data = d.data();
      return !data.inStock;
    }).length;

    // Order status donut — today's orders
    const statusCounts: Map<string, number> = new Map();
    todayOrdersSnap.docs.forEach((doc) => {
      const status: string = doc.data().orderStatus ?? "pending";
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    });
    const orderStatusToday = Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        label: status.replace(/_/g, " "),
        count,
        color: STATUS_COLORS[status] ?? "#94a3b8",
      }))
      .sort((a, b) => b.count - a.count);

    const recentOrders = recentOrdersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Awaited<ReturnType<typeof getOrders>>;

    return {
      revenueToday,
      revenueThisMonth,
      ordersToday,
      pendingConfirmation: pendingConfirmSnap.size,
      pendingWhatsApp: pendingWASnap.size,
      lowStockCount,
      openTickets: openTicketsSnap.size,
      pendingReviews: pendingReviewsSnap.size,
      recentOrders,
      revenue30Days,
      orderStatusToday,
      topProducts30Days,
    };
  } catch (err) {
    console.warn("[admin/dashboard] Stats query failed", err);

    const revenue30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start30Days);
      d.setDate(d.getDate() + i);
      return {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        amount: 0,
      };
    });

    return {
      revenueToday: 0,
      revenueThisMonth: 0,
      ordersToday: 0,
      pendingConfirmation: 0,
      pendingWhatsApp: 0,
      lowStockCount: 0,
      openTickets: 0,
      pendingReviews: 0,
      recentOrders: [] as Awaited<ReturnType<typeof getOrders>>,
      revenue30Days,
      orderStatusToday: [] as { label: string; count: number; color: string }[],
      topProducts30Days: [] as { name: string; revenue: number; units: number }[],
    };
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

function formatDate(val: unknown): string {
  if (!val) return "—";
  const d =
    val instanceof Date
      ? val
      : ((val as { toDate?: () => Date }).toDate?.() ??
        new Date((val as { seconds: number }).seconds * 1000));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-foreground text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* WhatsApp alert banner */}
      {stats.pendingWhatsApp > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {stats.pendingWhatsApp} WhatsApp Payment{stats.pendingWhatsApp > 1 ? "s" : ""}{" "}
                Pending
              </p>
              <p className="text-xs text-amber-600">Review and confirm customer payments</p>
            </div>
          </div>
          <Link
            href="/admin/orders?paymentStatus=pending_whatsapp,proof_submitted"
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Review All
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Revenue Today"
          value={formatCurrency(stats.revenueToday)}
          icon={TrendingUp}
          subtext={`${formatCurrency(stats.revenueThisMonth)} this month`}
          accentColor="text-green-600"
        />
        <StatsCard
          label="Orders Today"
          value={stats.ordersToday}
          icon={ShoppingBag}
          subtext={`${stats.pendingConfirmation} pending processing`}
          href="/admin/orders"
          accentColor="text-primary"
        />
        <StatsCard
          label="Low Stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          subtext="Products out of stock"
          href="/admin/inventory"
          accentColor={stats.lowStockCount > 0 ? "text-amber-600" : "text-muted-foreground"}
        />
        <StatsCard
          label="Open Tickets"
          value={stats.openTickets}
          icon={LifeBuoy}
          subtext={`${stats.pendingReviews} reviews pending`}
          href="/admin/support"
          accentColor={stats.openTickets > 0 ? "text-destructive" : "text-muted-foreground"}
        />
      </div>

      {/* Secondary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Pending Reviews"
          value={stats.pendingReviews}
          icon={Star}
          href="/admin/reviews"
          accentColor="text-yellow-600"
        />
        <StatsCard
          label="Awaiting Processing"
          value={stats.pendingConfirmation}
          icon={Clock}
          href="/admin/orders?orderStatus=confirmed"
          accentColor="text-primary"
        />
        <StatsCard
          label="WhatsApp Payments"
          value={stats.pendingWhatsApp}
          icon={MessageCircle}
          subtext="Pending confirmation"
          href="/admin/orders?paymentStatus=proof_submitted"
          accentColor="text-amber-600"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        revenue30Days={stats.revenue30Days}
        orderStatusToday={stats.orderStatusToday}
        topProducts30Days={stats.topProducts30Days}
      />

      {/* Recent orders */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-primary text-sm hover:underline">
            View all →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-foreground text-sm font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <StatusBadge status={order.orderStatus} type="order" />
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {order.shippingAddress?.name} · {formatDate(order.createdAt)} ·{" "}
                    {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-foreground text-sm font-semibold">
                    ₹{order.total?.toFixed(0)}
                  </p>
                  <div className="mt-1">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.orderStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
