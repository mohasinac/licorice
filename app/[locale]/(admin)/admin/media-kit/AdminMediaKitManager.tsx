"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  FileDown,
  X,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  FileText,
  Newspaper,
  Package,
  FolderOpen,
} from "lucide-react";
import type { MediaKitFile, MediaKitCategory } from "@/lib/types";

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

const CATEGORIES: { value: MediaKitCategory; label: string; icon: React.ReactNode }[] = [
  { value: "logo", label: "Logos", icon: <Image className="h-4 w-4" /> },
  { value: "brand-guide", label: "Brand Guide", icon: <FileText className="h-4 w-4" /> },
  { value: "press-release", label: "Press Release", icon: <Newspaper className="h-4 w-4" /> },
  { value: "product-images", label: "Product Images", icon: <Package className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <FolderOpen className="h-4 w-4" /> },
];

function formatFileSize(bytes: number) {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function categoryLabel(cat: MediaKitCategory) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

interface Props {
  initialFiles: MediaKitFile[];
}

export function AdminMediaKitManager({ initialFiles }: Props) {
  const token = useAdminToken();
  const [files, setFiles] = useState(initialFiles);
  const [editing, setEditing] = useState<MediaKitFile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [category, setCategory] = useState<MediaKitCategory>("logo");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  function openNew() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setFileUrl("");
    setFileName("");
    setFileSize(0);
    setMimeType("");
    setCategory("logo");
    setSortOrder(files.length);
    setIsActive(true);
    setShowForm(true);
  }

  function openEdit(file: MediaKitFile) {
    setEditing(file);
    setTitle(file.title);
    setDescription(file.description);
    setFileUrl(file.fileUrl);
    setFileName(file.fileName);
    setFileSize(file.fileSize);
    setMimeType(file.mimeType);
    setCategory(file.category);
    setSortOrder(file.sortOrder);
    setIsActive(file.isActive);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!fileUrl.trim()) {
      toast.error("File URL is required");
      return;
    }
    if (!fileName.trim()) {
      toast.error("File name is required");
      return;
    }

    setSaving(true);
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      fileUrl: fileUrl.trim(),
      fileName: fileName.trim(),
      fileSize,
      mimeType: mimeType.trim() || "application/octet-stream",
      category,
      sortOrder,
      isActive,
    };
    if (editing) payload.id = editing.id;

    try {
      const res = await fetch("/api/admin/media-kit", {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editing ? "File updated!" : "File added!");
        // Refresh by re-fetching from server
        const data = await res.json();
        if (editing) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === editing.id ? { ...f, ...payload, id: editing.id } as MediaKitFile : f,
            ),
          );
        } else {
          setFiles((prev) => [
            ...prev,
            { ...payload, id: data.id, downloads: 0, createdAt: new Date(), updatedAt: new Date() } as MediaKitFile,
          ]);
        }
        closeForm();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(file: MediaKitFile) {
    if (!confirm(`Delete "${file.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/media-kit?id=${encodeURIComponent(file.id)}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      toast.success("File deleted");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } else {
      toast.error("Failed to delete file");
    }
  }

  async function toggleActive(file: MediaKitFile) {
    const res = await fetch("/api/admin/media-kit", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        id: file.id,
        title: file.title,
        description: file.description,
        fileUrl: file.fileUrl,
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        category: file.category,
        sortOrder: file.sortOrder,
        isActive: !file.isActive,
      }),
    });
    if (res.ok) {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isActive: !f.isActive } : f)),
      );
      toast.success(file.isActive ? "File hidden" : "File visible");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={openNew}
          className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add File
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {editing ? "Edit File" : "New File"}
            </h2>
            <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand Logo Pack"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Category *</label>
              <select
                className={inputCls}
                value={category}
                onChange={(e) => setCategory(e.target.value as MediaKitCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                className={inputCls}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this asset..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">File URL *</label>
              <input
                className={inputCls}
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://storage.googleapis.com/... or direct download URL"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">File Name *</label>
              <input
                className={inputCls}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. licorice-logo-pack.zip"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">MIME Type</label>
              <input
                className={inputCls}
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                placeholder="e.g. application/zip"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">File Size (bytes)</label>
              <input
                type="number"
                className={inputCls}
                value={fileSize}
                onChange={(e) => setFileSize(Number(e.target.value))}
                placeholder="0"
              />
              {fileSize > 0 && (
                <p className="text-muted-foreground mt-1 text-xs">{formatFileSize(fileSize)}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Sort Order</label>
              <input
                type="number"
                className={inputCls}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active (visible on public page)
              </label>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Add File"}
            </button>
            <button
              onClick={closeForm}
              className="text-muted-foreground hover:text-foreground rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Files list */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
          <FileDown className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-foreground font-medium">No media kit files yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add downloadable brand assets for press and partners
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-colors ${
                file.isActive ? "border-border" : "border-border/50 opacity-60"
              }`}
            >
              <div className="text-muted-foreground flex-shrink-0">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {CATEGORIES.find((c) => c.value === file.category)?.icon ?? (
                  <FolderOpen className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium truncate">{file.title}</p>
                <p className="text-muted-foreground text-xs">
                  {categoryLabel(file.category)} · {file.fileName} · {formatFileSize(file.fileSize)}
                  {" · "}
                  {file.downloads} download{file.downloads !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(file)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={file.isActive ? "Hide" : "Show"}
                >
                  {file.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => openEdit(file)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
