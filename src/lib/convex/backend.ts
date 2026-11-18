import type { SyncBackend } from "@/lib/auth/authSync";
import { convexAuthSource } from "./authSource";
import { getConvexClient } from "./client";
import { createConvexReviewRemote } from "./reviewRemote";
import { createConvexRepertoireRemote } from "./repertoireRemote";

/**
 * Backend Convex + Better Auth, ou null si les variables d'environnement manquent.
 * Le client Convex est authentifié par `ConvexBetterAuthProvider` : la session n'est
 * publiée (et la synchronisation démarrée) qu'une fois le jeton accepté par Convex.
 */
export function createConvexBackend(): SyncBackend | null {
  const client = getConvexClient();
  if (!client) return null;
  return {
    authSource: convexAuthSource.source,
    reviewRemote: createConvexReviewRemote(client),
    repertoireRemote: createConvexRepertoireRemote(client),
  };
}
