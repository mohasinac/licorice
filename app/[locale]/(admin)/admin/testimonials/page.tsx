"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Testimonial } from "@/lib/types";
import { Trash2, Star, Plus } from "lucide-react";

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

const emptyTestimonial = (): Omit<Testimonial, "id"> => ({
  customerName: "",
  city: "",
  rating: 5,
  text: "",
  productId: "",
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
});

export default function TestimonialsAdminPage() {
  const token = useAdminToken();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Testimonial, "id"> & { id?: string }>(emptyTestimonial());
  const [editing, setEditing] = useState(false);

  const load = () =>
    fetch("/api/admin/testimonials")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => {
        setItems(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Saved!");
      setForm(emptyTestimonial());
      setEditing(false);
      load();
    } else toast.error("Failed to save");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Failed to delete");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Testimonials</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manage customer testimonials shown on the homepage.
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyTestimonial());
            setEditing(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)]"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Editor */}
        {editing && (
          <div className="mb-8 rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="font-heading mb-4 text-lg font-semibold text-[var(--foreground)]">
              {form.id ? "Edit Testimonial" : "New Testimonial"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  className={inputCls}
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">City</label>
                <input
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Product ID (optional)</label>
                <input
                  className={inputCls}
                  value={form.productId || ""}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Rating</label>
                <select
                  className={inputCls}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">Testimonial Text</label>
                <textarea
                  className={inputCls + " resize-none"}
                  rows={3}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={save}
                className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)]"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--muted)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)]">No testimonials yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">{t.customerName}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{t.city}</span>
                  </div>
                  <div className="my-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < t.rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--border)]"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">{t.text}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForm(t);
                      setEditing(true);
                    }}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-[var(--destructive)] hover:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
