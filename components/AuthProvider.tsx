"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { isFirebaseReady } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isFirebaseReady()) {
      // Seed mode — no authenticated user by default
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { getClientAuth } = await import("@/lib/firebase/client");
        const { onAuthStateChanged } = await import("firebase/auth");
        const auth = getClientAuth();

        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: "customer",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setUser(appUser);
          } else {
            setUser(null);
          }
        });
      } catch (err) {
        console.warn("[AuthProvider] Firebase auth setup failed:", err);
        setLoading(false);
      }
    })();

    return () => unsubscribe?.();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
