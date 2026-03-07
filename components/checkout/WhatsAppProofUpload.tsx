"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WhatsAppProofUploadProps {
  orderId: string;
}

export function WhatsAppProofUpload({ orderId }: WhatsAppProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum 5 MB.");
      return;
    }
    setFile(f);
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", orderId);

      const res = await fetch("/api/payment/whatsapp/submit-proof", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Upload failed.");
      }

      setUploaded(true);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
        <CheckCircle className="h-5 w-5 flex-none" />
        <p className="text-sm font-medium">
          Screenshot received — we&apos;ll confirm your order shortly!
        </p>
      </div>
    );
  }

  return (
    <div className="border-border space-y-3 rounded-xl border p-4">
      <p className="text-foreground text-sm font-medium">
        Upload Payment Screenshot{" "}
        <span className="text-muted-foreground font-normal">(Optional)</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-border bg-muted/50 hover:bg-muted flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors"
        >
          <Upload className="text-muted-foreground h-8 w-8" />
          <span className="text-muted-foreground text-sm">Click to select screenshot</span>
          <span className="text-muted-foreground text-xs">JPG, PNG, WebP · Max 5 MB</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
          <ImageIcon className="h-5 w-5 flex-none text-blue-600" />
          <p className="text-foreground flex-1 truncate text-sm">{file.name}</p>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Change
          </button>
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}

      {file && (
        <Button onClick={handleUpload} loading={uploading} className="w-full">
          Upload Screenshot
        </Button>
      )}
    </div>
  );
}
