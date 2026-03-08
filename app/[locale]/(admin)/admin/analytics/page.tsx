import { Metadata } from "next";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  Star,
  BarChart3,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { AnalyticsRangePicker, type AnalyticsRange } from "@/components/admin/AnalyticsRangePicker";

export const metadata: Metadata = { title: "Analytics — Licorice Herbals Admin" };

const VALID_RANGES = new Set(["3m", "6m", "12m", "24m"]);

const CATEGORY_COLORS: Record<string, string> = {
  face: "#8b5cf6",
  body: "#3b82f6",
  hair: "#22c55e",
  powder: "#f59e0b",
  combo: "#ec4899",
  supplements: "#06b6d4",
};

const PAYMENT_COLORS: Record<string, string> = {
  razorpay: "#3b82f6",
  cod: "#f59e0b",
  whatsapp: "#22c55e",
};

function parseRange(range: AnalyticsRange): number {
  const n = parseInt(range, 10);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

async function getAnalyticsData(range: AnalyticsRange) {
  const now = new Date();
  const monthCount = parseRange(range);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Build N-month label/key array
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      start: d,
      end,
    });
  }

  const oldest = months[0].start;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { Timestamp: AdminTimestamp } = await import("firebase-admin/firestore");

    // Parallel queries
    const [paidOrdersSnap, allOrdersSnap, usersSnap, productsSnap, reviewsSnap] =
      await Promise.all([
        // Paid orders in selected range
        adminDb
          .collection("orders")
          .where("paymentStatus", "==", "paid")
          .where("createdAt", ">=", AdminTimestamp.fromDate(oldest))
          .orderBy("createdAt", "desc")
          .limit(5000)
          .get(),

        // All orders in last 12 months (for total order counts)
        adminDb
          .collection("orders")
          .where("createdAt", ">=", AdminTimestamp.fromDate(oldest))
          .orderBy("createdAt", "desc")
          .limit(5000)
          .get(),

        // Users created in last 12 months
        adminDb
          .collection("users")
          .where("createdAt", ">=", AdminTimestamp.fromDate(oldest))
          .orderBy("createdAt", "desc")
          .limit(5000)
          .get(),

        // Active products
        adminDb.collection("products").where("isActive", "==", true).get(),

        // Approved reviews in last 12 months
        adminDb
          .collection("reviews")
          .where("status", "==", "approved")
          .where("createdAt", ">=", AdminTimestamp.fromDate(oldest))
          .orderBy("createdAt", "desc")
          .limit(5000)
          .get(),
      ]);

    // ── Monthly revenue, orders, AOV ─────────────────────────────────────

    const monthlyRevenueMap = new Map<string, number>();
    const monthlyOrderCountMap = new Map<string, number>();

    months.forEach((m) => {
      monthlyRevenueMap.set(m.key, 0);
      monthlyOrderCountMap.set(m.key, 0);
    });

    // Category revenue this month
    const categoryRevenueMap = new Map<string, number>();

    // Payment method this month
    const paymentMethodMap = new Map<string, number>();

    // Totals
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let thisMonthOrders = 0;
    const currentMonthKey = months[months.length - 1].key;

    paidOrdersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const total = data.total ?? 0;
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;

      totalRevenue += total;

      if (monthlyRevenueMap.has(monthKey)) {
        monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) ?? 0) + total);
      }

      if (monthKey === currentMonthKey) {
        thisMonthRevenue += total;
        thisMonthOrders++;

        // Category revenue
        const items: Array<{ productId: string; name: string; price: number; quantity: number }> =
          data.items ?? [];
        // We'll look up category from the product — for simplicity use a cached mapping
        items.forEach((item) => {
          const itemRevenue = (item.price ?? 0) * (item.quantity ?? 1);
          // We'll aggregate by product below
          const existing = categoryRevenueMap.get("uncategorized") ?? 0;
          categoryRevenueMap.set("uncategorized", existing + itemRevenue);
        });

        // Payment method
        const method: string = data.paymentMethod ?? "unknown";
        paymentMethodMap.set(method, (paymentMethodMap.get(method) ?? 0) + 1);
      }
    });

    // All orders monthly (for order count)
    allOrdersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyOrderCountMap.has(monthKey)) {
        monthlyOrderCountMap.set(monthKey, (monthlyOrderCountMap.get(monthKey) ?? 0) + 1);
      }
    });

    // Rebuild category revenue from products + order items this month
    // Get product → category mapping
    const productCategoryMap = new Map<string, string>();
    productsSnap.docs.forEach((doc) => {
      const data = doc.data();
      productCategoryMap.set(doc.id, data.category ?? "uncategorized");
    });

    // Recalculate category revenue properly
    categoryRevenueMap.clear();
    paidOrdersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);
      if (createdAt >= startOfMonth) {
        const items: Array<{ productId: string; price: number; quantity: number }> =
          data.items ?? [];
        items.forEach((item) => {
          const category = productCategoryMap.get(item.productId) ?? "other";
          const itemRevenue = (item.price ?? 0) * (item.quantity ?? 1);
          categoryRevenueMap.set(category, (categoryRevenueMap.get(category) ?? 0) + itemRevenue);
        });
      }
    });

    // ── Top products by units sold (in selected range) ─────────────────

    const productTotals: Map<string, { name: string; revenue: number; units: number }> = new Map();
    paidOrdersSnap.docs.forEach((doc) => {
      const data = doc.data();
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

    const topProducts = Array.from(productTotals.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 10);

    // ── Low inventory items ──────────────────────────────────────────────

    const lowStockItems: { name: string; variant: string; stock: number; threshold: number }[] = [];

    for (const doc of productsSnap.docs) {
      const pData = doc.data();
      const productName: string = pData.name ?? doc.id;
      const variants: Array<{
        id: string;
        label: string;
        stock: number;
        reservedStock?: number;
      }> = pData.variants ?? [];

      for (const v of variants) {
        const available = (v.stock ?? 0) - (v.reservedStock ?? 0);
        // Consider low-stock if available <= 10 (default threshold)
        if (available <= 10) {
          lowStockItems.push({
            name: productName,
            variant: v.label ?? v.id,
            stock: available,
            threshold: 10,
          });
        }
      }
    }

    // Sort by stock ascending (most critical first), limit to 15
    lowStockItems.sort((a, b) => a.stock - b.stock);
    const lowInventory = lowStockItems.slice(0, 15);

    // Build chart data
    const monthlyRevenue = months.map((m) => ({
      label: m.label,
      value: monthlyRevenueMap.get(m.key) ?? 0,
    }));

    const monthlyOrders = months.map((m) => ({
      label: m.label,
      value: monthlyOrderCountMap.get(m.key) ?? 0,
    }));

    const monthlyAOV = months.map((m) => {
      const rev = monthlyRevenueMap.get(m.key) ?? 0;
      const count = monthlyOrderCountMap.get(m.key) ?? 0;
      return { label: m.label, value: count > 0 ? Math.round(rev / count) : 0 };
    });

    const revenueByCategoryToday = Array.from(categoryRevenueMap.entries())
      .map(([label, value]) => ({
        label,
        value,
        color: CATEGORY_COLORS[label] ?? "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);

    const paymentMethodBreakdown = Array.from(paymentMethodMap.entries())
      .map(([label, count]) => ({
        label,
        count,
        color: PAYMENT_COLORS[label] ?? "#94a3b8",
      }))
      .sort((a, b) => b.count - a.count);

    // ── Website growth: customers ────────────────────────────────────────

    const monthlyCustomerMap = new Map<string, number>();
    months.forEach((m) => monthlyCustomerMap.set(m.key, 0));

    let totalCustomers = 0;
    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      totalCustomers++;
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyCustomerMap.has(monthKey)) {
        monthlyCustomerMap.set(monthKey, (monthlyCustomerMap.get(monthKey) ?? 0) + 1);
      }
    });

    // Cumulative customers
    let cumCustomers = 0;
    const monthlyCustomers = months.map((m) => {
      cumCustomers += monthlyCustomerMap.get(m.key) ?? 0;
      return { label: m.label, value: cumCustomers };
    });

    // ── Website growth: products (cumulative active products) ────────────

    const monthlyProductMap = new Map<string, number>();
    months.forEach((m) => monthlyProductMap.set(m.key, 0));

    productsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyProductMap.has(monthKey)) {
        monthlyProductMap.set(monthKey, (monthlyProductMap.get(monthKey) ?? 0) + 1);
      }
    });

    let cumProducts = 0;
    const monthlyProducts = months.map((m) => {
      cumProducts += monthlyProductMap.get(m.key) ?? 0;
      return { label: m.label, value: cumProducts };
    });

    // ── Website growth: reviews (cumulative approved) ────────────────────

    const monthlyReviewMap = new Map<string, number>();
    months.forEach((m) => monthlyReviewMap.set(m.key, 0));

    reviewsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt: Date =
        data.createdAt?.toDate?.() ?? new Date((data.createdAt?.seconds ?? 0) * 1000);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyReviewMap.has(monthKey)) {
        monthlyReviewMap.set(monthKey, (monthlyReviewMap.get(monthKey) ?? 0) + 1);
      }
    });

    let cumReviews = 0;
    const monthlyReviews = months.map((m) => {
      cumReviews += monthlyReviewMap.get(m.key) ?? 0;
      return { label: m.label, value: cumReviews };
    });

    // ── Summary stats ────────────────────────────────────────────────────

    const totalOrdersAllTime = allOrdersSnap.size;
    const avgOrderValue =
      totalOrdersAllTime > 0 ? Math.round(totalRevenue / thisMonthOrders) : 0;

    // Previous month comparison
    const prevMonthKey = months.length >= 2 ? months[months.length - 2].key : "";
    const prevMonthRevenue = monthlyRevenueMap.get(prevMonthKey) ?? 0;
    const prevMonthOrders = monthlyOrderCountMap.get(prevMonthKey) ?? 0;

    const revenueTrend: "up" | "down" | "neutral" =
      thisMonthRevenue > prevMonthRevenue
        ? "up"
        : thisMonthRevenue < prevMonthRevenue
          ? "down"
          : "neutral";

    const ordersTrend: "up" | "down" | "neutral" =
      thisMonthOrders > prevMonthOrders
        ? "up"
        : thisMonthOrders < prevMonthOrders
          ? "down"
          : "neutral";

    return {
      // Stats
      totalRevenue,
      thisMonthRevenue,
      thisMonthOrders,
      avgOrderValue: thisMonthOrders > 0 ? Math.round(thisMonthRevenue / thisMonthOrders) : 0,
      totalCustomers,
      totalProducts: productsSnap.size,
      totalReviews: reviewsSnap.size,
      revenueTrend,
      ordersTrend,
      prevMonthRevenue,
      prevMonthOrders,
      // Charts
      monthlyRevenue,
      monthlyOrders,
      monthlyAOV,
      revenueByCategoryToday,
      paymentMethodBreakdown,
      monthlyCustomers,
      monthlyProducts,
      monthlyReviews,
      topProducts,
      lowInventory,
    };
  } catch (err) {
    console.warn("[admin/analytics] Query failed", err);

    const emptyMonths = months.map((m) => ({ label: m.label, value: 0 }));

    return {
      totalRevenue: 0,
      thisMonthRevenue: 0,
      thisMonthOrders: 0,
      avgOrderValue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalReviews: 0,
      revenueTrend: "neutral" as const,
      ordersTrend: "neutral" as const,
      prevMonthRevenue: 0,
      prevMonthOrders: 0,
      monthlyRevenue: emptyMonths,
      monthlyOrders: emptyMonths,
      monthlyAOV: emptyMonths,
      revenueByCategoryToday: [],
      paymentMethodBreakdown: [],
      monthlyCustomers: emptyMonths,
      monthlyProducts: emptyMonths,
      monthlyReviews: emptyMonths,
      topProducts: [],
      lowInventory: [],
    };
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

function percentChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range: AnalyticsRange =
    params.range && VALID_RANGES.has(params.range)
      ? (params.range as AnalyticsRange)
      : "12m";
  const data = await getAnalyticsData(range);
  const rangeLabel = `${parseInt(range, 10)} months`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Economic performance &amp; website growth over the last {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AnalyticsRangePicker />
          <p className="text-muted-foreground hidden text-sm sm:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Revenue This Month"
          value={formatCurrency(data.thisMonthRevenue)}
          icon={DollarSign}
          subtext={`${percentChange(data.thisMonthRevenue, data.prevMonthRevenue)} vs last month`}
          trend={data.revenueTrend}
          accentColor="text-green-600"
        />
        <StatsCard
          label="Orders This Month"
          value={data.thisMonthOrders}
          icon={ShoppingBag}
          subtext={`${percentChange(data.thisMonthOrders, data.prevMonthOrders)} vs last month`}
          trend={data.ordersTrend}
          accentColor="text-primary"
        />
        <StatsCard
          label="Avg. Order Value"
          value={formatCurrency(data.avgOrderValue)}
          icon={TrendingUp}
          subtext={`${formatCurrency(data.totalRevenue)} lifetime revenue`}
          accentColor="text-violet-600"
        />
        <StatsCard
          label="Total Customers"
          value={data.totalCustomers}
          icon={Users}
          accentColor="text-emerald-600"
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Active Products"
          value={data.totalProducts}
          icon={Package}
          accentColor="text-amber-600"
        />
        <StatsCard
          label="Approved Reviews"
          value={data.totalReviews}
          icon={Star}
          accentColor="text-pink-600"
        />
        <StatsCard
          label="Lifetime Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={BarChart3}
          accentColor="text-primary"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        monthlyRevenue={data.monthlyRevenue}
        monthlyOrders={data.monthlyOrders}
        monthlyAOV={data.monthlyAOV}
        revenueByCategoryToday={data.revenueByCategoryToday}
        paymentMethodBreakdown={data.paymentMethodBreakdown}
        monthlyCustomers={data.monthlyCustomers}
        monthlyProducts={data.monthlyProducts}
        monthlyReviews={data.monthlyReviews}
        topProducts={data.topProducts}
        lowInventory={data.lowInventory}
      />
    </div>
  );
}
