import { ConvexReactClient } from "convex/react";

// Next.js n'injecte ces variables à la compilation que si elles sont écrites
// littéralement sous la forme `process.env.NEXT_PUBLIC_…` (pas de destructuration).
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

/** Faux si les variables d'environnement manquent : l'application reste alors en mode invité. */
export const isConvexConfigured = Boolean(convexUrl && convexSiteUrl);

let client: ConvexReactClient | null = null;

/** Client Convex partagé (provider React et synchronisation) ; null si non configuré. */
export function getConvexClient(): ConvexReactClient | null {
  if (!convexUrl) return null;
  client ??= new ConvexReactClient(convexUrl);
  return client;
}
