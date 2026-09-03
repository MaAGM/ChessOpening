"use client";

import { useCallback, useState } from "react";

export type LearningProgress = Record<string, number>;

const LEARNING_PROGRESS_KEY = "chess-opening:learning-progress";
const SAVED_REPERTOIRE_KEY = "chess-opening:saved-repertoire";

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseJsonSafely<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getLearningProgress(): LearningProgress {
  if (!hasBrowserStorage()) return {};
  const parsed = parseJsonSafely<unknown>(window.localStorage.getItem(LEARNING_PROGRESS_KEY), {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

  const progress: LearningProgress = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      progress[key] = value;
    }
  }
  return progress;
}

export function setLearningProgress(value: LearningProgress): void {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(value));
}

export function getSavedRepertoire(): string[] {
  if (!hasBrowserStorage()) return [];
  const parsed = parseJsonSafely<unknown[]>(window.localStorage.getItem(SAVED_REPERTOIRE_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === "string");
}

export function setSavedRepertoire(value: string[]): void {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(SAVED_REPERTOIRE_KEY, JSON.stringify(value));
}

export function useRepertoire() {
  const [learningProgress, setLearningProgressState] = useState<LearningProgress>(() =>
    getLearningProgress(),
  );
  const [savedRepertoire, setSavedRepertoireState] = useState<string[]>(() => getSavedRepertoire());

  const updateLearningProgress = useCallback((openingId: string, stepIndex: number) => {
    setLearningProgressState((previous) => {
      const next = { ...previous, [openingId]: stepIndex };
      setLearningProgress(next);
      return next;
    });
  }, []);

  const replaceLearningProgress = useCallback((value: LearningProgress) => {
    setLearningProgressState(value);
    setLearningProgress(value);
  }, []);

  const addSavedMove = useCallback((move: string) => {
    setSavedRepertoireState((previous) => {
      if (previous.includes(move)) return previous;
      const next = [...previous, move];
      setSavedRepertoire(next);
      return next;
    });
  }, []);

  const replaceSavedRepertoire = useCallback((value: string[]) => {
    const normalized = Array.from(new Set(value));
    setSavedRepertoireState(normalized);
    setSavedRepertoire(normalized);
  }, []);

  return {
    learningProgress,
    savedRepertoire,
    updateLearningProgress,
    replaceLearningProgress,
    addSavedMove,
    replaceSavedRepertoire,
  };
}
