"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/lib/types";

type SavedAddress = Address & { id: string; isDefault?: boolean };

export default function AddressesPage() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    import("@/lib/firebase/client")
      .then(({ getClientAuth }) => getClientAuth().currentUser?.getIdToken())
      .then(async (token) => {
        const res = await fetch("/api/account/addresses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        setAddresses(data.addresses ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave(address: Address) {
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const token = await getClientAuth().currentUser?.getIdToken();
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(address),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      setAddresses((prev) => [...prev, { ...address, id }]);
      setShowForm(false);
      toast.success("Address saved.");
    } catch {
      toast.error("Failed to save address.");
    }
  }

  if (!user) return null;
  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-foreground text-3xl font-bold">Addresses</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface mb-6 rounded-2xl p-5 shadow-sm">
          <h2 className="text-foreground mb-4 font-semibold">New Address</h2>
          <AddressForm onSubmit={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">No saved addresses.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onDeleted={(id) => setAddresses((prev) => prev.filter((a) => a.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
