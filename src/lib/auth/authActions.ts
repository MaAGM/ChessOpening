import { authClient } from "./authClient";
import { flushPendingSync } from "./authSync";
import { isConvexConfigured } from "@/lib/convex/client";

export type AuthResult = { error: string | null };

const NOT_CONFIGURED: AuthResult = {
  error: "Convex n'est pas configuré (variables d'environnement manquantes).",
};

function errorMessage(error: { message?: string } | null | undefined): string | null {
  if (!error) return null;
  return error.message || "La connexion a échoué.";
}

/**
 * Redirige vers Google (Better Auth). Le compte est créé à la première connexion ; au retour,
 * la progression d'invité est fusionnée avec celle du compte (authSync).
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isConvexConfigured) return NOT_CONFIGURED;

  try {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.href,
    });
    return { error: errorMessage(error) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Déconnecte cet appareil. Les changements en attente sont envoyés d'abord : une fois la
 * session fermée, ils ne pourraient plus l'être (le cache local est alors conservé).
 */
export async function signOut(): Promise<AuthResult> {
  if (!isConvexConfigured) return NOT_CONFIGURED;

  try {
    await flushPendingSync();
    const { error } = await authClient.signOut();
    return { error: errorMessage(error) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
