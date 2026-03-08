"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { PaymentMethod } from "@/lib/types";
import { apiFetch } from "@/lib/api-fetch";

interface RefundModalProps {
  orderId: string;
  orderTotal: number;
  paymentMethod: PaymentMethod;
  open: boolean;
  onClose: () => void;
  onRefunded?: () => void;
}

export function RefundModal({
  orderId,
  orderTotal,
  paymentMethod,
  open,
  onClose,
  onRefunded,
}: RefundModalProps) {
  const [amount, setAmount] = useState(String(orderTotal));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRefund() {
    const refundAmount = parseFloat(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      toast.error("Enter a valid refund amount.");
      return;
    }
    if (!note.trim()) {
      toast.error("Please enter a reason for the refund.");
      return;
    }

    setLoading(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      await apiFetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: refundAmount, note }),
      });
      toast.success("Refund processed.");
      onRefunded?.();
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title="Process Refund"
      description={
        paymentMethod === "razorpay"
          ? "This will initiate a Razorpay refund."
          : "Record a manual refund note (WhatsApp / COD orders)."
      }
    >
      <div className="space-y-4 pt-2">
        <div>
          <label className="text-foreground mb-1 block text-sm font-medium">
            Refund Amount (₹)
          </label>
          <input
            type="number"
            min={1}
            max={orderTotal}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-border text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          <p className="text-muted-foreground mt-1 text-xs">Max: ₹{orderTotal}</p>
        </div>

        <div>
          <label className="text-foreground mb-1 block text-sm font-medium">Reason / Note *</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Customer returned damaged item"
            className="border-border text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleRefund} loading={loading} variant="destructive">
            Process Refund
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
