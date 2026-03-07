"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

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
    </div>
  );
}
