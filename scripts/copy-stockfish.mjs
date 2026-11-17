// Copie le moteur Stockfish WASM (build « lite single-thread ») dans public/engine/.
// Lancé automatiquement par `npm install` (postinstall). Le build single-thread ne
// demande aucun en-tête COOP/COEP : il fonctionne sur n'importe quel hébergeur statique.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "node_modules", "stockfish", "bin");
const targetDir = join(root, "public", "engine");
const FILES = [
  ["stockfish-19-lite-single.js", "stockfish.js"],
  ["stockfish-19-lite-single.wasm", "stockfish.wasm"],
];

if (!existsSync(sourceDir)) {
  console.warn("[copy-stockfish] paquet « stockfish » absent : copie ignorée.");
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
for (const [from, to] of FILES) {
  copyFileSync(join(sourceDir, from), join(targetDir, to));
}
console.log("[copy-stockfish] moteur copié dans public/engine/");
