"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Tag, X } from "lucide-react";
import type { Category } from "@/lib/types";

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

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Props {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: Props) {
  const token = useAdminToken();
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function openNew() {
    setEditing(null);
    setLabel("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setLabel(cat.label);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.imageUrl ?? "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSave() {
    if (!label.trim() || !slug.trim()) {
      toast.error("Label and slug are required");
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      label: label.trim(),
      slug: slug.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
    };
    if (editing) payload.id = editing.id;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      toast.success(editing ? "Category updated!" : "Category created!");
      // Refresh list
      const updated = await fetch("/api/admin/categories").then((r) => r.json());
      setCategories(updated);
      closeForm();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "Failed to save");
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.label}"? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id: cat.id }),
    });
    if (res.ok) {
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } else {
      toast.error("Failed to delete category");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"} defined
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Form dialog */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {editing ? "Edit Category" : "New Category"}
            </h2>
            <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Label</label>
              <input
                className={inputCls}
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  if (!editing) setSlug(slugify(e.target.value));
                }}
                placeholder="Face Care"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <input
                className={inputCls}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="face-care"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <input
                className={inputCls}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Products for face care..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Image URL (optional)</label>
              <input
                className={inputCls}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              onClick={closeForm}
              className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <Tag className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-medium">No categories yet</p>
          <p className="text-muted-foreground mt-1 text-sm">Click "Add Category" to create one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-medium tracking-wider uppercase">
                <th className="text-muted-foreground px-4 py-3">#</th>
                <th className="text-muted-foreground px-4 py-3">Label</th>
                <th className="text-muted-foreground px-4 py-3">Slug</th>
                <th className="text-muted-foreground px-4 py-3">Description</th>
                <th className="text-muted-foreground px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className="hover:bg-background border-b last:border-0">
                  <td className="text-muted-foreground px-4 py-3 text-sm">{i + 1}</td>
                  <td className="text-foreground px-4 py-3 text-sm font-medium">{cat.label}</td>
                  <td className="px-4 py-3">
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-xs">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="text-muted-foreground max-w-xs truncate px-4 py-3 text-sm">
                    {cat.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
