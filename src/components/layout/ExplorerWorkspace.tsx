"use client";

import { useState, type ReactNode } from "react";

type ExplorerWorkspaceProps = {
  /** Bouton retour (à gauche de l'en-tête). */
  back: ReactNode;
  /** Nom de l'ouverture (et code ECO). */
  title: ReactNode;
  board: ReactNode;
  /** Barre d'évaluation, à gauche de l'échiquier. */
  evalBar?: ReactNode;
  /** Coups joués et navigation, dans le panneau de droite sous Stockfish. */
  moves: ReactNode;
  /** Bandeau Stockfish, épinglé en haut du panneau de droite. */
  engine: ReactNode;
  /** Base des maîtres. */
  explorer: ReactNode;
  /** Chat du Coach. */
  coach: ReactNode;
  /** Retourne l'échiquier (bouton masqué si absent). */
  onFlipBoard?: () => void;
};

export type PanelView = "explorer" | "coach";

const ICON_CLASS = "h-4 w-4";

/** Icônes SVG minimales (provisoires, en attendant la refonte de l'interface). */
function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={ICON_CLASS} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden="true">
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={ICON_CLASS} aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.6" />
      <path d="M20 3v5.6h-5.6" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.4" />
      <path d="M4 21v-5.6h5.6" />
    </svg>
  );
}

const VIEWS: { value: PanelView; label: string; icon: ReactNode }[] = [
  { value: "explorer", label: "Explorateur", icon: <SearchIcon /> },
  { value: "coach", label: "Coach", icon: <SparkleIcon /> },
];

const ICON_BUTTON = "flex h-8 w-8 items-center justify-center rounded-md transition";

/**
 * Mise en page du mode Exploration.
 *
 *  ≥ 1024 px : la page occupe 100dvh, sans défilement global dès que la fenêtre fait au moins
 *              40rem de haut (sinon la page défile plutôt que de rogner l'échiquier).
 *              [échiquier] [Stockfish + icônes Explorateur/Coach/retourner / coups joués / vue]
 *              L'échiquier a la même taille que sur l'écran d'accueil (cadre de 550 px,
 *              cf. TrainerLayout). L'ensemble est centré et limité en largeur (78rem) pour
 *              laisser respirer le panneau de droite, qui n'affiche qu'une vue à la fois.
 *              Le choix de la vue tient dans la barre Stockfish pour laisser un maximum de
 *              hauteur à la base des maîtres et au fil du chat, seuls à défiler.
 *  < 1024 px : tout empilé, la page défile.
 *
 * L'Explorateur et le Coach restent montés quelle que soit la vue : la discussion et le
 * défilement survivent au changement.
 */
export function ExplorerWorkspace({ back, title, board, evalBar, moves, engine, explorer, coach, onFlipBoard }: ExplorerWorkspaceProps) {
  const [view, setView] = useState<PanelView>("explorer");

  return (
    <main className="min-h-dvh bg-slate-900 px-4 py-4 text-slate-100 lg:h-dvh lg:min-h-160 lg:px-6">
      <div className="mx-auto flex h-full max-w-[78rem] flex-col gap-3">
        <header className="flex h-11 shrink-0 items-center gap-4">
          {back}
          <div className="min-w-0 flex-1">{title}</div>
        </header>

        {/* Sur desktop, la hauteur de la rangée est celle de l'échiquier : le panneau de droite,
            positionné en absolu dans sa colonne, s'y cale sans pouvoir l'agrandir. */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Échiquier : la colonne prend la largeur de l'échiquier. */}
          <div className="flex w-full shrink-0 items-stretch gap-2 lg:w-fit">
            {evalBar ? <div data-slot="board-aside">{evalBar}</div> : null}
            <section
              data-slot="board"
              className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40 lg:w-137.5"
            >
              {board}
            </section>
          </div>

          {/* Panneau de droite */}
          <div className="min-w-0 flex-1 lg:relative">
          <div
            data-slot="side-panel"
            className="flex h-[40rem] min-h-0 flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4 lg:absolute lg:inset-0 lg:h-auto"
          >
            <div data-slot="toolbar" className="flex shrink-0 items-start gap-2">
              <div className="min-w-0 flex-1">{engine}</div>

              <div
                role="tablist"
                aria-label="Affichage du panneau"
                className="flex shrink-0 gap-0.5 rounded-lg border border-slate-700 bg-slate-900/50 p-0.5"
              >
                {VIEWS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-label={label}
                    title={label}
                    aria-selected={view === value}
                    onClick={() => setView(value)}
                    className={`${ICON_BUTTON} ${
                      view === value ? "bg-slate-700 text-[#D4AF37]" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {onFlipBoard ? (
                <button
                  type="button"
                  aria-label="Retourner l'échiquier"
                  title="Retourner l'échiquier"
                  onClick={onFlipBoard}
                  className={`${ICON_BUTTON} mt-0.5 shrink-0 border border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200`}
                >
                  <FlipIcon />
                </button>
              ) : null}
            </div>

            <div data-slot="moves" className="shrink-0 border-t border-slate-700 pt-3">
              {moves}
            </div>

            <div data-slot="explorer" className={`min-h-0 flex-1 flex-col ${view === "explorer" ? "flex" : "hidden"}`}>
              {explorer}
            </div>
            <div data-slot="coach" className={`min-h-0 flex-1 flex-col ${view === "coach" ? "flex" : "hidden"}`}>
              {coach}
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
