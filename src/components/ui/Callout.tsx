import type { ReactNode } from "react";

import { cx } from "./cx";

export type CalloutTone = "success" | "warning" | "info" | "danger";

/** Couleurs de bordure / fond par ton (classes complètes pour Tailwind). */
const TONE_CLASSES: Record<CalloutTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-indigo-500/40 bg-indigo-500/10",
  danger: "border-rose-500/40 bg-rose-500/10",
};

type CalloutProps = {
  tone: CalloutTone;
  /** Balise rendue : `div` (bloc avec contenu riche) ou `p` (simple message). */
  as?: "div" | "p";
  /** Espacements, mise en page et couleur du texte propres à l'usage. */
  className?: string;
  children: ReactNode;
};

/**
 * Encadré de message (succès, avertissement, information, erreur) :
 * `rounded-lg border` + couleurs du ton. Le padding reste fourni par l'appelant
 * pour reproduire exactement les variantes existantes (`p-3`, `px-4 py-2`…).
 */
export function Callout({ tone, as: Tag = "div", className, children }: CalloutProps) {
  return <Tag className={cx("rounded-lg border", TONE_CLASSES[tone], className)}>{children}</Tag>;
}
