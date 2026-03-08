"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-fetch";

interface WhatsAppPaymentConfirmProps {
  orderId: string;
  orderNumber: string;
  proofImageUrl?: string;
  whatsappNumber?: string;
  onConfirmed?: () => void;
}

export function WhatsAppPaymentConfirm({
  orderId,
  orderNumber,
  proofImageUrl,
  whatsappNumber,
  onConfirmed,
}: WhatsAppPaymentConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      await apiFetch("/api/order-confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId }),
      });
      setConfirmed(true);
      onConfirmed?.();
      toast.success(`Payment confirmed for order #${orderNumber}`);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle className="h-5 w-5 flex-none" />
        <span className="text-sm font-medium">Payment confirmed for #{orderNumber}</span>
      </div>
    );
  }

  return (
    <div className="border-border space-y-4 rounded-xl border p-4">
      <h3 className="text-foreground font-semibold">WhatsApp Payment Verification</h3>

      {proofImageUrl ? (
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Payment Screenshot
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proofImageUrl}
            alt="Payment screenshot"
            className="max-h-64 rounded-xl border object-contain"
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No screenshot uploaded yet. Check WhatsApp for payment confirmation.
        </p>
      )}

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary flex items-center gap-1 text-sm underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open WhatsApp conversation
        </a>
      )}

      <Button onClick={handleConfirm} loading={loading} className="w-full">
        <CheckCircle className="h-4 w-4" />
        Confirm Payment
      </Button>
    </div>
  );
}
