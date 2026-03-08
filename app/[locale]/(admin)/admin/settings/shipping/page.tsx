"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { ShippingRules } from "@/lib/types";
import { Truck, Receipt, Globe } from "lucide-react";

function useAdminToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    import("@/lib/firebase/client").then(({ getClientAuth }) => {
      const auth = getClientAuth();
      unsub = auth.onAuthStateChanged(async (user) => {
        if (user) setToken(await user.getIdToken());
        else setToken(null);
      });
    });
    return () => unsub?.();
  }, []);
  return token;
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

export default function ShippingSettingsPage() {
  const token = useAdminToken();
  const [data, setData] = useState<ShippingRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/shipping")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings/shipping", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) toast.success("Shipping rules saved!");
    else toast.error("Failed to save");
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  if (!data)
    return <div className="p-8 text-[var(--muted-foreground)]">Failed to load shipping rules.</div>;

  const set = (key: string, value: unknown) => setData({ ...data, [key]: value });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Shipping Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Configure shipping thresholds, rates, and COD rules.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        {/* Free Shipping */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <Truck className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h3 className="font-heading text-base font-semibold">Shipping Thresholds</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={data.freeShippingThreshold ?? ""}
                onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Standard Shipping Rate (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={data.standardRate ?? ""}
                onChange={(e) => set("standardRate", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Express Shipping Rate (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={data.expressRate ?? ""}
                onChange={(e) => set("expressRate", Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* COD Rules */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold">Cash on Delivery</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">COD Enabled</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Allow customers to pay on delivery
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.codEnabled ?? false}
                onClick={() => set("codEnabled", !data.codEnabled)}
                className={
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                  (data.codEnabled ? "bg-[var(--primary)]" : "bg-[var(--border)]")
                }
              >
                <span
                  className={
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
                    (data.codEnabled ? "translate-x-6" : "translate-x-1")
                  }
                />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">COD Fee (₹)</label>
              <input
                type="number"
                className={inputCls}
                value={data.codFee ?? ""}
                onChange={(e) => set("codFee", Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Processing */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold">Processing & SLA</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Processing Days</label>
              <input
                className={inputCls}
                value={data.processingDays ?? ""}
                onChange={(e) => set("processingDays", e.target.value)}
                placeholder="e.g. 1-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Standard SLA</label>
              <input
                className={inputCls}
                value={data.standardSla ?? ""}
                onChange={(e) => set("standardSla", e.target.value)}
                placeholder="e.g. 5-7 business days"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Express SLA</label>
              <input
                className={inputCls}
                value={data.expressSla ?? ""}
                onChange={(e) => set("expressSla", e.target.value)}
                placeholder="e.g. 2-3 business days"
              />
            </div>
          </div>
        </section>

        {/* GST */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <Receipt className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h3 className="font-heading text-base font-semibold">GST Settings</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium">GST Percentage (%)</label>
              <input
                type="number"
                className={inputCls}
                value={data.gstPercent ?? 0}
                min={0}
                max={100}
                onChange={(e) => set("gstPercent", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Set to 0 to disable GST display. Common: 12% for cosmetics, 18% for premium skincare.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">GST Included in Prices</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  If on, product MRP already includes GST (breakdown shown). If off, GST is added on top.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.gstIncluded ?? true}
                onClick={() => set("gstIncluded", !(data.gstIncluded ?? true))}
                className={
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                  ((data.gstIncluded ?? true) ? "bg-[var(--primary)]" : "bg-[var(--border)]")
                }
              >
                <span
                  className={
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
                    ((data.gstIncluded ?? true) ? "translate-x-6" : "translate-x-1")
                  }
                />
              </button>
            </div>
          </div>
        </section>

        {/* Shiprocket Live Rates */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h3 className="font-heading text-base font-semibold">Shiprocket Live Rates</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Use Shiprocket Rates</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Fetch live courier rates from Shiprocket based on delivery pincode. When off, flat rates above are used.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.useShiprocketRates ?? false}
                onClick={() => set("useShiprocketRates", !data.useShiprocketRates)}
                className={
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                  (data.useShiprocketRates ? "bg-[var(--primary)]" : "bg-[var(--border)]")
                }
              >
                <span
                  className={
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
                    (data.useShiprocketRates ? "translate-x-6" : "translate-x-1")
                  }
                />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pickup Pincode</label>
              <input
                className={inputCls}
                value={data.pickupPincode ?? ""}
                onChange={(e) => set("pickupPincode", e.target.value)}
                placeholder="e.g. 400001"
                maxLength={6}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Your warehouse / pickup address pincode used for rate calculation.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
