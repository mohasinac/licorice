"use client";
// app/[locale]/(auth)/register/page.tsx
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BRAND_NAME } from "@/constants/site";

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const auth = getClientAuth();
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      toast.success("Account created! Welcome to Licorice Herbals.");
      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        toast.error("Password is too weak. Use at least 8 characters.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setLoading(true);
    try {
      const { getClientAuth } = await import("@/lib/firebase/client");
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Account created with Google!");
      router.replace("/");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="bg-background border-border w-full max-w-sm rounded-2xl border p-8 shadow-sm">
        <h1 className="font-heading text-foreground mb-1 text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Join {BRAND_NAME} and start your Ayurvedic journey.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="text"
            label="Full name"
            placeholder="Priya Sharma"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full" size="md">
            Create account
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full"
          onClick={handleGoogleRegister}
          loading={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
