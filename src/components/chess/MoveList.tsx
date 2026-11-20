type MoveListProps = {
  sanHistory: string[];
  // historyIndex is a ply count (0 = start position). Used to highlight
  // the move that led to the currently displayed position.
  historyIndex: number;
  onSelectMove: (plyIndex: number) => void;
};

type MovePair = {
  moveNumber: number;
  white: string | null;
  black: string | null;
  // Ply index (into sanHistory / history) for each half-move, so a click
  // can call onSelectMove(plyIndex + 1) to jump straight to that position.
  whitePly: number | null;
  blackPly: number | null;
};

function pairMoves(sanHistory: string[]): MovePair[] {
  const pairs: MovePair[] = [];

  for (let i = 0; i < sanHistory.length; i += 2) {
    pairs.push({
      moveNumber: i / 2 + 1,
      white: sanHistory[i] ?? null,
      black: sanHistory[i + 1] ?? null,
      whitePly: i,
      blackPly: sanHistory[i + 1] !== undefined ? i + 1 : null,
    });
  }

  return pairs;
}

const NAV_BUTTON =
  "rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1 text-sm text-slate-300 transition hover:border-[#D4AF37]/60 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40";

/** Coups joués, en ligne (cliquables), avec les boutons ⏮ ◀ ▶ ⏭. */
export function MoveList({ sanHistory, historyIndex, onSelectMove }: MoveListProps) {
  const pairs = pairMoves(sanHistory);
  // historyIndex is a position index (0 = start); the ply that produced it
  // is historyIndex - 1. Nothing is "active" at the starting position.
  const activePly = historyIndex > 0 ? historyIndex - 1 : null;
  const last = sanHistory.length;

  const moveButton = (san: string, ply: number) => (
    <button
      type="button"
      onClick={() => onSelectMove(ply + 1)}
      aria-current={activePly === ply ? "step" : undefined}
      className={`rounded px-1 py-0.5 hover:bg-slate-700/60 ${
        activePly === ply ? "bg-[#D4AF37]/20 font-semibold text-[#D4AF37]" : "text-slate-200"
      }`}
    >
      {san}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-20 min-h-6 overflow-y-auto text-sm leading-6">
        {pairs.length === 0 ? (
          <span className="text-slate-500">Aucun coup joué : déplace une pièce pour commencer.</span>
        ) : (
          pairs.map((pair) => (
            <span key={pair.moveNumber} className="mr-1.5 inline-flex items-baseline gap-0.5 whitespace-nowrap">
              <span className="text-slate-500">{pair.moveNumber}.</span>
              {pair.white !== null && pair.whitePly !== null && moveButton(pair.white, pair.whitePly)}
              {pair.black !== null && pair.blackPly !== null && moveButton(pair.black, pair.blackPly)}
            </span>
          ))
        )}
      </div>
      <div className="flex gap-1.5" role="group" aria-label="Navigation dans les coups">
        <button type="button" className={NAV_BUTTON} disabled={historyIndex === 0} onClick={() => onSelectMove(0)} aria-label="Début">
          ⏮
        </button>
        <button
          type="button"
          className={NAV_BUTTON}
          disabled={historyIndex === 0}
          onClick={() => onSelectMove(historyIndex - 1)}
          aria-label="Coup précédent"
        >
          ◀
        </button>
        <button
          type="button"
          className={NAV_BUTTON}
          disabled={historyIndex >= last}
          onClick={() => onSelectMove(historyIndex + 1)}
          aria-label="Coup suivant"
        >
          ▶
        </button>
        <button
          type="button"
          className={NAV_BUTTON}
          disabled={historyIndex >= last}
          onClick={() => onSelectMove(last)}
          aria-label="Dernier coup"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
