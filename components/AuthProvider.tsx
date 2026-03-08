"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AppUser } from "@/lib/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { getClientAuth } = await import("@/lib/firebase/client");
        const { onAuthStateChanged } = await import("firebase/auth");
        const auth = getClientAuth();

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const tokenResult = await firebaseUser.getIdTokenResult();
            const role = tokenResult.claims.role === "admin" ? "admin" : "customer";
            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role,
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
        setUser(null);
      }
    })();

    return () => unsubscribe?.();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
