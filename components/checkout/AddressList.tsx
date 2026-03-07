"use client";

import { useState } from "react";
import { Plus, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "./AddressForm";
import type { Address } from "@/lib/types";

interface AddressListProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
  onAddNew: (address: Address) => void;
}

export function AddressList({ addresses, selectedAddress, onSelect, onAddNew }: AddressListProps) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [saving, setSaving] = useState(false);

  async function handleAdd(address: Address) {
    setSaving(true);
    await onAddNew(address);
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr, i) => {
        const isSelected =
          selectedAddress?.line1 === addr.line1 && selectedAddress?.pincode === addr.pincode;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(addr)}
            className={[
              "w-full rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-primary ring-1"
                : "border-border hover:border-primary/50",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <MapPin
                  className={[
                    "mt-0.5 h-4 w-4 flex-none",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                />
                <div className="text-sm">
                  <p className="text-foreground font-semibold">{addr.name}</p>
                  <p className="text-muted-foreground">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p className="text-muted-foreground">{addr.phone}</p>
                </div>
              </div>
              {isSelected && (
                <span className="bg-primary flex h-5 w-5 flex-none items-center justify-center rounded-full">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
            </div>
          </button>
        );
      })}

      {showForm ? (
        <div className="border-border rounded-xl border p-4">
          <h3 className="text-foreground mb-4 font-medium">New Address</h3>
          <AddressForm onSubmit={handleAdd} loading={saving} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      )}
    </div>
  );
}
