"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-fetch";

interface WhatsAppProofUploadProps {
  orderId: string;
}

export function WhatsAppProofUpload({ orderId }: WhatsAppProofUploadProps) {
  const t = useTranslations("checkout");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError(t("notImageFile"));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(t("fileTooLarge"));
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

      await apiFetch("/api/payment/whatsapp/submit-proof", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        silent: true,
      });

      setUploaded(true);
    } catch (err: unknown) {
      setError((err as Error).message ?? t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle className="h-5 w-5 flex-none" />
        <p className="text-sm font-medium">
          {t("screenshotReceived")}
        </p>
      </div>
    );
  }

  return (
    <div className="border-border space-y-3 rounded-xl border p-4">
      <p className="text-foreground text-sm font-medium">
        {t("uploadScreenshotTitle")}{" "}
        <span className="text-muted-foreground font-normal">({t("optionalLabel")})</span>
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
          <span className="text-muted-foreground text-sm">{t("clickToSelect")}</span>
          <span className="text-muted-foreground text-xs">{t("fileTypes")}</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
          <ImageIcon className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
          <p className="text-foreground flex-1 truncate text-sm">{file.name}</p>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            {t("changeFile")}
          </button>
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}

      {file && (
        <Button onClick={handleUpload} loading={uploading} className="w-full">
          {t("uploadBtn")}
        </Button>
      )}
    </div>
  );
}
