"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api-fetch";

export default function ProfilePage() {
  const { user, loading, clearUser } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sync displayName when user loads (auth store hydrates async)
  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user?.displayName]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) router.replace(`/${locale}/login`);
  }, [loading, user, router, locale]);

  if (loading || !user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      const { updateProfile } = await import("firebase/auth");
      if (!auth.currentUser) throw new Error("Not logged in");
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const auth = getClientAuth();
      if (!auth.currentUser) throw new Error("Not logged in");
      const token = await auth.currentUser.getIdToken();
      await apiFetch("/api/account/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await auth.signOut();
      clearUser();
      toast.success("Account deleted.");
      router.replace(`/${locale}`);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">Profile</h1>

      <form onSubmit={handleSave} className="bg-surface space-y-4 rounded-2xl p-6 shadow-sm">
        <div>
          <label className="text-foreground mb-1 block text-sm font-medium">Email</label>
          <Input value={user.email ?? ""} disabled />
        </div>

        <div>
          <label className="text-foreground mb-1 block text-sm font-medium">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
      </form>

      {/* Danger zone */}
      <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-6">
        <h2 className="mb-1 text-base font-semibold text-red-700 dark:text-red-400">Delete Account</h2>
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          This permanently deletes your account and all associated data. This action cannot be
          undone.
        </p>
        <form onSubmit={handleDelete} className="space-y-3">
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            className="border-red-300 bg-card dark:border-red-800 focus:ring-red-400"
          />
          <Button
            type="submit"
            variant="destructive"
            loading={deleting}
            disabled={deleteConfirm !== "DELETE"}
          >
            Delete My Account
          </Button>
        </form>
      </div>
    </div>
  );
}
