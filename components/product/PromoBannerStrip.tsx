import * as React from "react";
import { Tag, Zap, Info, Copy } from "lucide-react";
import type { PromoBanner } from "@/lib/types";

const TYPE_DEFAULTS: Record<
  PromoBanner["type"],
  { bg: string; text: string; icon: React.ElementType }
> = {
  discount: { bg: "#ecfdf5", text: "#065f46", icon: Tag },
  urgency: { bg: "#fef2f2", text: "#991b1b", icon: Zap },
  info: { bg: "#eff6ff", text: "#1e40af", icon: Info },
};

interface PromoBannerStripProps {
  banners: PromoBanner[];
}

export function PromoBannerStrip({ banners }: PromoBannerStripProps) {
  if (banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {banners.map((banner) => (
        <PromoPill key={banner.id} banner={banner} />
      ))}
    </div>
  );
}

function PromoPill({ banner }: { banner: PromoBanner }) {
  const defaults = TYPE_DEFAULTS[banner.type];
  const bgColor = banner.bgColor || defaults.bg;
  const textColor = banner.textColor || defaults.text;
  const Icon = defaults.icon;

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
      {banner.badgeLabel && (
        <span
          className="rounded-md px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide"
          style={{ backgroundColor: textColor, color: bgColor }}
        >
          {banner.badgeLabel}
        </span>
      )}
      <span className="font-medium">{banner.text}</span>
      {banner.couponCode && <CouponChip code={banner.couponCode} textColor={textColor} />}
    </div>
  );
}

function CouponChip({ code, textColor }: { code: string; textColor: string }) {
  return (
    <span
      className="ml-auto flex items-center gap-1 rounded-md border border-current/20 px-2 py-0.5 font-mono text-xs font-bold tracking-widest"
      style={{ color: textColor }}
    >
      {code}
      <CopyButton code={code} />
    </span>
  );
}

function CopyButton({ code }: { code: string }) {
  return (
    <button
      type="button"
      className="opacity-60 hover:opacity-100"
      onClick={() => {
        navigator.clipboard.writeText(code).catch(() => {});
      }}
      aria-label={`Copy coupon code ${code}`}
    >
      <Copy className="h-3 w-3" />
    </button>
  );
}
