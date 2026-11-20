import type { ReactNode } from "react";

type TrainerLayoutProps = {
  /** Au-dessus de l'échiquier (nom de l'ouverture). */
  boardHeader?: ReactNode;
  /** L'échiquier lui-même (rendu dans le cadre doré). */
  board: ReactNode;
  /**
   * Emplacement à gauche de l'échiquier (barre d'évaluation).
   * Non fourni : l'échiquier est rendu seul dans son cadre.
   */
  boardAside?: ReactNode;
  /** Panneau principal (TrainerSidebar). */
  panel: ReactNode;
};

/**
 * Mise en page des écrans d'entraînement (menu, apprentissage, révision, répertoire) :
 *
 *   [boardHeader]
 *   [boardAside] [board]      [panel]
 *
 * Le mode Exploration a sa propre mise en page (ExplorerWorkspace).
 */
export function TrainerLayout({ boardHeader, board, boardAside, panel }: TrainerLayoutProps) {
  const boardFrame = (
    <section className="w-full max-w-137.5 border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-2 shadow-2xl shadow-black/40">
      {board}
    </section>
  );

  return (
    <main className="flex min-h-screen items-center justify-start gap-6 bg-slate-900 px-4 py-10 pl-16 text-slate-100">
      {/* Zone échiquier */}
      <div className="flex flex-col gap-4">
        {boardHeader}
        {boardAside ? (
          <div className="flex items-stretch gap-2" data-slot="board-row">
            <div data-slot="board-aside">{boardAside}</div>
            {boardFrame}
          </div>
        ) : (
          boardFrame
        )}
      </div>

      {/* Zone panneau principal */}
      {panel}
    </main>
  );
}
