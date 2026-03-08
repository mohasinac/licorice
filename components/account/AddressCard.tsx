"use client";

import { useState } from "react";
import { MapPin, Trash2, Edit2, Pin } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/lib/types";

interface Props {
  address: Address & { id: string; isDefault?: boolean };
  onDeleted?: (id: string) => void;
  onEdit?: (address: Address & { id: string }) => void;
  onSetDefault?: (id: string) => void;
}

export function AddressCard({ address, onDeleted, onEdit, onSetDefault }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this address?")) return;
    setDeleting(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch(`/api/account/addresses/${address.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Address removed.");
      onDeleted?.(address.id);
    } catch {
      toast.error("Failed to delete address.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="text-primary h-4 w-4 shrink-0" />
          <p className="text-foreground font-medium">{address.name}</p>
        </div>
        {address.isDefault && (
          <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium">
            Default
          </span>
        )}
      </div>

      <div className="text-muted-foreground space-y-0.5 text-sm">
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}, {address.state} {address.pincode}
        </p>
        <p>{address.phone}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(address)} className="gap-1">
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
        {onSetDefault && !address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            className="gap-1"
          >
            <Pin className="h-3.5 w-3.5" /> Set default
          </Button>
        )}
        {onDeleted && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
