"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CouponType } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";

const COUPON_TYPES: { value: CouponType; label: string }[] = [
  { value: "percentage", label: "Percentage" },
  { value: "flat", label: "Flat Amount" },
  { value: "free_shipping", label: "Free Shipping" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
];

export default function NewCouponPage() {
  const router = useRouter();
  const locale = useLocale();
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState<number | "">("");
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    setSaving(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          type,
          value,
          minOrderValue: minOrderValue || undefined,
          maxDiscount: maxDiscount || undefined,
          usageLimit: usageLimit || undefined,
          usageLimitPerUser: usageLimitPerUser || undefined,
          expiresAt: expiresAt || undefined,
          isActive,
        }),
      });

      if (res.ok) {
        toast.success("Coupon created!");
        router.push(`/${locale}/admin/coupons`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error((data as { error?: string }).error ?? "Failed to create coupon");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-card px-6 py-5">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">New Coupon</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Create a discount coupon for customers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        {/* Basic Info */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-card shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold">Basic Information</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Coupon Code</label>
              <input
                className={inputCls + " font-mono uppercase"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. WELCOME10"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <input
                className={inputCls}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="10% off your first order"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  className={inputCls}
                  value={type}
                  onChange={(e) => setType(e.target.value as CouponType)}
                >
                  {COUPON_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {type === "percentage" ? "Percentage (%)" : "Amount (₹)"}
                </label>
                <input
                  type="number"
                  className={inputCls}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Limits */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-card shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold">Limits & Validity</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Min. Order Value (₹)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={minOrderValue}
                  onChange={(e) =>
                    setMinOrderValue(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="No minimum"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Max Discount (₹)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={maxDiscount}
                  onChange={(e) =>
                    setMaxDiscount(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="No cap"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Total Usage Limit</label>
                <input
                  type="number"
                  className={inputCls}
                  value={usageLimit}
                  onChange={(e) =>
                    setUsageLimit(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Per User Limit</label>
                <input
                  type="number"
                  className={inputCls}
                  value={usageLimitPerUser}
                  onChange={(e) =>
                    setUsageLimitPerUser(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Expires At</label>
              <input
                type="date"
                className={inputCls}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Active</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Coupon can be used immediately
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 " +
                  (isActive ? "bg-primary" : "bg-border")
                }
              >
                <span
                  className={
                    "inline-block h-5 w-5 transform rounded-full bg-card shadow-md ring-1 ring-black/5 transition-transform duration-200 " +
                    (isActive ? "translate-x-6" : "translate-x-0.5")
                  }
                />
              </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create Coupon
          </Button>
        </div>
      </form>
    </div>
  );
}
