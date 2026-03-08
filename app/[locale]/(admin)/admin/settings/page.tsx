"use client";
// app/[locale]/(admin)/admin/settings/page.tsx
// Admin Settings — tabbed UI for Site Config, Shipping, Payments, Inventory.

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { SiteConfig, ShippingRules, PaymentSettings, InventorySettings } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

type Tab = "general" | "shipping" | "payment" | "inventory";

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

async function patchSettings(
  endpoint: string,
  data: Record<string, unknown>,
  token: string | null,
): Promise<string | null> {
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return (json as { error?: string }).error ?? "Save failed";
  }
  return null;
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

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
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none " +
          (checked ? "bg-[var(--primary)]" : "bg-[var(--border)]")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-6" : "translate-x-1")
          }
        />
      </button>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        {label}
        {sublabel && (
          <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">
            {sublabel}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50";

// ── Section Card ─────────────────────────────────────────────────────────────

function Section({
  title,
  children,
  onSave,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
        <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">{title}</h3>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--secondary)] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
      <div className="space-y-4 px-6 py-5">{children}</div>
    </div>
  );
}

// ── Tab: General ─────────────────────────────────────────────────────────────

function GeneralTab({ initial, token }: { initial: SiteConfig; token: string | null }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);

  const set = (key: keyof SiteConfig, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (section: string, payload: Partial<SiteConfig>) => {
    setSaving(section);
    const err = await patchSettings(
      "/api/admin/settings/site",
      payload as Record<string, unknown>,
      token,
    );
    setSaving(null);
    if (err) toast.error(err);
    else toast.success("Saved!");
  };

  return (
    <div className="space-y-6">
      {/* Brand Logo */}
      <Section
        title="Brand Logo"
        saving={saving === "logo"}
        onSave={() => save("logo", { logoUrl: form.logoUrl })}
      >
        <Field
          label="Logo Image"
          sublabel="Shown in navbar, footer, mobile menu. Falls back to /logo.png if empty."
        >
          <div className="flex items-center gap-4">
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logoUrl}
                alt="Current logo"
                className="h-12 w-auto rounded-lg border border-[var(--border)] bg-white object-contain p-1"
              />
            ) : (
              <div className="flex h-12 w-24 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                No logo set
              </div>
            )}
            <input
              className={inputCls}
              value={form.logoUrl ?? ""}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="https://firebasestorage.googleapis.com/… or /logo.png"
            />
          </div>
        </Field>
      </Section>

      {/* Announcement Bar */}
      <Section
        title="Announcement Bar"
        saving={saving === "announcement"}
        onSave={() =>
          save("announcement", {
            announcementText: form.announcementText,
            announcementLink: form.announcementLink,
          })
        }
      >
        <Field label="Message">
          <input
            className={inputCls}
            value={form.announcementText}
            onChange={(e) => set("announcementText", e.target.value)}
            placeholder="🌿 Free shipping above ₹999 | Use code WELCOME10 for 10% off"
          />
        </Field>
        <Field label="Link URL" sublabel="(optional)">
          <input
            className={inputCls}
            value={form.announcementLink ?? ""}
            onChange={(e) => set("announcementLink", e.target.value)}
            placeholder="/shop"
          />
        </Field>
        <Toggle
          label="Maintenance Mode"
          sublabel="Blocks the storefront — only admin can access"
          checked={form.maintenanceMode}
          onChange={(v) => set("maintenanceMode", v)}
        />
      </Section>

      {/* Support & Contact */}
      <Section
        title="Support & Contact"
        saving={saving === "support"}
        onSave={() =>
          save("support", {
            supportPhone: form.supportPhone,
            supportEmail: form.supportEmail,
            supportHours: form.supportHours,
          })
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Support Phone">
            <input
              className={inputCls}
              value={form.supportPhone ?? ""}
              onChange={(e) => set("supportPhone", e.target.value)}
              placeholder="+91 99999 99999"
            />
          </Field>
          <Field label="Support Email">
            <input
              type="email"
              className={inputCls}
              value={form.supportEmail ?? ""}
              onChange={(e) => set("supportEmail", e.target.value)}
              placeholder="support@licoriceherbal.in"
            />
          </Field>
        </div>
        <Field label="Support Hours" sublabel="shown in footer and contact page">
          <input
            className={inputCls}
            value={form.supportHours ?? ""}
            onChange={(e) => set("supportHours", e.target.value)}
            placeholder="Mon–Sat, 9:30 AM – 6:30 PM IST"
          />
        </Field>
      </Section>

      {/* Social Links */}
      <Section
        title="Social Media Links"
        saving={saving === "social"}
        onSave={() =>
          save("social", {
            socialInstagram: form.socialInstagram,
            socialFacebook: form.socialFacebook,
            socialYoutube: form.socialYoutube,
          })
        }
      >
        <Field label="Instagram URL">
          <input
            className={inputCls}
            value={form.socialInstagram ?? ""}
            onChange={(e) => set("socialInstagram", e.target.value)}
            placeholder="https://instagram.com/licoriceherbal"
          />
        </Field>
        <Field label="Facebook URL">
          <input
            className={inputCls}
            value={form.socialFacebook ?? ""}
            onChange={(e) => set("socialFacebook", e.target.value)}
            placeholder="https://facebook.com/licoriceherbal"
          />
        </Field>
        <Field label="YouTube URL">
          <input
            className={inputCls}
            value={form.socialYoutube ?? ""}
            onChange={(e) => set("socialYoutube", e.target.value)}
            placeholder="https://youtube.com/@licoriceherbal"
          />
        </Field>
      </Section>

      {/* Consultation */}
      <Section
        title="Free Consultation"
        saving={saving === "consultation"}
        onSave={() =>
          save("consultation", {
            consultantName: form.consultantName,
            consultantBio: form.consultantBio,
          })
        }
      >
        <Field label="Consultant Name">
          <input
            className={inputCls}
            value={form.consultantName ?? ""}
            onChange={(e) => set("consultantName", e.target.value)}
            placeholder="Dr. Mariya Nallamandu"
          />
        </Field>
        <Field label="Consultant Bio">
          <textarea
            className={inputCls + " resize-none"}
            rows={3}
            value={form.consultantBio ?? ""}
            onChange={(e) => set("consultantBio", e.target.value)}
            placeholder="Certified Ayurvedic practitioner with 10+ years of experience…"
          />
        </Field>
      </Section>

      {/* SEO */}
      <Section
        title="SEO Defaults"
        saving={saving === "seo"}
        onSave={() =>
          save("seo", {
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
          })
        }
      >
        <Field label="Default Meta Title">
          <input
            className={inputCls}
            value={form.metaTitle ?? ""}
            onChange={(e) => set("metaTitle", e.target.value)}
            placeholder="Licorice Herbals — Pure Ayurvedic Skincare"
          />
        </Field>
        <Field label="Default Meta Description" sublabel="(max 160 chars)">
          <textarea
            className={inputCls + " resize-none"}
            rows={3}
            maxLength={160}
            value={form.metaDescription ?? ""}
            onChange={(e) => set("metaDescription", e.target.value)}
            placeholder="Shop Licorice Herbals' range of authentic Ayurvedic skincare…"
          />
        </Field>
      </Section>
    </div>
  );
}

