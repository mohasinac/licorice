"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RefundModal } from "@/components/admin/RefundModal";
import { ShipOrderModal } from "@/components/admin/ShipOrderModal";
import type { Order } from "@/lib/types";

interface Props {
  order: Order;
}

const SHIPPABLE_STATUSES: Order["orderStatus"][] = [
  "confirmed",
  "processing",
  "ready_to_ship",
];

export function AdminOrderActions({ order }: Props) {
  const [showRefund, setShowRefund] = useState(false);
  const [showShip, setShowShip] = useState(false);

  const canRefund = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";
  const canShip =
    SHIPPABLE_STATUSES.includes(order.orderStatus) && !order.shiprocketOrderId && !order.manualShipping;

  if (!canRefund && !canShip) return null;

  return (
    <section className="bg-surface rounded-2xl p-5 shadow-sm">
      <h2 className="text-foreground mb-4 font-semibold">Actions</h2>
      <div className="flex flex-wrap gap-3">
        {canShip && (
          <Button variant="primary" size="sm" onClick={() => setShowShip(true)}>
            <Truck className="mr-2 h-4 w-4" />
            Ship Order
          </Button>
        )}
        {canRefund && (
          <Button variant="destructive" size="sm" onClick={() => setShowRefund(true)}>
            Process Refund
          </Button>
        )}
      </div>

      <ShipOrderModal
        orderId={order.id}
        orderNumber={order.orderNumber}
        isOpen={showShip}
        onClose={() => setShowShip(false)}
      />
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
