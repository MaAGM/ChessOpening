import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";

/**
 * Utilisateur courant. Équivalent de `auth.uid()` des politiques RLS : toute lecture ou
 * écriture est restreinte à cet identifiant.
 *
 * On utilise `tokenIdentifier` (émetteur + `subject`), unique même si plusieurs fournisseurs
 * d'identité coexistent, comme le recommandent les règles Convex.
 */
export async function requireUserId(ctx: Pick<QueryCtx, "auth">): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Non authentifié");
  return identity.tokenIdentifier;
}

/** Équivalent des contraintes `check` du schéma SQL. */
export function check(condition: boolean, message: string): void {
  if (!condition) throw new ConvexError(message);
}

export function checkLength(value: string, min: number, max: number, field: string): void {
  check(value.length >= min && value.length <= max, `${field} : longueur hors limites (${min}-${max})`);
}

export function checkCount(value: number, field: string): void {
  check(Number.isInteger(value) && value >= 0, `${field} : entier positif attendu`);
}

/** Nombre maximal d'éléments par appel (le client découpe ses envois en lots). */
export const MAX_BATCH = 500;

export function checkBatch(items: readonly unknown[], max = MAX_BATCH): void {
  check(items.length <= max, `Lot trop volumineux (${items.length} > ${max})`);
}

/** Avance maximale tolérée sur l'horloge d'un appareil (garde « la version la plus récente gagne »). */
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
