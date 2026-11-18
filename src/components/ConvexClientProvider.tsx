"use client";

import { useEffect, type ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth/authClient";
import { convexAuthSource } from "@/lib/convex/authSource";
import { getConvexClient } from "@/lib/convex/client";

/**
 * Publie la session dans `convexAuthSource` : invité dès que Convex sait qu'il n'y a pas
 * de session, connecté quand le jeton est accepté et le profil lu.
 */
function ConvexAuthBridge() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      convexAuthSource.publish(null);
      return;
    }
    if (user === undefined) return; // profil en cours de lecture
    convexAuthSource.publish(user);
  }, [isLoading, isAuthenticated, user]);

  return null;
}

/** Fournit le client Convex authentifié par Better Auth (rien si Convex n'est pas configuré). */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = getConvexClient();
  if (!client) return <>{children}</>;

  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      <ConvexAuthBridge />
      {children}
    </ConvexBetterAuthProvider>
  );
}
