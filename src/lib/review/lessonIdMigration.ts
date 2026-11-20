import { resolveLessonId } from "@/lib/data/openings/catalog";
import type { ReviewChapterEntry, ReviewStoreState } from "./reviewStore";

/**
 * Traduit les anciens identifiants de cours (`french-m1`) vers les nouveaux (`french-c1-l1`)
 * dans les cours terminés et les cours ajoutés aux révisions.
 *
 * - Deux entrées qui désignent le même cours sont fusionnées (date d'ajout la plus ancienne).
 * - Les identifiants inconnus sont conservés tels quels (ils sont ignorés ailleurs).
 * - Renvoie l'état d'entrée lui-même quand rien ne change.
 *
 * Appliquée à la lecture du localStorage ET à la fusion avec le cloud : le moteur de
 * synchronisation compare alors le cloud (anciens identifiants) à l'état migré et envoie
 * la suppression des anciennes lignes `chapterId` et la création des nouvelles. Le schéma
 * Convex ne change pas.
 */
export function migrateLessonIds(
  state: ReviewStoreState,
  resolve: (id: string) => string = resolveLessonId,
): ReviewStoreState {
  const reviewIds = Object.keys(state.reviewChapters);
  const changed =
    reviewIds.some((id) => resolve(id) !== id) || state.completedChapters.some((id) => resolve(id) !== id);
  if (!changed) return state;

  const reviewChapters: Record<string, ReviewChapterEntry> = {};
  for (const id of reviewIds) {
    const target = resolve(id);
    const entry = state.reviewChapters[id];
    const existing = reviewChapters[target];
    reviewChapters[target] = existing ? { addedAt: Math.min(existing.addedAt, entry.addedAt) } : { ...entry };
  }

  const completedChapters = Array.from(new Set(state.completedChapters.map(resolve)));

  return { ...state, reviewChapters, completedChapters };
}