// ── Tab: Shipping ─────────────────────────────────────────────────────────────

function ShippingTab({ initial, token }: { initial: ShippingRules; token: string | null }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof ShippingRules, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    const { createdAt, updatedAt, ...payload } = form;
    void createdAt;
    void updatedAt;
    const err = await patchSettings(
      "/api/admin/settings/shipping",
      payload as Record<string, unknown>,
      token,
    );
    setSaving(false);
    if (err) toast.error(err);
    else toast.success("Shipping rules saved!");
  };

  return (
    <div className="space-y-6">
      <Section title="Shipping Rules" saving={saving} onSave={save}>
        {/* Free Shipping & Standard */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Free Shipping Threshold" sublabel="₹">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.freeShippingThreshold}
              onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
            />
          </Field>
          <Field label="Standard Shipping Rate" sublabel="₹">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.standardRate}
              onChange={(e) => set("standardRate", Number(e.target.value))}
            />
          </Field>
          <Field label="Processing Days" sublabel="e.g. '1-2'">
            <input
              className={inputCls}
              value={form.processingDays ?? ""}
              onChange={(e) => set("processingDays", e.target.value)}
              placeholder="1-2"
            />
          </Field>
          <Field label="Standard SLA" sublabel="shown to customers">
            <input
              className={inputCls}
              value={form.standardSla ?? ""}
              onChange={(e) => set("standardSla", e.target.value)}
              placeholder="5-7 business days"
            />
          </Field>
        </div>

        {/* COD */}
        <div className="border-t border-[var(--border)] pt-4">
          <Toggle
            label="Cash on Delivery"
            sublabel="Allow COD orders"
            checked={form.codEnabled}
            onChange={(v) => set("codEnabled", v)}
          />
          {form.codEnabled && (
            <div className="mt-3">
              <Field label="COD Fee" sublabel="₹ added to order total">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.codFee}
                  onChange={(e) => set("codFee", Number(e.target.value))}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Express */}
        <div className="border-t border-[var(--border)] pt-4">
          <Toggle
            label="Express Shipping"
            sublabel="2-3 business days"
            checked={form.expressEnabled}
            onChange={(v) => set("expressEnabled", v)}
          />
          {form.expressEnabled && (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Express Rate" sublabel="₹">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.expressRate ?? ""}
                  onChange={(e) => set("expressRate", Number(e.target.value))}
                  placeholder="120"
                />
              </Field>
              <Field label="Express SLA" sublabel="shown to customers">
                <input
                  className={inputCls}
                  value={form.expressSla ?? ""}
                  onChange={(e) => set("expressSla", e.target.value)}
                  placeholder="2-3 business days"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Same Day */}
        <div className="border-t border-[var(--border)] pt-4">
          <Toggle
            label="Same-Day Delivery"
            sublabel="Limited cities only"
            checked={form.sameDayEnabled}
            onChange={(v) => set("sameDayEnabled", v)}
          />
          {form.sameDayEnabled && (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Same-Day Rate" sublabel="₹">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.sameDayRate ?? ""}
                  onChange={(e) => set("sameDayRate", Number(e.target.value))}
                  placeholder="199"
                />
              </Field>
              <Field label="Same-Day SLA">
                <input
                  className={inputCls}
                  value={form.sameDaySla ?? ""}
                  onChange={(e) => set("sameDaySla", e.target.value)}
                  placeholder="Same day (Mumbai only)"
                />
              </Field>
              <Field label="Available Cities" sublabel="comma-separated">
                <input
                  className={inputCls}
                  value={(form.sameDayCities ?? []).join(", ")}
                  onChange={(e) =>
                    set(
                      "sameDayCities",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="Mumbai, Pune"
                />
              </Field>
            </div>
          )}
        </div>

        {/* GST */}
        <div className="border-t border-[var(--border)] pt-4">
          <h4 className="mb-3 text-sm font-semibold text-[var(--foreground)]">GST Settings</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="GST Percentage" sublabel="% (0 to disable)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={form.gstPercent ?? 0}
                onChange={(e) => set("gstPercent", Number(e.target.value))}
              />
            </Field>
          </div>
          <div className="mt-3">
            <Toggle
              label="GST Included in Prices"
              sublabel="If on, product MRP already includes GST (breakdown shown to customers)"
              checked={form.gstIncluded ?? true}
              onChange={(v) => set("gstIncluded", v)}
            />
          </div>
        </div>

        {/* Shiprocket Live Rates */}
        <div className="border-t border-[var(--border)] pt-4">
          <Toggle
            label="Use Shiprocket Live Rates"
            sublabel="Fetch real courier rates from Shiprocket based on delivery pincode"
            checked={form.useShiprocketRates ?? false}
            onChange={(v) => set("useShiprocketRates", v)}
          />
          {form.useShiprocketRates && (
            <div className="mt-3">
              <Field label="Pickup Pincode" sublabel="Warehouse pincode for rate calculation">
                <input
                  className={inputCls}
                  value={form.pickupPincode ?? ""}
                  onChange={(e) => set("pickupPincode", e.target.value)}
                  placeholder="400001"
                  maxLength={6}
                />
              </Field>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// ── Tab: Payment ──────────────────────────────────────────────────────────────

function PaymentTab({ initial, token }: { initial: PaymentSettings; token: string | null }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof PaymentSettings, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    const { createdAt, updatedAt, ...payload } = form;
    void createdAt;
    void updatedAt;
    const err = await patchSettings(
      "/api/admin/settings/payment",
      payload as Record<string, unknown>,
      token,
    );
    setSaving(false);
    if (err) toast.error(err);
    else toast.success("Payment settings saved!");
  };

  return (
    <div className="space-y-6">
      <Section title="Payment Methods" saving={saving} onSave={save}>
        {/* WhatsApp */}
        <div>
          <Toggle
            label="WhatsApp / UPI Payments"
            sublabel="Primary payment method — zero gateway fees"
            checked={form.whatsappEnabled}
            onChange={(v) => set("whatsappEnabled", v)}
          />
          {form.whatsappEnabled && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-l-2 border-[var(--primary)] pl-4 sm:grid-cols-2">
              <Field
                label="WhatsApp Business Number"
                sublabel="international format (e.g. 919999999999)"
              >
                <input
                  className={inputCls}
                  value={form.whatsappBusinessNumber}
                  onChange={(e) => set("whatsappBusinessNumber", e.target.value)}
                  placeholder="919999999999"
                />
              </Field>
              <Field label="UPI ID" sublabel="shown to customers at checkout">
                <input
                  className={inputCls}
                  value={form.whatsappUpiId}
                  onChange={(e) => set("whatsappUpiId", e.target.value)}
                  placeholder="licoriceherbal@upi"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Razorpay */}
        <div className="border-t border-[var(--border)] pt-4">
          <Toggle
            label="Razorpay Online Payments"
            sublabel="Credit/debit cards, net banking, wallets — requires Razorpay credentials in .env"
            checked={form.razorpayEnabled}
            onChange={(v) => set("razorpayEnabled", v)}
          />
        </div>

        {/* COD */}
        <div className="border-t border-[var(--border)] pt-4">
          <Toggle
            label="Cash on Delivery (COD)"
            sublabel="Customer pays cash at delivery"
            checked={form.codEnabled}
            onChange={(v) => set("codEnabled", v)}
          />
          {form.codEnabled && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-l-2 border-[var(--primary)] pl-4 sm:grid-cols-2">
              <Field label="COD Fee" sublabel="₹ added to order total">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.codFee}
                  onChange={(e) => set("codFee", Number(e.target.value))}
                />
              </Field>
              <Field label="Minimum Order for COD" sublabel="₹ — leave 0 for no minimum">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.codMinOrder ?? 0}
                  onChange={(e) => set("codMinOrder", Number(e.target.value) || undefined)}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Prepaid discount */}
        <div className="border-t border-[var(--border)] pt-4">
          <Field
            label="Prepaid Discount"
            sublabel="% off for customers who pay online (UPI / Razorpay). Set 0 to disable."
          >
            <input
              type="number"
              min={0}
              max={50}
              className={inputCls}
              value={form.prepaidDiscountPercent ?? 0}
              onChange={(e) => set("prepaidDiscountPercent", Number(e.target.value) || undefined)}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

// ── Tab: Inventory ────────────────────────────────────────────────────────────

function InventoryTab({ initial, token }: { initial: InventorySettings; token: string | null }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof InventorySettings, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    const { createdAt, updatedAt, ...payload } = form;
    void createdAt;
    void updatedAt;
    const err = await patchSettings(
      "/api/admin/settings/inventory",
      payload as Record<string, unknown>,
      token,
    );
    setSaving(false);
    if (err) toast.error(err);
    else toast.success("Inventory settings saved!");
  };

  return (
    <div className="space-y-6">
      <Section title="Inventory Defaults" saving={saving} onSave={save}>
        <p className="text-sm text-[var(--muted-foreground)]">
          These defaults apply when adding new products. Existing inventory records are not
          affected.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Low Stock Threshold"
            sublabel="units — product shows warning badge below this"
          >
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.defaultLowStockThreshold}
              onChange={(e) => set("defaultLowStockThreshold", Number(e.target.value))}
            />
          </Field>
          <Field label="Reorder Point" sublabel="units — admin alert triggered below this">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.defaultReorderPoint}
              onChange={(e) => set("defaultReorderPoint", Number(e.target.value))}
            />
          </Field>
          <Field
            label="Default Stock per Variant"
            sublabel="units pre-filled when adding a new product"
          >
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.defaultStockPerVariant}
              onChange={(e) => set("defaultStockPerVariant", Number(e.target.value))}
            />
          </Field>
          <Field
            label="Cart Reservation Timeout"
            sublabel="minutes — stock released if order unpaid"
          >
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.reservationTimeoutMinutes}
              onChange={(e) => set("reservationTimeoutMinutes", Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="mt-2 rounded-lg bg-[var(--muted)] p-3 text-xs text-[var(--muted-foreground)]">
          <strong>How thresholds work:</strong> When a variant&apos;s stock drops below the{" "}
          <em>low stock threshold</em>, customers see a &ldquo;Only X left&rdquo; warning. When it
          drops below the <em>reorder point</em>, an alert appears on the admin dashboard. The
          reorder point must always be lower than the low stock threshold.
        </div>
      </Section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payments" },
  { id: "inventory", label: "Inventory" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const token = useAdminToken();

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [shippingRules, setShippingRules] = useState<ShippingRules | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [inventorySettings, setInventorySettings] = useState<InventorySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const guard = (r: Response) => { if (!r.ok) throw new Error(r.statusText); return r.json(); };
    const [site, shipping, payment, inventory] = await Promise.all([
      fetch("/api/admin/settings/site").then(guard),
      fetch("/api/admin/settings/shipping").then(guard),
      fetch("/api/admin/settings/payment").then(guard),
      fetch("/api/admin/settings/inventory").then(guard),
    ]);
    setSiteConfig(site as SiteConfig);
    setShippingRules(shipping as ShippingRules);
    setPaymentSettings(payment as PaymentSettings);
    setInventorySettings(inventory as InventorySettings);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-white px-6 py-5">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Manage site configuration, shipping, payments, and inventory defaults.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] bg-white px-6">
        <nav className="flex gap-1" aria-label="Settings tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors " +
                (activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-[var(--muted)]" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "general" && siteConfig && (
              <GeneralTab initial={siteConfig} token={token} />
            )}
            {activeTab === "shipping" && shippingRules && (
              <ShippingTab initial={shippingRules} token={token} />
            )}
            {activeTab === "payment" && paymentSettings && (
              <PaymentTab initial={paymentSettings} token={token} />
            )}
            {activeTab === "inventory" && inventorySettings && (
              <InventoryTab initial={inventorySettings} token={token} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
