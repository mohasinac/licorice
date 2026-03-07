"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, PackageCheck, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
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
  const router = useRouter();
  const [showRefund, setShowRefund] = useState(false);
  const [showShip, setShowShip] = useState(false);
  const [initiatingReturn, setInitiatingReturn] = useState(false);

  const canRefund = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";
  const canShip =
    SHIPPABLE_STATUSES.includes(order.orderStatus) && !order.shiprocketOrderId && !order.manualShipping;
  const canInitiateReturn = order.orderStatus === "return_requested";
  const canMarkReturnReceived = order.orderStatus === "return_picked_up";

  async function handleInitiateReturn() {
    setInitiatingReturn(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/shiprocket/create-return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to initiate return");
      }

      toast.success("Return pick-up initiated successfully.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not initiate return pickup.");
    } finally {
      setInitiatingReturn(false);
    }
  }

  async function handleRestoreStock() {
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      await fetch(`/api/admin/orders/${order.id}/restore-stock`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // Stock restore is best-effort — errors logged server-side
    } catch {
      // Non-critical — don't block the refund flow
      console.warn("[AdminOrderActions] Stock restore failed silently");
    }
  }

  if (!canRefund && !canShip && !canInitiateReturn && !canMarkReturnReceived) return null;

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
        {canInitiateReturn && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitiateReturn}
            loading={initiatingReturn}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Initiate Return Pickup
          </Button>
        )}
        {canMarkReturnReceived && (
          <Button variant="outline" size="sm" onClick={() => setShowRefund(true)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Return Received — Process Refund
          </Button>
        )}
        {canRefund && !canMarkReturnReceived && (
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
        onRefunded={canMarkReturnReceived ? handleRestoreStock : undefined}
      />
    </section>
  );
}
