"use client";
// components/admin/ShipOrderModal.tsx
// Two-tab modal for shipping an order: Shiprocket or Manual override.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Package, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface ShipOrderModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "shiprocket" | "manual";

export function ShipOrderModal({ orderId, orderNumber, isOpen, onClose }: ShipOrderModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("shiprocket");
  const [loading, setLoading] = useState(false);

  // Manual shipping form state
  const [courierName, setCourierName] = useState("");
  const [awbCode, setAwbCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  async function handleShiprocket() {
    setLoading(true);
    try {
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) {
        const err = await res.text();
        toast.error(`Shiprocket error: ${err}`);
        return;
      }

      const data = await res.json();
      toast.success(`Shipment created! AWB: ${data.awbCode ?? "pending assignment"}`);
      onClose();
      router.refresh();
    } catch {
      toast.error("Failed to create Shiprocket shipment");
    } finally {
      setLoading(false);
    }
  }

  async function handleManual() {
    if (!courierName.trim()) {
      toast.error("Courier name is required");
      return;
    }
    if (!awbCode.trim()) {
      toast.error("AWB / tracking number is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierName: courierName.trim(),
          awbCode: awbCode.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        toast.error(`Error: ${err}`);
        return;
      }

      toast.success("Manual shipping details saved");
      onClose();
      router.refresh();
    } catch {
      toast.error("Failed to save shipping details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title={`Ship Order ${orderNumber}`}
      description="Choose how to ship this order"
    >
      {/* Tab strip */}
      <div className="border-border mb-6 flex border-b">
        <button
          type="button"
          onClick={() => setTab("shiprocket")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "shiprocket"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" />
          Shiprocket
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Manual Override
        </button>
      </div>

      {/* Shiprocket tab */}
      {tab === "shiprocket" && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Creates a Shiprocket shipment automatically. An AWB number and courier will be assigned
            by Shiprocket based on serviceability and cost.
          </p>
          <div className="bg-muted/50 rounded-lg p-3 text-xs">
            <p className="font-medium">What happens next:</p>
            <ol className="text-muted-foreground mt-1 list-inside list-decimal space-y-1">
              <li>Shipment created in Shiprocket</li>
              <li>AWB code + courier assigned</li>
              <li>Order status updated to &quot;Shipped&quot;</li>
              <li>Webhook updates will track progress automatically</li>
            </ol>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleShiprocket}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Shipment"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Manual tab */}
      {tab === "manual" && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Enter courier details manually when Shiprocket is unavailable.
          </p>
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              Courier Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. BlueDart, DTDC, Delhivery"
              className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              AWB / Tracking Number <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={awbCode}
              onChange={(e) => setAwbCode(e.target.value)}
              placeholder="e.g. 1234567890"
              className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-foreground mb-1 block text-sm font-medium">
              Tracking URL (optional)
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://www.bluedart.com/tracking/..."
              className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleManual}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Shipping Details"
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
