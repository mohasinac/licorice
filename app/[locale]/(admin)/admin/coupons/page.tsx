import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { getCoupons } from "@/lib/db";

export const metadata: Metadata = { title: "Coupons — Admin — Licorice Herbals" };

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function formatDate(d: Date | { toDate?: () => Date } | string | null | undefined): string {
  if (!d) return "\u2014";
  if (typeof d === "string") {
    const date = new Date(d);
    return isNaN(date.getTime()) ? "\u2014" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  const date =
    typeof (d as { toDate?: () => Date }).toDate === "function"
      ? (d as { toDate: () => Date }).toDate()
      : (d as Date);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Coupon
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-card py-16 text-center shadow-sm">
          <Ticket className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-medium">No coupons yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first coupon to offer discounts.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium tracking-wider uppercase">
                  <th className="text-muted-foreground px-4 py-3">Code</th>
                  <th className="text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-muted-foreground px-4 py-3">Value</th>
                  <th className="text-muted-foreground px-4 py-3">Min. Order</th>
                  <th className="text-muted-foreground px-4 py-3">Used</th>
                  <th className="text-muted-foreground px-4 py-3">Expires</th>
                  <th className="text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-background border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary rounded px-2 py-0.5 font-mono text-xs font-bold">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm capitalize">
                      {coupon.type.replace(/_/g, " ")}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : coupon.type === "flat"
                          ? fmt(coupon.value)
                          : coupon.type === "free_shipping"
                            ? "Free Ship"
                            : `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity}`}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {coupon.minOrderValue ? fmt(coupon.minOrderValue) : "—"}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          coupon.isActive ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
