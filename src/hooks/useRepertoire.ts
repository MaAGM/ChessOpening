// Updated Repertoire Hook – binary chapter completion
"use client";

import { useCallback, useState } from "react";

// New storage key – bypasses old corrupted cache
const COMPLETED_CHAPTERS_KEY = "chess-opening:completed-chapters-v2";
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

// ---------- Completed Chapters ----------
export type CompletedChapters = string[];

export function getCompletedChapters(): CompletedChapters {
  if (!hasBrowserStorage()) return [];
  const parsed = parseJsonSafely<string[]>(window.localStorage.getItem(COMPLETED_CHAPTERS_KEY), []);
  if (!Array.isArray(parsed)) return [];
  // ensure all entries are strings and unique
  return Array.from(new Set(parsed.filter((item): item is string => typeof item === "string")));
}

export function setCompletedChapters(value: CompletedChapters): void {
  if (!hasBrowserStorage()) return;
  const unique = Array.from(new Set(value));
  window.localStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(unique));
}

/** Add a chapter ID to the completed list if not already present. */
export function markChapterComplete(chapterId: string): void {
  const current = getCompletedChapters();
  if (!current.includes(chapterId)) {
    setCompletedChapters([...current, chapterId]);
  }
}

// ---------- Saved Repertoire (unchanged) ----------
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
  const [completedChapters, setCompletedChaptersState] = useState<CompletedChapters>(() =>
    getCompletedChapters(),
  );
  const [savedRepertoire, setSavedRepertoireState] = useState<string[]>(() => getSavedRepertoire());

  // Update the completed chapters state and persist
  const addCompletedChapter = useCallback((chapterId: string) => {
    setCompletedChaptersState((prev) => {
      if (prev.includes(chapterId)) return prev;
      const next = [...prev, chapterId];
      setCompletedChapters(next);
      return next;
    });
  }, []);

  const replaceCompletedChapters = useCallback((value: CompletedChapters) => {
    const unique = Array.from(new Set(value));
    setCompletedChaptersState(unique);
    setCompletedChapters(unique);
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
    completedChapters,
    savedRepertoire,
    addCompletedChapter,
    replaceCompletedChapters,
    addSavedMove,
    replaceSavedRepertoire,
  };
}
