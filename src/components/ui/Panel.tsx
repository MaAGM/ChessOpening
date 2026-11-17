import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./cx";

/** Style de base des cartes de la sidebar (ReviewPanel, futur panneau Coach…). */
export const PANEL_BASE_CLASS = "rounded-xl border border-slate-600 bg-slate-800/70 p-4";

type PanelProps = ComponentPropsWithoutRef<"section">;

/**
 * Carte encadrée : `<section>` arrondie, bordure ardoise, fond semi-transparent.
 * `className` ajoute la mise en page propre à chaque usage (flex, ombre, texte…).
 */
export function Panel({ className, children, ...rest }: PanelProps) {
  return (
    <section className={cx(PANEL_BASE_CLASS, className)} {...rest}>
      {children}
    </section>
  );
}
