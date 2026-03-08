"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { PageDoc } from "@/lib/types";
import { FileEdit, ExternalLink } from "lucide-react";

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

const STATIC_PAGES = [
  { id: "about", label: "About Us", route: "/about" },
  { id: "terms", label: "Terms & Conditions", route: "/terms" },
  { id: "shipping-policy", label: "Shipping Policy", route: "/shipping-policy" },
  { id: "refund-policy", label: "Refund & Return Policy", route: "/refund-policy" },
  { id: "privacy-policy", label: "Privacy Policy", route: "/privacy-policy" },
];

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

export default function PagesSettingsPage() {
  const token = useAdminToken();
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageDoc | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/admin/pages")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d: PageDoc[]) => {
        setPages(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch("/api/admin/pages", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Page saved!");
      setEditing(null);
      load();
    } else {
      toast.error("Failed to save");
    }
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-white px-6 py-5">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
          Page Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Manage SEO metadata for static pages.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        {STATIC_PAGES.map((sp) => {
          const page = pages.find((p) => p.id === sp.id);
          const isEditing = editing?.id === sp.id;

          return (
            <div
              key={sp.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileEdit className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{sp.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{sp.route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={sp.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() =>
                      setEditing(
                        isEditing
                          ? null
                          : page ?? {
                              id: sp.id,
                              title: sp.label,
                              body: "",
                              metaTitle: "",
                              metaDescription: "",
                            },
                      )
                    }
                    className="rounded-lg bg-[var(--muted)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
                  >
                    {isEditing ? "Cancel" : "Edit SEO"}
                  </button>
                </div>
              </div>

              {isEditing && editing && (
                <div className="space-y-4 px-6 py-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Meta Title</label>
                    <input
                      className={inputCls}
                      value={editing.metaTitle ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, metaTitle: e.target.value })
                      }
                      placeholder="SEO page title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Meta Description</label>
                    <textarea
                      className={inputCls + " min-h-[80px] resize-y"}
                      value={editing.metaDescription ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, metaDescription: e.target.value })
                      }
                      placeholder="SEO meta description (150-160 characters recommended)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">OG Image URL</label>
                    <input
                      className={inputCls}
                      value={editing.ogImageUrl ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, ogImageUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
