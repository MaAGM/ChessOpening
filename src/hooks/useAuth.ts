"use client";

import { useEffect, useSyncExternalStore } from "react";
import { signInWithGoogle, signOut } from "@/lib/auth/authActions";
import {
  getAuthState,
  getServerAuthState,
  subscribeAuth,
} from "@/lib/auth/authStore";
import { startAuthSync } from "@/lib/auth/authSync";
import { createConvexBackend } from "@/lib/convex/backend";

/** Démarre l'authentification et la synchronisation une seule fois (à appeler à la racine). */
export function useAuthSyncBootstrap(): void {
  useEffect(() => {
    startAuthSync(createConvexBackend());
  }, []);
}

/** État d'authentification (invité / connecté) et actions de connexion. */
export function useAuth() {
  const state = useSyncExternalStore(subscribeAuth, getAuthState, getServerAuthState);

  return {
    ...state,
    isAuthenticated: state.status === "authenticated",
    signInWithGoogle,
    signOut,
  };
}
