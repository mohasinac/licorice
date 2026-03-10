"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { KeyRound, Eye, EyeOff, ExternalLink, CheckCircle, XCircle, Loader2, Unlink } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ── Auth token helper ───────────────────────────────────────────────────────

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

// ── Types ───────────────────────────────────────────────────────────────────

interface KeyState {
  // Razorpay
  razorpayKeyId: string;
  razorpayKeyIdIsSet?: boolean;
  razorpayKeySecret: string;
  razorpayKeySecretIsSet?: boolean;
  razorpayOAuthConnected?: boolean;
  razorpayOAuthAccountId?: string;
  // Resend
  resendApiKey: string;
  resendApiKeyIsSet?: boolean;
  resendFromEmail: string;
  // Shiprocket
  shiprocketEmail: string;
  shiprocketPassword: string;
  shiprocketPasswordIsSet?: boolean;
  shiprocketChannelId: string;
  // Admin emails
  adminEmails: string;
}

const EMPTY: KeyState = {
  razorpayKeyId: "",
  razorpayKeySecret: "",
  resendApiKey: "",
  resendFromEmail: "",
  shiprocketEmail: "",
  shiprocketPassword: "",
  shiprocketChannelId: "",
  adminEmails: "",
};

// ── Sub-components ──────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono";

