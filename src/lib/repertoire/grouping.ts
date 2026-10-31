import type { Side } from "@/lib/review/types";
import type { Repertoire } from "./types";

export type SideFilter = "all" | Side;

export type RepertoireGroup = {
  /** Clé stable (catégorie en minuscules ; chaîne vide pour « sans catégorie »). */
  key: string;
  category: string | null;
  label: string;
  items: Repertoire[];
};

export const UNCATEGORIZED_LABEL = "Sans catégorie";

export function filterBySide(repertoires: Repertoire[], filter: SideFilter): Repertoire[] {
  return filter === "all" ? repertoires : repertoires.filter((r) => r.side === filter);
}

const collator = new Intl.Collator("fr", { sensitivity: "base" });

/**
 * Regroupe par catégorie, sans tenir compte de la casse (« Sicilienne » et « sicilienne »
 * forment un seul groupe, affiché avec la première graphie rencontrée). Les catégories
 * nommées sont triées par ordre alphabétique, « sans catégorie » vient en dernier, et
 * les répertoires gardent leur ordre d'origine à l'intérieur d'un groupe.
 */
export function groupByCategory(repertoires: Repertoire[]): RepertoireGroup[] {
  const groups = new Map<string, RepertoireGroup>();

  for (const repertoire of repertoires) {
    const category = repertoire.category;
    const key = category ? category.toLocaleLowerCase("fr") : "";
    let group = groups.get(key);
    if (!group) {
      group = { key, category, label: category ?? UNCATEGORIZED_LABEL, items: [] };
      groups.set(key, group);
    }
    group.items.push(repertoire);
  }

  return [...groups.values()].sort((a, b) => {
    if (a.category === null) return 1;
    if (b.category === null) return -1;
    return collator.compare(a.label, b.label);
  });
}

/** Catégories existantes (sans doublon de casse), pour proposer une saisie semi-automatique. */
export function listCategories(repertoires: Repertoire[]): string[] {
  return groupByCategory(repertoires)
    .filter((group) => group.category !== null)
    .map((group) => group.label);
}

export function formatMoveCount(count: number): string {
  return `${count} coup${count > 1 ? "s" : ""}`;
}
