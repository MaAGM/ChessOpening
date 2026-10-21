import { getSupabaseClient } from "@/lib/supabase/client";

export type AuthResult = { error: string | null };

const NOT_CONFIGURED: AuthResult = {
  error: "Supabase n'est pas configuré (variables d'environnement manquantes).",
};

/**
 * Envoie un lien de connexion par e-mail. Le compte est créé à la première connexion.
 * L'URL de retour doit figurer dans Authentication > URL Configuration > Redirect URLs.
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return NOT_CONFIGURED;

  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: window.location.origin },
  });
  return { error: error ? error.message : null };
}

/** Redirige vers Google (le fournisseur doit être activé dans le dashboard Supabase). */
export async function signInWithGoogle(): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return NOT_CONFIGURED;

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  return { error: error ? error.message : null };
}

/** Déconnecte cet appareil uniquement (les autres sessions du compte restent ouvertes). */
export async function signOut(): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return NOT_CONFIGURED;

  const { error } = await client.auth.signOut({ scope: "local" });
  return { error: error ? error.message : null };
}
