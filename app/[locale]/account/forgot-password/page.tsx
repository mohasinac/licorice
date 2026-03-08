"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BRAND_NAME } from "@/constants/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const auth = getClientAuth();
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        toast.error("No account found with that email.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="bg-background border-border w-full max-w-sm rounded-2xl border p-8 shadow-sm">
        <h1 className="font-heading text-foreground mb-1 text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Enter your email and we&apos;ll send you a link to reset your {BRAND_NAME} account
          password.
        </p>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="bg-success/10 text-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-foreground text-sm font-medium">Reset link sent!</p>
            <p className="text-muted-foreground text-sm">
              Check your inbox at <strong>{email}</strong> and follow the link to set a new
              password.
            </p>
            <Link
              href="/login"
              className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button type="submit" loading={loading} className="w-full" size="md">
                Send Reset Link
              </Button>
            </form>
            <p className="text-muted-foreground mt-6 text-center text-sm">
              Remember your password?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