function SecretInput({
  label,
  sublabel,
  value,
  isSet,
  placeholder,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: string;
  isSet?: boolean;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {isSet && (
          <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" /> Saved
          </span>
        )}
      </div>
      {sublabel && <p className="mb-1.5 text-xs text-muted-foreground">{sublabel}</p>}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={inputCls + " pr-10"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSet ? "Leave blank to keep existing value" : placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted px-6 py-4">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </section>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function IntegrationsSettingsPage() {
  const token = useAdminToken();
  const searchParams = useSearchParams();
  const [data, setData] = useState<KeyState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Show OAuth result toast
  useEffect(() => {
    const oauthResult = searchParams.get("razorpay_oauth");
    if (oauthResult === "success") {
      toast.success("Razorpay account connected via OAuth!");
    } else if (oauthResult === "error") {
      const reason = searchParams.get("reason") ?? "unknown";
      toast.error(`Razorpay OAuth failed: ${reason}`);
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings/integration-keys", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData((prev) => ({ ...prev, ...json }));
    } catch {
      toast.error("Failed to load integration keys");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token !== null) load();
  }, [load, token]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/integration-keys", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          razorpayKeyId: data.razorpayKeyId || undefined,
          razorpayKeySecret: data.razorpayKeySecret || undefined,
          resendApiKey: data.resendApiKey || undefined,
          resendFromEmail: data.resendFromEmail || undefined,
          shiprocketEmail: data.shiprocketEmail || undefined,
          shiprocketPassword: data.shiprocketPassword || undefined,
          shiprocketChannelId: data.shiprocketChannelId || undefined,
          adminEmails: data.adminEmails || undefined,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Integration keys saved!");
      // Reload to get updated masks
      setData(EMPTY);
      setLoading(true);
      await load();
    } catch {
      toast.error("Failed to save keys");
    } finally {
      setSaving(false);
    }
  };

  const [connecting, setConnecting] = useState(false);

  const connectOAuth = async () => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch("/api/payment/razorpay/oauth/connect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json() as { authUrl?: string; error?: string };
      if (!res.ok || !json.authUrl) {
        toast.error(json.error ?? "Failed to start OAuth flow");
        return;
      }
      // Redirect the browser to Razorpay's authorization page
      window.location.href = json.authUrl;
    } catch {
      toast.error("Failed to initiate OAuth");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectOAuth = async () => {
    if (!confirm("Disconnect Razorpay OAuth? You can reconnect or use manual keys.")) return;
    setDisconnecting(true);
    try {
      const fields = [
        "razorpayOAuthAccessToken",
        "razorpayOAuthRefreshToken",
        "razorpayOAuthAccountId",
        "razorpayOAuthExpiresAt",
      ];
      await Promise.all(
        fields.map((f) =>
          fetch(`/api/admin/settings/integration-keys?field=${f}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ),
      );
      toast.success("Razorpay OAuth disconnected");
      await load();
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const set = (key: keyof KeyState, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-5">
        <div className="flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Integrations</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              API keys are encrypted with AES-256-GCM before being stored in the database.
            </p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-secondary disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save Keys"}
        </button>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        {/* Razorpay OAuth */}
        <Section title="Razorpay — OAuth Connection">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Connect your Razorpay account via OAuth (recommended). This lets the platform
                create payment orders and issue refunds on your behalf without storing a static
                secret key.
              </p>
              {data.razorpayOAuthConnected ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Connected
                    {data.razorpayOAuthAccountId ? ` · Account: ${data.razorpayOAuthAccountId}` : ""}
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Not connected
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={connectOAuth}
                disabled={connecting}
                className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {data.razorpayOAuthConnected ? "Reconnect" : "Connect Razorpay"}
              </button>
              {data.razorpayOAuthConnected && (
                <button
                  onClick={disconnectOAuth}
                  disabled={disconnecting}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {disconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  Disconnect
                </button>
              )}
            </div>
          </div>
          <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            Requires <code className="font-mono">RAZORPAY_CLIENT_ID</code> and{" "}
            <code className="font-mono">RAZORPAY_CLIENT_SECRET</code> environment variables
            (your platform OAuth app credentials from the Razorpay Partner dashboard).
          </p>
        </Section>

        {/* Razorpay Manual Keys */}
        <Section title="Razorpay — Manual Keys">
          <p className="text-xs text-muted-foreground">
            Alternative to OAuth. Manual keys are used only if no OAuth token is connected.
          </p>
          <SecretInput
            label="Key ID"
            sublabel="e.g. rzp_live_..."
            value={data.razorpayKeyId}
            isSet={data.razorpayKeyIdIsSet}
            placeholder="rzp_live_..."
            onChange={(v) => set("razorpayKeyId", v)}
          />
          <SecretInput
            label="Key Secret"
            sublabel="Keep this confidential — stored encrypted"
            value={data.razorpayKeySecret}
            isSet={data.razorpayKeySecretIsSet}
            placeholder="Enter Razorpay secret key"
            onChange={(v) => set("razorpayKeySecret", v)}
          />
        </Section>

        {/* Resend */}
        <Section title="Resend — Transactional Email">
          <SecretInput
            label="API Key"
            sublabel="From your Resend dashboard — stored encrypted"
            value={data.resendApiKey}
            isSet={data.resendApiKeyIsSet}
            placeholder="re_..."
            onChange={(v) => set("resendApiKey", v)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">From Email</label>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Verified sender address in your Resend domain (e.g. orders@yourdomain.com)
            </p>
            <input
              type="email"
              className={inputCls}
              value={data.resendFromEmail}
              onChange={(e) => set("resendFromEmail", e.target.value)}
              placeholder="orders@yourdomain.com"
            />
          </div>
        </Section>

        {/* Shiprocket */}
        <Section title="Shiprocket — Shipping">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Shiprocket Account Email
            </label>
            <input
              type="email"
              className={inputCls}
              value={data.shiprocketEmail}
              onChange={(e) => set("shiprocketEmail", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <SecretInput
            label="Shiprocket Password"
            sublabel="Stored encrypted"
            value={data.shiprocketPassword}
            isSet={data.shiprocketPasswordIsSet}
            placeholder="Your Shiprocket account password"
            onChange={(v) => set("shiprocketPassword", v)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Channel ID</label>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Found in your Shiprocket dashboard under Channels
            </p>
            <input
              type="text"
              className={inputCls}
              value={data.shiprocketChannelId}
              onChange={(e) => set("shiprocketChannelId", e.target.value)}
              placeholder="123456"
            />
          </div>
        </Section>

        {/* Admin Emails */}
        <Section title="Admin Notification Emails">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Recipient Addresses
            </label>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Comma-separated list of emails that receive admin notifications (new orders, corporate
              inquiries, etc.)
            </p>
            <input
              type="text"
              className={inputCls}
              value={data.adminEmails}
              onChange={(e) => set("adminEmails", e.target.value)}
              placeholder="admin@yourdomain.com, ops@yourdomain.com"
            />
          </div>
        </Section>

        {/* Encryption notice */}
        <p className="text-center text-xs text-muted-foreground">
          All secret values are encrypted with AES-256-GCM using the{" "}
          <code className="font-mono">ENCRYPTION_KEY</code> environment variable before being
          written to Firestore. Env vars serve as a fallback if no DB value is set.
        </p>
      </div>
    </div>
  );
}
