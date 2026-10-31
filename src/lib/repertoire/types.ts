import type { Arrow } from "@/lib/data/openings/types";
import type { Side } from "@/lib/review/types";

/** Appréciation d'un coup (symboles PGN usuels). */
export const MOVE_SYMBOLS = ["!", "?", "!!", "??", "!?", "?!"] as const;
export type MoveSymbol = (typeof MOVE_SYMBOLS)[number];

export function isMoveSymbol(value: unknown): value is MoveSymbol {
  return typeof value === "string" && (MOVE_SYMBOLS as readonly string[]).includes(value);
}

/** Identifiant de la racine (position initiale) : parent des premiers coups. */
export const ROOT_ID = "root";

/**
 * Nœud de l'arbre d'un répertoire : un coup, ses annotations et ses suites.
 *
 * RÈGLE : les nœuds sont immuables. Toutes les opérations (repertoireTree.ts)
 * renvoient de nouveaux tableaux et ne modifient jamais leurs entrées.
 * INVARIANT : deux frères n'ont jamais le même `san`.
 */
export type RepertoireNode = {
  /** Identifiant court et stable : sélection, annulation, synchronisation. */
  id: string;
  /** Coup canonique (SAN) menant à cette position. */
  san: string;
  symbol?: MoveSymbol;
  /** Note ou explication du coup / du plan. */
  comment?: string;
  arrows?: Arrow[];
  /** children[0] = ligne principale ; les suivants sont des variantes. */
  children: RepertoireNode[];
};

/** Tout ce qui porte un arbre : un répertoire, ou un simple conteneur de premiers coups. */
export type TreeRoot = { children: RepertoireNode[] };

export type RepertoireOrigin =
  | { kind: "custom" }
  | { kind: "template"; templateId: string; version: number };

export type Repertoire = {
  /** UUID (deviendra la clé cloud). */
  id: string;
  name: string;
  /** Couleur du joueur. */
  side: Side;
  /** Dossier libre : « 1.e4 contre la Sicilienne ». */
  category: string | null;
  /** Participe à la révision. */
  reviewEnabled: boolean;
  comment?: string;
  /** Premiers coups depuis la position initiale. */
  children: RepertoireNode[];
  origin: RepertoireOrigin;
  createdAt: number;
  updatedAt: number;
};

/** Un répertoire sans ses champs générés par le store. */
export type RepertoireDraft = Omit<Repertoire, "id" | "createdAt" | "updatedAt">;

export type RepertoireStoreState = {
  version: 1;
  repertoires: Record<string, Repertoire>;
  /** Ordre d'affichage (ids de répertoires). */
  order: string[];
};
