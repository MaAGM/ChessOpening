import type { Repertoire } from "@/lib/repertoire/types";
import { repertoireSourceId, type ReviewSource } from "@/lib/review/reviewRepertoire";
import type { AnnotatedSource } from "./bookMoves";

/**
 * Sources annotées du coach à partir des sources de la révision.
 *
 * Un répertoire de l'utilisateur est repris tel quel (arbre `RepertoireNode`, symboles
 * compris) plutôt que sa conversion en `TutorialNode`, qui perd les « ! » et « ? ».
 * `ids` restreint aux sources qui passent par la position (les `chapterIds` d'un nœud).
 */
export function toAnnotatedSources(
  sources: readonly ReviewSource[],
  repertoires: readonly Repertoire[],
  ids?: readonly string[],
): AnnotatedSource[] {
  const wanted = ids ? new Set(ids) : null;
  const repertoireBySourceId = new Map(repertoires.map((r) => [repertoireSourceId(r.id), r]));

  return sources
    .filter((source) => !wanted || wanted.has(source.id))
    .map((source): AnnotatedSource => {
      const repertoire = repertoireBySourceId.get(source.id);
      return repertoire
        ? { kind: "repertoire", id: source.id, name: source.name, root: repertoire }
        : { kind: "tutorial", id: source.id, name: source.name, root: source.root };
    });
}
