"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  addReviewChapter,
  getServerSnapshot,
  getSnapshot,
  markChapterComplete,
  removeReviewChapter,
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
    addToReview: addReviewChapter,
    removeFromReview: removeReviewChapter,
    markComplete: markChapterComplete,
  };
}