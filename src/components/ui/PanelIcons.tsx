/** Icônes SVG minimales des onglets de panneau (Exploration, Apprentissage). */

const ICON_CLASS = "h-4 w-4";

/** Coach IA. */
export function SparkleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden="true">
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}

/** Contenu du cours. */
export function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={ICON_CLASS} aria-hidden="true">
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
      <path d="M4 19a2 2 0 0 1 2-2h13" />
    </svg>
  );
}

/** Classes d'un bouton-icône d'onglet. */
export function tabButtonClass(selected: boolean): string {
  return `flex h-8 w-8 items-center justify-center rounded-md transition ${
    selected ? "bg-slate-700 text-[#D4AF37]" : "text-slate-400 hover:text-slate-200"
  }`;
}
