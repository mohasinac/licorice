"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus } from "@/lib/types";
import { apiFetch } from "@/lib/api-fetch";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["return_requested", "refunded"],
  cancelled: [],
  return_requested: ["return_picked_up", "cancelled"],
  return_picked_up: ["refunded"],
  refunded: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  return_picked_up: "Return Picked Up",
  refunded: "Refunded",
};

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChanged?: (newStatus: OrderStatus) => void;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusChanged,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const nextStatuses = VALID_TRANSITIONS[status] ?? [];

  async function handleChange(newStatus: OrderStatus) {
    setLoading(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderStatus: newStatus, adminNote: note || undefined }),
      });
      setStatus(newStatus);
      setNote("");
      onStatusChanged?.(newStatus);
      toast.success(`Order status updated to "${STATUS_LABELS[newStatus]}"`);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-muted-foreground text-sm">{STATUS_LABELS[status]}</span>
      </div>

      {nextStatuses.length > 0 && (
        <>
          <textarea
            placeholder="Admin note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="border-border text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((ns) => (
              <Button
                key={ns}
                size="sm"
                variant={ns === "cancelled" || ns === "refunded" ? "destructive" : "outline"}
                onClick={() => handleChange(ns)}
                loading={loading}
              >
                → {STATUS_LABELS[ns]}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
