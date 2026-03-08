"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { PaymentSettings } from "@/lib/types";
import { CreditCard } from "lucide-react";

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
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

function Toggle({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {sublabel && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{sublabel}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none " +
          (checked ? "bg-violet-600" : "bg-gray-300")
        }
      >
        <span
          className={
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 " +
            (checked ? "translate-x-6" : "translate-x-0.5")
          }
        />
      </button>
    </div>
  );
}

export default function PaymentSettingsPage() {
  const token = useAdminToken();
  const [data, setData] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/payment")
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
    const res = await fetch("/api/admin/settings/payment", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) toast.success("Payment settings saved!");
    else toast.error("Failed to save");
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-[var(--muted-foreground)]">Failed to load payment settings.</div>
    );

  const set = (key: string, value: unknown) => setData({ ...data, [key]: value });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Payment Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Enable or disable payment methods for the storefront.
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
        {/* Payment Methods */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <CreditCard className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h3 className="font-heading text-base font-semibold">Payment Methods</h3>
          </div>
          <div className="px-6 py-2">
            <Toggle
              label="WhatsApp Payment"
              sublabel="Customers send payment proof via WhatsApp for manual confirmation"
              checked={data.whatsappEnabled ?? false}
              onChange={(v) => set("whatsappEnabled", v)}
            />
            <Toggle
              label="Razorpay (Online)"
              sublabel="Credit/Debit card, UPI, Net Banking via Razorpay gateway"
              checked={data.razorpayEnabled ?? false}
              onChange={(v) => set("razorpayEnabled", v)}
            />
            <Toggle
              label="Cash on Delivery"
              sublabel="Collect payment at the time of delivery"
              checked={data.codEnabled ?? false}
              onChange={(v) => set("codEnabled", v)}
            />
          </div>
        </section>

        {/* Razorpay Config */}
        {data.razorpayEnabled && (
          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
              <h3 className="font-heading text-base font-semibold">Razorpay Configuration</h3>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-sm font-medium">Razorpay Key ID</label>
                <input
                  className={inputCls}
                  value={data.razorpayEnabled ? "Configured via environment" : ""}
                  disabled
                  placeholder="Set RAZORPAY_KEY_ID env var"
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                The secret key is stored as an environment variable (RAZORPAY_KEY_SECRET) and cannot
                be changed from here.
              </p>
            </div>
          </section>
        )}

        {/* WhatsApp Config */}
        {data.whatsappEnabled && (
          <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
              <h3 className="font-heading text-base font-semibold">WhatsApp Configuration</h3>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-sm font-medium">WhatsApp Business Number</label>
                <input
                  className={inputCls}
                  value={data.whatsappBusinessNumber ?? ""}
                  onChange={(e) => set("whatsappBusinessNumber", e.target.value)}
                  placeholder="919999999999"
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  International format without +
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
