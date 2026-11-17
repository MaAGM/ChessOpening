import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./cx";

/**
 * - `tinted` : bouton teinté (émeraude / ambre) des panneaux.
 * - `primary` : bouton doré plein (« Chapitre suivant »).
 * - `secondary` : bouton ardoise avec survol doré (« Retour »).
 * - `link` : lien textuel souligné discret (« Recommencer la ligne », « Retirer »).
 */
export type ButtonVariant = "tinted" | "primary" | "secondary" | "link";
export type ButtonTone = "emerald" | "amber";

const TINTED_TONE_CLASSES: Record<ButtonTone, string> = {
  emerald:
    "border border-emerald-400/40 bg-emerald-500/20 font-semibold text-emerald-100 transition hover:border-emerald-300/80 hover:bg-emerald-500/30",
  amber:
    "border border-amber-400/40 bg-amber-500/20 font-semibold text-amber-100 transition hover:border-amber-300/80 hover:bg-amber-500/30",
};

const VARIANT_CLASSES: Record<Exclude<ButtonVariant, "tinted">, string> = {
  primary:
    "rounded-lg bg-[#D4AF37] px-4 py-3 font-bold text-slate-900 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition hover:bg-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]",
  secondary:
    "rounded-lg border border-slate-600 bg-slate-700/40 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-[#D4AF37]/60 hover:bg-slate-700/70 hover:text-[#D4AF37]",
  link: "text-xs text-slate-400 underline transition hover:text-slate-200",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  /** Couleur du variant `tinted` (ignorée pour les autres). */
  tone?: ButtonTone;
};

/**
 * Bouton de base. Les variants portent les couleurs et effets de survol ;
 * `className` ajoute la forme et la mise en page propres à l'usage
 * (largeur, marges, padding des boutons teintés…).
 */
export function Button({
  variant = "tinted",
  tone = "emerald",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "tinted" ? cx("rounded-lg", TINTED_TONE_CLASSES[tone]) : VARIANT_CLASSES[variant];
  return <button type={type} className={cx(variantClass, className)} {...rest} />;
}
