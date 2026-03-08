"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { ConsultationConfig } from "@/lib/types";
import { Clock, User } from "lucide-react";

function useAdminToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    import("@/lib/firebase/client").then(({ getClientAuth }) => {
      const auth = getClientAuth();
      unsub = auth.onAuthStateChanged(async (user) => {
        if (user) setToken(await user.getIdToken());
        else setToken(null);
      });
    });
    return () => unsub?.();
  }, []);
  return token;
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

export default function ConsultationSettingsPage() {
  const token = useAdminToken();
  const [data, setData] = useState<ConsultationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/consultation")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings/consultation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) toast.success("Saved!");
    else toast.error("Failed to save");
  };

  if (loading) return <div className="p-8"><div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" /></div>;
  if (!data) return <div className="p-8 text-[var(--muted-foreground)]">Failed to load.</div>;

  const addSlot = () => setData({ ...data, availableTimeSlots: [...data.availableTimeSlots, ""] });
  const removeSlot = (idx: number) => setData({ ...data, availableTimeSlots: data.availableTimeSlots.filter((_, i) => i !== idx) });
  const updateSlot = (idx: number, val: string) => {
    const slots = [...data.availableTimeSlots];
    slots[idx] = val;
    setData({ ...data, availableTimeSlots: slots });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Consultation Settings</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Configure your free Ayurvedic consultation.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)] disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Consultations Enabled</span>
            <button type="button" role="switch" aria-checked={data.isEnabled} onClick={() => setData({ ...data, isEnabled: !data.isEnabled })}
              className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (data.isEnabled ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
              <span className={"inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " + (data.isEnabled ? "translate-x-6" : "translate-x-1")} />
            </button>
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <User className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h3 className="font-heading text-base font-semibold">Consultant Information</h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input className={inputCls} value={data.consultantName} onChange={(e) => setData({ ...data, consultantName: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Title / Qualification</label>
              <input className={inputCls} value={data.consultantTitle} onChange={(e) => setData({ ...data, consultantTitle: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Photo URL</label>
              <input className={inputCls} value={data.consultantPhotoUrl || ""} onChange={(e) => setData({ ...data, consultantPhotoUrl: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bio (HTML)</label>
              <textarea className={inputCls + " font-mono text-xs resize-y"} rows={4} value={data.consultantBio} onChange={(e) => setData({ ...data, consultantBio: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Duration (minutes)</label>
              <input className={inputCls} type="number" value={data.consultationDurationMinutes} onChange={(e) => setData({ ...data, consultationDurationMinutes: Number(e.target.value) })} />
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h3 className="font-heading text-base font-semibold">Available Slots</h3>
            </div>
            <button onClick={addSlot} className="text-sm text-[var(--primary)] hover:underline">+ Add Slot</button>
          </div>
          <div className="space-y-3 px-6 py-5">
            {data.availableTimeSlots.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input className={inputCls} value={slot} placeholder="e.g. 10:00 AM" onChange={(e) => updateSlot(idx, e.target.value)} />
                <button onClick={() => removeSlot(idx)} className="text-[var(--destructive)] hover:opacity-70 text-sm px-2">x</button>
              </div>
            ))}
            {data.availableTimeSlots.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No slots configured.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
