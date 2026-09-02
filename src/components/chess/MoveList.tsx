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

export function MoveList({ sanHistory, historyIndex, onSelectMove }: MoveListProps) {
  const pairs = pairMoves(sanHistory);
  // historyIndex is a position index (0 = start); the ply that produced it
  // is historyIndex - 1. Nothing is "active" at the starting position.
  const activePly = historyIndex > 0 ? historyIndex - 1 : null;

  if (sanHistory.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        No moves played yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {pairs.map((pair) => (
        <div key={pair.moveNumber} className="flex items-center gap-2 text-sm">
          <span className="w-6 shrink-0 text-slate-500">{pair.moveNumber}.</span>
          <button
            type="button"
            onClick={() => pair.whitePly !== null && onSelectMove(pair.whitePly + 1)}
            className={`rounded px-2 py-0.5 text-left hover:bg-slate-700/60 ${
              activePly === pair.whitePly ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "text-slate-100"
            }`}
          >
            {pair.white}
          </button>
          {pair.black && (
            <button
              type="button"
              onClick={() => pair.blackPly !== null && onSelectMove(pair.blackPly + 1)}
              className={`rounded px-2 py-0.5 text-left hover:bg-slate-700/60 ${
                activePly === pair.blackPly ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "text-slate-100"
              }`}
            >
              {pair.black}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}