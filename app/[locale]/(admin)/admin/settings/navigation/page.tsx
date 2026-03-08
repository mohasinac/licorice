"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { NavigationConfig, NavItem } from "@/lib/types";
import { Plus, Trash2, GripVertical } from "lucide-react";

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
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";

export default function NavigationSettingsPage() {
  const token = useAdminToken();
  const [nav, setNav] = useState<NavigationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/navigation")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((data) => {
        setNav(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!nav) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings/navigation", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(nav),
    });
    setSaving(false);
    if (res.ok) toast.success("Navigation saved!");
    else toast.error("Failed to save");
  };

  const updateMainNavItem = (idx: number, field: keyof NavItem, value: string) => {
    if (!nav) return;
    const items = [...nav.mainNav];
    items[idx] = { ...items[idx], [field]: value };
    setNav({ ...nav, mainNav: items });
  };

  const addMainNavItem = () => {
    if (!nav) return;
    setNav({ ...nav, mainNav: [...nav.mainNav, { label: "", href: "/" }] });
  };

  const removeMainNavItem = (idx: number) => {
    if (!nav) return;
    setNav({ ...nav, mainNav: nav.mainNav.filter((_, i) => i !== idx) });
  };

  const updateFooterLink = (
    section: "shop" | "account" | "policies",
    idx: number,
    field: "label" | "href",
    value: string,
  ) => {
    if (!nav) return;
    const links = [...nav.footerNav[section]];
    links[idx] = { ...links[idx], [field]: value };
    setNav({ ...nav, footerNav: { ...nav.footerNav, [section]: links } });
  };

  const addFooterLink = (section: "shop" | "account" | "policies") => {
    if (!nav) return;
    setNav({
      ...nav,
      footerNav: {
        ...nav.footerNav,
        [section]: [...nav.footerNav[section], { label: "", href: "/" }],
      },
    });
  };

  const removeFooterLink = (section: "shop" | "account" | "policies", idx: number) => {
    if (!nav) return;
    setNav({
      ...nav,
      footerNav: {
        ...nav.footerNav,
        [section]: nav.footerNav[section].filter((_, i) => i !== idx),
      },
    });
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );

  if (!nav)
    return <div className="p-8 text-[var(--muted-foreground)]">Failed to load navigation.</div>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-card px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Navigation</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Edit main nav and footer links.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--secondary)] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        {/* Main Navigation */}
        <section className="rounded-xl border border-[var(--border)] bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
              Main Navigation
            </h3>
            <button
              onClick={addMainNavItem}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
            >
              <Plus className="h-4 w-4" /> Add Link
            </button>
          </div>
          <div className="space-y-3 px-6 py-5">
            {nav.mainNav.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 flex-shrink-0 text-[var(--muted-foreground)]" />
                <input
                  className={inputCls}
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => updateMainNavItem(idx, "label", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="/href"
                  value={item.href}
                  onChange={(e) => updateMainNavItem(idx, "href", e.target.value)}
                />
                <button
                  onClick={() => removeMainNavItem(idx)}
                  className="text-[var(--destructive)] hover:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Sections */}
        {(["shop", "account", "policies"] as const).map((section) => (
          <section
            key={section}
            className="rounded-xl border border-[var(--border)] bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
              <h3 className="font-heading text-base font-semibold text-[var(--foreground)] capitalize">
                Footer — {section}
              </h3>
              <button
                onClick={() => addFooterLink(section)}
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                <Plus className="h-4 w-4" /> Add Link
              </button>
            </div>
            <div className="space-y-3 px-6 py-5">
              {nav.footerNav[section].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 flex-shrink-0 text-[var(--muted-foreground)]" />
                  <input
                    className={inputCls}
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => updateFooterLink(section, idx, "label", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="/href"
                    value={item.href}
                    onChange={(e) => updateFooterLink(section, idx, "href", e.target.value)}
                  />
                  <button
                    onClick={() => removeFooterLink(section, idx)}
                    className="text-[var(--destructive)] hover:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
