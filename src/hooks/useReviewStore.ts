"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  addReviewChapter,
  getServerSnapshot,
  getSnapshot,
  markChapterComplete,
  recordPositionResult,
  removeReviewChapter,
  resetPositionStats,
  subscribe,
} from "@/lib/review/reviewStore";

export function useReviewStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const reviewChapterIds = useMemo(
    () => Object.keys(state.reviewChapters),
    [state.reviewChapters],
  );

  const isInReview = useCallback(
    (chapterId: string) => Object.prototype.hasOwnProperty.call(state.reviewChapters, chapterId),
    [state.reviewChapters],
  );

  return {
    completedChapters: state.completedChapters,
    reviewChapterIds,
    isInReview,
    /** Statistiques de répétition espacée, indexées par clé de position. */
    positionStats: state.positions,
    addToReview: addReviewChapter,
    removeFromReview: removeReviewChapter,
    markComplete: markChapterComplete,
    recordResult: recordPositionResult,
    resetStats: resetPositionStats,
  };
}