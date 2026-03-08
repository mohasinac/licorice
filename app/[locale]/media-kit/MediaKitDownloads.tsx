"use client";

import { useState } from "react";
import {
  Download,
  Image,
  FileText,
  Newspaper,
  Package,
  FolderOpen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { MediaKitFile, MediaKitCategory } from "@/lib/types";

const CATEGORY_META_ICONS: Record<MediaKitCategory, React.ReactNode> = {
  logo: <Image className="h-5 w-5" />,
  "brand-guide": <FileText className="h-5 w-5" />,
  "press-release": <Newspaper className="h-5 w-5" />,
  "product-images": <Package className="h-5 w-5" />,
  other: <FolderOpen className="h-5 w-5" />,
};

function formatFileSize(bytes: number) {
  if (bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function trackDownload(id: string) {
  // Fire-and-forget analytics
  fetch("/api/media-kit/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).catch(() => {});
}

interface Props {
  files: MediaKitFile[];
}

export function MediaKitDownloads({ files }: Props) {
  const [filter, setFilter] = useState<MediaKitCategory | "all">("all");
  const t = useTranslations("mediaKit");

  const CATEGORY_META: Record<
    MediaKitCategory,
    { label: string; icon: React.ReactNode; description: string }
  > = {
    logo: {
      label: t("catLogos"),
      icon: CATEGORY_META_ICONS.logo,
      description: t("catLogosDesc"),
    },
    "brand-guide": {
      label: t("catBrandGuide"),
      icon: CATEGORY_META_ICONS["brand-guide"],
      description: t("catBrandGuideDesc"),
    },
    "press-release": {
      label: t("catPressRelease"),
      icon: CATEGORY_META_ICONS["press-release"],
      description: t("catPressReleaseDesc"),
    },
    "product-images": {
      label: t("catProductImages"),
      icon: CATEGORY_META_ICONS["product-images"],
      description: t("catProductImagesDesc"),
    },
    other: {
      label: t("catOther"),
      icon: CATEGORY_META_ICONS.other,
      description: t("catOtherDesc"),
    },
  };

  // Group files by category
  const categories = Array.from(new Set(files.map((f) => f.category)));
  const filtered = filter === "all" ? files : files.filter((f) => f.category === filter);

  return (
    <div>
      {/* Filter tabs */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterAll", { count: files.length })}
          </button>
          {categories.map((cat) => {
            const count = files.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {CATEGORY_META[cat]?.label ?? cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* File cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((file) => {
          const meta = CATEGORY_META[file.category];
          return (
            <div
              key={file.id}
              className="ayur-card group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {meta?.icon ?? <FolderOpen className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-foreground text-lg font-semibold">
                    {file.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {meta?.label ?? file.category}
                    {file.fileSize > 0 && ` · ${formatFileSize(file.fileSize)}`}
                  </p>
                </div>
              </div>

              {file.description && (
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {file.description}
                </p>
              )}

              <div className="mt-auto">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDownload(file.id)}
                  className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadBtn")}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
