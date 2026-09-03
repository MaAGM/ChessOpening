import type { CSSProperties } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceHandlerArgs } from "react-chessboard";

type PieceImageProps = {
  fill?: string;
  square?: string;
  svgStyle?: CSSProperties;
};

const renderCustomPiece =
  (piece: string) =>
  function PieceRenderer({ svgStyle }: PieceImageProps = {}) {
    return (
      <img
        src={`/pieces/${piece}.svg`}
        alt={`${piece} chess piece`}
        className="pointer-events-none h-full w-full select-none"
        style={svgStyle}
        draggable={false}
      />
    );
  };

const customPieces = {
  wP: renderCustomPiece("wP"),
  wN: renderCustomPiece("wN"),
  wB: renderCustomPiece("wB"),
  wR: renderCustomPiece("wR"),
  wQ: renderCustomPiece("wQ"),
  wK: renderCustomPiece("wK"),
  bP: renderCustomPiece("bP"),
  bN: renderCustomPiece("bN"),
  bB: renderCustomPiece("bB"),
  bR: renderCustomPiece("bR"),
  bQ: renderCustomPiece("bQ"),
  bK: renderCustomPiece("bK"),
};

type ChessBoardProps = {
  position: string;
  currentGame: Chess;
  squareStyles: Record<string, CSSProperties>;
  customArrows?: [string, string][];
  onPieceDrop: (sourceSquare: string, targetSquare: string | null) => boolean;
  onPieceDragBegin: (args: PieceHandlerArgs) => void;
  onPieceDragEnd: () => void;
  onSquareClick: (square: string) => void;
  onSquareRightClick: (square: string) => void;
};

export function ChessBoard({
  position,
  currentGame,
  squareStyles,
  customArrows,
  onPieceDrop,
  onPieceDragBegin,
  onPieceDragEnd,
  onSquareClick,
  onSquareRightClick,
}: ChessBoardProps) {
  return (
    <div className="select-none bg-[#769656]">
      <Chessboard
        options={{
          id: "chess-opening-board",
          position,
          boardStyle: { width: "100%", height: "auto" },
          pieces: customPieces,
          darkSquareStyle: { backgroundColor: "#769656" },
          lightSquareStyle: { backgroundColor: "#b4c89d" },
          draggingPieceGhostStyle: { opacity: 0 },
          canDragPiece: ({ piece }) => piece.pieceType[0] === currentGame.turn(),
          onPieceDrag: onPieceDragBegin,
          onPieceDragCancel: onPieceDragEnd,
          onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
          onSquareClick: ({ square }) => onSquareClick(square),
          onSquareRightClick: ({ square }) => onSquareRightClick(square),
          squareStyles,
          arrows: customArrows ?? [],
        }}
      />
    </div>
  );
}