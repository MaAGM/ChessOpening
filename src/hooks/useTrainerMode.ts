"use client";

import { useState } from "react";
import type { Side } from "@/lib/review/reviewRepertoire";

export type PanelMode =
  | "menu"
  | "explorer"
  | "opening_selector"
  | "learning_active"
  | "review_setup"
  | "review_active";

/**
 * État global de navigation de l'application : quel écran la sidebar affiche
 * et, en mode révision, avec quelle couleur le joueur s'entraîne.
 *
 * Ce hook ne contient aucune logique d'échecs : chaque mode (tutoriel, révision)
 * a son propre manager, qui lit ce mode mais ne le possède pas.
 */
export function useTrainerMode() {
  const [panelMode, setPanelMode] = useState<PanelMode>("menu");
  const [reviewSide, setReviewSide] = useState<Side | null>(null);

  return { panelMode, setPanelMode, reviewSide, setReviewSide };
}