import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Next.js n'injecte ces variables à la compilation que si elles sont écrites
// littéralement sous la forme `process.env.NEXT_PUBLIC_…` (pas de destructuration).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Faux si les variables d'environnement manquent : l'application reste alors en mode invité. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | null = null;

/**
 * Client Supabase typé (singleton, navigateur uniquement).
 * Renvoie null côté serveur ou quand Supabase n'est pas configuré, pour que
 * l'application continue de fonctionner en mode invité (localStorage).
 */
export function getSupabaseClient(): TypedSupabaseClient | null {
  if (typeof window === "undefined" || !supabaseUrl || !supabaseAnonKey) return null;

  if (browserClient === null) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // récupère la session au retour d'un lien magique / OAuth
      },
    });
  }

  return browserClient;
}
