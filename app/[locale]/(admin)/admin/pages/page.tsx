"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { PageDoc } from "@/lib/types";
import { FileText, Pencil } from "lucide-react";

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

export default function PagesAdminPage() {
  const token = useAdminToken();
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageDoc | null>(null);

  const load = () =>
    fetch("/api/admin/pages")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => { setPages(d); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const res = await fetch("/api/admin/pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(editing),
    });
    if (res.ok) { toast.success("Page saved!"); setEditing(null); load(); }
    else toast.error("Failed to save");
  };

  if (loading)
    return <div className="p-8"><div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--muted)]" />)}</div></div>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-card px-6 py-5">
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Pages</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Edit static pages like About, Policies etc.</p>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {editing ? (
          <div className="rounded-xl border border-[var(--border)] bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold">Editing: {editing.title}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">ID</label>
                <input className={inputCls + " bg-[var(--muted)]"} value={editing.id} readOnly />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Meta Description</label>
                <input className={inputCls} value={editing.metaDescription || ""} onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Body (HTML)</label>
                <textarea
                  className={inputCls + " font-mono text-xs resize-y"}
                  rows={16}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={save} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)]">Save</button>
              <button onClick={() => setEditing(null)} className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--muted)]">Cancel</button>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-[var(--muted-foreground)]"><FileText className="mb-3 h-10 w-10" /><p>No pages found.</p></div>
        ) : (
          <div className="space-y-4">
            {pages.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-card p-5 shadow-sm">
                <div>
                  <span className="font-medium text-[var(--foreground)]">{p.title}</span>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">/{p.id}</span>
                </div>
                <button
                  onClick={() => setEditing(p)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--muted)]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
