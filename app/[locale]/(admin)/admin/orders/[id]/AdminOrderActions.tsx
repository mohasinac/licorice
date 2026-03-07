"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RefundModal } from "@/components/admin/RefundModal";
import type { Order } from "@/lib/types";

interface Props {
  order: Order;
}

export function AdminOrderActions({ order }: Props) {
  const [showRefund, setShowRefund] = useState(false);

  const canRefund = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";

  if (!canRefund) return null;

  return (
    <section className="bg-surface rounded-2xl p-5 shadow-sm">
      <h2 className="text-foreground mb-4 font-semibold">Actions</h2>
      <Button variant="destructive" size="sm" onClick={() => setShowRefund(true)}>
        Process Refund
      </Button>
      <RefundModal
        orderId={order.id}
        orderTotal={order.total}
        paymentMethod={order.paymentMethod}
        open={showRefund}
        onClose={() => setShowRefund(false)}
      />
    </section>
  );
}
