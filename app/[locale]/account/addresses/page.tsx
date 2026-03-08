"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/useAuthStore";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/lib/types";
import { apiFetch } from "@/lib/api-fetch";

type SavedAddress = Address & { id: string; isDefault?: boolean };

export default function AddressesPage() {
  const t = useTranslations("account");
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const { getClientAuth } = await import("@/lib/firebase/client");
        const token = await getClientAuth().currentUser?.getIdToken();
        const data = await apiFetch<{ addresses?: SavedAddress[] }>("/api/account/addresses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
          silent: true,
        });
        if (!cancelled) setAddresses(data?.addresses ?? []);
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user]);

  async function handleSave(address: Address) {
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const token = await getClientAuth().currentUser?.getIdToken();
      const { id } = await apiFetch<{ id: string }>("/api/account/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(address),
      });
      setAddresses((prev) => [...prev, { ...address, id }]);
      setShowForm(false);
      toast.success(t("addressSaved"));
    } catch {}
  }

  if (!user) return null;
  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10">{t("loading")}</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-foreground text-3xl font-bold">{t("addressesTitle")}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> {t("addAddress")}
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface mb-6 rounded-2xl p-5 shadow-sm">
          <h2 className="text-foreground mb-4 font-semibold">{t("newAddress")}</h2>
          <AddressForm onSubmit={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">{t("noAddresses")}</p>
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
