"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api-fetch";

interface CouponResult {
  valid: boolean;
  discountAmount?: number;
  type?: string;
  error?: string;
}

interface CouponInputProps {
  cartTotal: number;
  userId?: string;
  cartItems?: { productId: string; category: string }[];
  onApplied?: (code: string, discountAmount: number) => void;
  onRemoved?: () => void;
  appliedCode?: string;
}

export function CouponInput({
  cartTotal,
  userId,
  cartItems,
  onApplied,
  onRemoved,
  appliedCode,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<CouponResult>("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), cartTotal, userId, cartItems }),
      });
      if (data.valid && data.discountAmount !== undefined) {
        onApplied?.(code.trim().toUpperCase(), data.discountAmount);
        setCode("");
      } else {
        setError(data.error ?? "Invalid coupon code.");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
        <div className="flex items-center gap-2 text-green-700">
          <Tag className="h-4 w-4" />
          <span className="font-medium">{appliedCode}</span>
          <span className="text-green-600">applied</span>
        </div>
        <button
          onClick={onRemoved}
          className="text-green-700 transition-colors hover:text-red-600"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          className="flex-1"
        />
        <Button onClick={handleApply} loading={loading} disabled={!code.trim()} size="sm">
          Apply
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
