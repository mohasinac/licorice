"use client";
// components/account/ReturnRequestButton.tsx
// Shows a "Request Return" button on the order detail page when within
// the 3-day return window. Clicking opens a form modal.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { RETURN_WINDOW_DAYS } from "@/constants/policies";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
  orderId: string;
  orderNumber: string;
  deliveredAt: string | null; // ISO string or null
}

const RETURN_REASONS = [
  { value: "damaged", label: "Product received damaged" },
  { value: "wrong_item", label: "Wrong item delivered" },
  { value: "defective", label: "Product is defective" },
  { value: "expired", label: "Product is expired" },
];

export function ReturnRequestButton({ orderId, orderNumber, deliveredAt }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => setMounted(true), []);

  // Revoke old preview URLs whenever images change
  useEffect(() => {
    previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrls.current = images.map((f) => URL.createObjectURL(f));
    return () => previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  // Only show if within return window
  if (!deliveredAt || !mounted) return null;
  const deliveredDate = new Date(deliveredAt);
  const daysSinceDelivery = Math.floor(
    (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceDelivery > RETURN_WINDOW_DAYS) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024,
    );
    if (validFiles.length !== files.length) {
      toast.error("Only images up to 5 MB are allowed");
    }
    setImages((prev) => [...prev, ...validFiles].slice(0, 3));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a return reason");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("reason", reason);
      if (note.trim()) formData.append("note", note.trim());
      images.forEach((img) => formData.append("images", img));

      await apiFetch("/api/account/return-request", {
        method: "POST",
        body: formData,
      });

      toast.success("Return request submitted. We'll be in touch within 24 hours.");
      setOpen(false);
      router.refresh();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Request Return
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`Return Request — ${orderNumber}`}
        description="Returns are accepted within 3 days of delivery for damaged, defective, wrong, or expired items only."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-border bg-background text-foreground focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">Select a reason</option>
              {RETURN_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              Additional details (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Describe the issue..."
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/50 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Image uploads */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Photos (up to 3)
            </label>
            {images.length < 3 && (
              <label className="border-border hover:border-primary flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 transition-colors">
                <Upload className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">Upload photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
            {images.length > 0 && (
              <div className="mt-2 flex gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrls.current[i]}
                      alt={`Preview ${i + 1}`}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="bg-destructive absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            Returns are accepted only for damaged, defective, wrong, or expired items within{" "}
            {RETURN_WINDOW_DAYS} days of delivery.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Return Request"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
