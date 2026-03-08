"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { HomepageSections, BrandValueItem, InstagramReelItem } from "@/lib/types";
import { Plus, Trash2, GripVertical, Instagram } from "lucide-react";

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

export default function HomepageSettingsPage() {
  const token = useAdminToken();
  const [data, setData] = useState<HomepageSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/homepage")
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings/homepage", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) toast.success("Homepage sections saved!");
    else toast.error("Failed to save");
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  if (!data) return <div className="p-8 text-[var(--muted-foreground)]">Failed to load.</div>;

  const setHero = (key: string, value: string) =>
    setData({ ...data, heroBanner: { ...data.heroBanner, [key]: value } });

  const setVis = (key: string, value: boolean) =>
    setData({ ...data, sectionVisibility: { ...data.sectionVisibility, [key]: value } });

  const updateBrandValue = (idx: number, field: keyof BrandValueItem, value: string) => {
    const values = [...data.brandValues];
    values[idx] = { ...values[idx], [field]: value };
    setData({ ...data, brandValues: values });
  };

  const addBrandValue = () =>
    setData({
      ...data,
      brandValues: [...data.brandValues, { icon: "Star", title: "", description: "" }],
    });

  const removeBrandValue = (idx: number) =>
    setData({ ...data, brandValues: data.brandValues.filter((_, i) => i !== idx) });

  const updateReel = (idx: number, field: keyof InstagramReelItem, value: string) => {
    const reels = [...data.instagramReels];
    reels[idx] = { ...reels[idx], [field]: value };
    setData({ ...data, instagramReels: reels });
  };

  const addReel = () =>
    setData({
      ...data,
      instagramReels: [
        ...data.instagramReels,
        {
          id: `r${Date.now()}`,
          caption: "",
          reelUrl: "",
          thumbnailUrl: "",
          sortOrder: data.instagramReels.length + 1,
        },
      ],
    });

  const removeReel = (idx: number) =>
    setData({ ...data, instagramReels: data.instagramReels.filter((_, i) => i !== idx) });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Homepage Sections
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Edit hero banner, featured products, brand values, and section visibility.
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
        {/* Hero Banner */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
              Hero Banner
            </h3>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Headline
              </label>
              <input
                className={inputCls}
                value={data.heroBanner.headline}
                onChange={(e) => setHero("headline", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                Subheadline
              </label>
              <textarea
                className={inputCls + " resize-none"}
                rows={2}
                value={data.heroBanner.subheadline}
                onChange={(e) => setHero("subheadline", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Primary CTA Text
                </label>
                <input
                  className={inputCls}
                  value={data.heroBanner.primaryCtaText}
                  onChange={(e) => setHero("primaryCtaText", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Primary CTA Link
                </label>
                <input
                  className={inputCls}
                  value={data.heroBanner.primaryCtaHref}
                  onChange={(e) => setHero("primaryCtaHref", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Secondary CTA Text
                </label>
                <input
                  className={inputCls}
                  value={data.heroBanner.secondaryCtaText}
                  onChange={(e) => setHero("secondaryCtaText", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Secondary CTA Link
                </label>
                <input
                  className={inputCls}
                  value={data.heroBanner.secondaryCtaHref}
                  onChange={(e) => setHero("secondaryCtaHref", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Product IDs */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
              Featured Products
            </h3>
          </div>
          <div className="px-6 py-5">
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Product IDs (comma-separated)
            </label>
            <input
              className={inputCls}
              value={data.featuredProductIds.join(", ")}
              onChange={(e) =>
                setData({
                  ...data,
                  featuredProductIds: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="prod_kumkumadi_oil, prod_vitamin_c_serum"
            />
          </div>
        </section>

        {/* New Arrival IDs */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
              New Arrivals
            </h3>
          </div>
          <div className="px-6 py-5">
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Product IDs (comma-separated)
            </label>
            <input
              className={inputCls}
              value={data.newArrivalIds.join(", ")}
              onChange={(e) =>
                setData({
                  ...data,
                  newArrivalIds: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="prod_under_eye_elixir, prod_spf50_sunscreen"
            />
          </div>
        </section>

        {/* Brand Values */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
              Brand Values
            </h3>
            <button
              onClick={addBrandValue}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="space-y-4 px-6 py-5">
            {data.brandValues.map((bv, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
              >
                <GripVertical className="mt-2 h-4 w-4 flex-shrink-0 text-[var(--muted-foreground)]" />
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputCls}
                      placeholder="Icon name (e.g. Leaf)"
                      value={bv.icon}
                      onChange={(e) => updateBrandValue(idx, "icon", e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="Title"
                      value={bv.title}
                      onChange={(e) => updateBrandValue(idx, "title", e.target.value)}
                    />
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Description"
                    value={bv.description}
                    onChange={(e) => updateBrandValue(idx, "description", e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeBrandValue(idx)}
                  className="mt-2 text-[var(--destructive)] hover:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Instagram Reels */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-[var(--primary)]" />
              <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
                Instagram Reels
              </h3>
            </div>
            <button
              onClick={addReel}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
            >
              <Plus className="h-4 w-4" /> Add Reel
            </button>
          </div>
          <div className="space-y-4 px-6 py-5">
            <p className="text-xs text-[var(--muted-foreground)]">
              Paste Instagram reel URLs (e.g. https://www.instagram.com/reel/ABC123/). They will be
              embedded on the homepage.
            </p>
            {data.instagramReels.map((reel, idx) => (
              <div
                key={reel.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
              >
                <GripVertical className="mt-2 h-4 w-4 flex-shrink-0 text-[var(--muted-foreground)]" />
                <div className="flex-1 space-y-2">
                  <input
                    className={inputCls}
                    placeholder="Reel URL (https://www.instagram.com/reel/...)"
                    value={reel.reelUrl ?? ""}
                    onChange={(e) => updateReel(idx, "reelUrl", e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Caption (optional)"
                    value={reel.caption}
                    onChange={(e) => updateReel(idx, "caption", e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeReel(idx)}
                  className="mt-2 text-[var(--destructive)] hover:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {data.instagramReels.length === 0 && (
              <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                No reels added yet. Click &ldquo;Add Reel&rdquo; to embed Instagram content.
              </p>
            )}
          </div>
        </section>

        {/* Section Visibility */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted)] px-6 py-4">
            <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">
              Section Visibility
            </h3>
          </div>
          <div className="space-y-3 px-6 py-5">
            {(
              [
                ["showBeforeAfter", "Before & After Gallery"],
                ["showTestimonials", "Testimonials Carousel"],
                ["showBlog", "Blog Preview"],
                ["showNewsletter", "Newsletter Banner"],
                ["showBrandValues", "Brand Values"],
                ["showInstagramReels", "Instagram Reels"],
                ["showTrustBadges", "Trust Badges"],
                ["showBrandStory", "Brand Story"],
                ["showConcernGrid", "Concern Grid"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0"
              >
                <span className="text-sm text-[var(--foreground)]">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.sectionVisibility[key]}
                  onClick={() => setVis(key, !data.sectionVisibility[key])}
                  className={
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
                    (data.sectionVisibility[key] ? "bg-[var(--primary)]" : "bg-[var(--border)]")
                  }
                >
                  <span
                    className={
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
                      (data.sectionVisibility[key] ? "translate-x-6" : "translate-x-1")
                    }
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
