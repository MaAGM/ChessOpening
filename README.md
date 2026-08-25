# ChessOpening

Minimal Next.js (App Router) starter for an interactive chessboard.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- [`chess.js`](https://www.npmjs.com/package/chess.js) for move validation/state
- [`react-chessboard`](https://www.npmjs.com/package/react-chessboard) for UI

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use drag-and-drop on the board.
Legal moves are applied and logged to the browser console as SAN + FEN.
