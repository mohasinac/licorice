"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { PromoBanner } from "@/lib/types";
import { Trash2, Plus, Megaphone, Eye } from "lucide-react";
import { PromoBannerStrip } from "@/components/product/PromoBannerStrip";

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
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";

const emptyBanner = (): Omit<PromoBanner, "id" | "createdAt"> => ({
  text: "",
  type: "info",
  scope: "global",
  isActive: true,
  sortOrder: 0,
});

export default function PromoBannersPage() {
  const token = useAdminToken();
  const [items, setItems] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<PromoBanner, "id" | "createdAt"> & { id?: string }>(emptyBanner());
  const [editing, setEditing] = useState(false);

  const load = () =>
    fetch("/api/admin/promo-banners")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const save = async () => {
    const res = await fetch("/api/admin/promo-banners", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(form),
    });
    if (res.ok) { toast.success("Saved!"); setForm(emptyBanner()); setEditing(false); load(); }
    else toast.error("Failed to save");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this promo banner?")) return;
    const res = await fetch("/api/admin/promo-banners", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Deleted"); load(); } else toast.error("Failed to delete");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-card px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Promo Banners</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage promotional banners across the site.</p>
        </div>
        <button
          onClick={() => { setForm(emptyBanner()); setEditing(true); }}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)]"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {editing && (
          <div className="mb-8 rounded-xl border border-[var(--border)] bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold">{form.id ? "Edit" : "New"} Promo Banner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">Banner Text</label>
                <input className={inputCls} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Badge Label</label>
                <input className={inputCls} value={form.badgeLabel || ""} onChange={(e) => setForm({ ...form, badgeLabel: e.target.value || undefined })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Coupon Code</label>
                <input className={inputCls} value={form.couponCode || ""} onChange={(e) => setForm({ ...form, couponCode: e.target.value || undefined })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PromoBanner["type"] })}>
                  <option value="info">Info</option>
                  <option value="discount">Discount</option>
                  <option value="urgency">Urgency</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Scope</label>
                <select className={inputCls} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as PromoBanner["scope"] })}>
                  <option value="global">Global</option>
                  <option value="product">Product</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sort Order</label>
                <input className={inputCls} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor || "#eff6ff"} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} className="h-9 w-10 cursor-pointer rounded border border-border" />
                  <input className={inputCls} value={form.bgColor || ""} placeholder="e.g. #ecfdf5" onChange={(e) => setForm({ ...form, bgColor: e.target.value || undefined })} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor || "#1e40af"} onChange={(e) => setForm({ ...form, textColor: e.target.value })} className="h-9 w-10 cursor-pointer rounded border border-border" />
                  <input className={inputCls} value={form.textColor || ""} placeholder="e.g. #065f46" onChange={(e) => setForm({ ...form, textColor: e.target.value || undefined })} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Expires At</label>
                <input className={inputCls} type="datetime-local" value={form.expiresAt ? new Date(form.expiresAt as unknown as string | number).toISOString().slice(0, 16) : ""} onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value) : undefined })} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Active</label>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              </div>
              {form.scope === "product" && (
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">Product IDs (comma-separated)</label>
                  <input className={inputCls} value={(form.productIds || []).join(", ")} onChange={(e) => setForm({ ...form, productIds: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                </div>
              )}
            </div>
            {form.text && (
              <div className="mt-4">
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-muted-foreground"><Eye className="h-3.5 w-3.5" /> Preview</label>
                <PromoBannerStrip banners={[{ id: "preview", text: form.text, type: form.type, scope: form.scope, isActive: true, sortOrder: 0, createdAt: new Date(), badgeLabel: form.badgeLabel, couponCode: form.couponCode, bgColor: form.bgColor, textColor: form.textColor } as PromoBanner]} />
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button onClick={save} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)]">Save</button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--muted)]">Cancel</button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--muted)]" />)}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-[var(--muted-foreground)]"><Megaphone className="mb-3 h-10 w-10" /><p>No promo banners yet.</p></div>
        ) : (
          <div className="space-y-4">
            {items.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{b.text}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.isActive ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>{b.isActive ? "Active" : "Inactive"}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">{b.type}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">{b.scope}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setForm(b); setEditing(true); }} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--muted)]">Edit</button>
                  <button onClick={() => remove(b.id)} className="text-[var(--destructive)] hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
