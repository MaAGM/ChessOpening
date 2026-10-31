"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  addRepertoire,
  createRepertoire,
  deleteRepertoire,
  duplicateRepertoire,
  getPersistError,
  getServerPersistError,
  getServerSnapshot,
  getSnapshot,
  reorderRepertoires,
  subscribe,
  subscribePersistError,
  updateRepertoireMeta,
  updateRepertoireTree,
} from "@/lib/repertoire/repertoireStore";

/** Répertoires de l'utilisateur (dans l'ordre d'affichage) et actions de gestion. */
export function useRepertoireStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const persistError = useSyncExternalStore(
    subscribePersistError,
    getPersistError,
    getServerPersistError,
  );

  const repertoires = useMemo(
    () => state.order.map((id) => state.repertoires[id]).filter(Boolean),
    [state],
  );

  const getRepertoire = useCallback((id: string) => state.repertoires[id] ?? null, [state]);

  return {
    repertoires,
    getRepertoire,
    /** Message à afficher quand la dernière sauvegarde a échoué (stockage plein, etc.). */
    persistError,
    createRepertoire,
    addRepertoire,
    updateRepertoireMeta,
    updateRepertoireTree,
    deleteRepertoire,
    duplicateRepertoire,
    reorderRepertoires,
  };
}
