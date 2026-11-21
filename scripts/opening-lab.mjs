#!/usr/bin/env node
// Atelier d'auteur des Masterclass (outil de développement : jamais chargé par l'application).
//
//   npm run courses:lab -- extract french [--root "e4 e6 d4 d5 Nc3 Bb4"] [--depth 24]
//       Parcourt la base des maîtres Lichess à partir d'une position et écrit un squelette PGN
//       des variantes populaires (scripts/out/<cours>.lines.pgn) : un seul coup pour le camp
//       du cours (le plus joué), les réponses adverses fréquentes en sous-variantes. Chaque
//       position nommée par eco.json reçoit son code ECO et son nom.
//
//   npm run courses:lab -- audit french [--engine] [--depth 14]
//       Vérifie un cours déjà rédigé : arbres construits par le code de l'appli (buildLessonTree),
//       structure pédagogique (5 chapitres, profondeur, commentaires, branches côté joueur,
//       phrases répétées), fréquence de chaque coup chez les maîtres, et avec --engine les coups
//       du joueur que Stockfish juge nettement inférieurs.
//
//   npm run courses:lab -- traps french [--root "…"] [--swing 150] [--min-games 30]
//       Parcourt le tronc des parties de maîtres et signale les coups adverses (même rares)
//       que Stockfish réfute d'au moins --swing centipions, avec la réfutation : matière
//       première du chapitre « Pièges ».
//
//   npm run courses:lab -- query french --moves "e4 e6 d4 d5|e4 e6 d4 d5 e5"
//   npm run courses:lab -- eval french --moves "…|…" [--depth 16]
//       Statistiques des maîtres, ou évaluation Stockfish et meilleure suite, après chaque
//       suite de coups (aide à la rédaction).
//
// Les réponses Lichess sont mises en cache dans scripts/.cache/ (ignoré par git).
// Variable facultative : LICHESS_TOKEN (si l'API du explorer exige un jeton).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Chess } from "chess.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COURSES_DIR = join(ROOT, "src", "lib", "data", "openings", "courses");
const CACHE_DIR = join(ROOT, "scripts", ".cache");
const OUT_DIR = join(ROOT, "scripts", "out");
const USER_AGENT = "opening-course-builder/1.0";

/** Point de départ par défaut de l'extraction, par cours. */
const PRESETS = {
  french: { side: "black", root: "e4 e6" },
  italian: { side: "white", root: "e4 e5 Nf3 Nc6 Bc4" },
  london_system: { side: "white", root: "d4 d5 Bf4" },
  reti: { side: "white", root: "Nf3 d5 g3" },
  trompowsky: { side: "white", root: "d4 Nf6 Bg5" },
  scandinavian: { side: "black", root: "e4 d5 exd5 Qxd5" },
  alekhine: { side: "black", root: "e4 Nf6 e5 Nd5" },
};

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const [command, courseId, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith("--")) options[key] = true;
    else {
      options[key] = next;
      i++;
    }
  }
  return { command, courseId, options };
}

const num = (value, fallback) => (value === undefined || value === true ? fallback : Number(value));

// ---------------------------------------------------------------------------
// Cache disque
// ---------------------------------------------------------------------------
function openCache(name) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const file = join(CACHE_DIR, `${name}.json`);
  const data = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  let dirty = 0;
  return {
    get: (key) => data[key],
    set(key, value) {
      data[key] = value;
      if (++dirty % 20 === 0) this.save();
    },
    save: () => writeFileSync(file, JSON.stringify(data)),
  };
}

// ---------------------------------------------------------------------------
// Base des maîtres Lichess
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mastersCache = openCache("masters");

/** Clé de position sans compteurs de coups (les transpositions partagent le cache). */
const positionKey = (fen) => fen.split(" ").slice(0, 4).join(" ");

async function masters(fen) {
  const key = positionKey(fen);
  const cached = mastersCache.get(key);
  if (cached) return cached;

  const url = `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&moves=12&topGames=0`;
  const headers = { "User-Agent": USER_AGENT };
  if (process.env.LICHESS_TOKEN) headers.Authorization = `Bearer ${process.env.LICHESS_TOKEN}`;

  for (let attempt = 0; attempt < 4; attempt++) {
    await sleep(600); // une requête à la fois, sans marteler l'API
    let response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
    } catch (error) {
      console.warn(`  (réseau : ${error.cause?.code ?? error.name}, nouvel essai)`);
      await sleep(3_000);
      continue;
    }
    if (response.status === 429) {
      console.warn("  (limite Lichess atteinte : pause d'une minute)");
      await sleep(61_000);
      continue;
    }
    if (!response.ok) throw new Error(`Lichess masters : HTTP ${response.status}`);
    const json = await response.json();
    const result = {
      total: json.white + json.draws + json.black,
      moves: json.moves.map((m) => ({
        san: m.san,
        games: m.white + m.draws + m.black,
        white: m.white,
        draws: m.draws,
        black: m.black,
      })),
    };
    mastersCache.set(key, result);
    return result;
  }
  throw new Error("Lichess masters : trop de refus (429).");
}

// ---------------------------------------------------------------------------
// eco.json (chargé à la demande depuis GitHub par le paquet, mis en cache ici)
// ---------------------------------------------------------------------------
let ecoBook = null;
async function ecoLookup() {
  if (!ecoBook) {
    const { openingBook, getPositionBook, findOpening } = await import("@chess-openings/eco.json");
    const book = await openingBook();
    const positions = getPositionBook(book);
    ecoBook = (fen) => findOpening(book, fen, positions);
  }
  return ecoBook;
}

// ---------------------------------------------------------------------------
// extract
// ---------------------------------------------------------------------------
const pct = (part, total) => (total > 0 ? Math.round((100 * part) / total) : 0);

/** Score du point de vue du camp du cours. */
const scoreFor = (side, stats) => {
  const total = stats.white + stats.draws + stats.black;
  const wins = side === "white" ? stats.white : stats.black;
  return pct(wins + stats.draws / 2, total);
};

async function extract(courseId, options) {
  const preset = PRESETS[courseId] ?? {};
  const side = options.side ?? preset.side;
  if (side !== "white" && side !== "black") throw new Error("Préciser --side white|black.");

  const rootSans = String(options.root ?? preset.root ?? "").split(/\s+/).filter(Boolean);
  const maxDepth = num(options.depth, 24); // demi-coups depuis la position initiale
  const minGames = num(options["min-games"], 150);
  const minShare = num(options["min-share"], 12) / 100;
  const maxBranches = num(options.branches, 3);
  const budget = { requests: num(options.budget, 400) };
  const name = await ecoLookup();

  const chess = new Chess();
  for (const san of rootSans) chess.move(san);

  const userToMove = () => (chess.turn() === "w" ? "white" : "black") === side;
  const lines = [];
  let fetched = 0;

  async function walk(ply) {
    if (ply >= maxDepth || budget.requests <= 0) return null;
    budget.requests--;
    fetched++;
    const stats = await masters(chess.fen());
    if (stats.total < minGames) return null;

    const candidates = userToMove()
      ? stats.moves.slice(0, 1)
      : stats.moves.filter((m) => m.games >= minGames && m.games / stats.total >= minShare).slice(0, maxBranches);

    const children = [];
    for (const move of candidates) {
      chess.move(move.san);
      const opening = name(chess.fen());
      const node = {
        san: move.san,
        games: move.games,
        share: pct(move.games, stats.total),
        score: scoreFor(side, move),
        opening: opening ? `${opening.eco} ${opening.name}` : undefined,
        children: (await walk(ply + 1)) ?? [],
      };
      chess.undo();
      children.push(node);
    }
    return children;
  }

  console.log(`Extraction ${courseId} (${side}) depuis « ${rootSans.join(" ") || "position initiale"} »…`);
  const children = (await walk(rootSans.length)) ?? [];
  mastersCache.save();

  // Écriture PGN : commentaires = statistiques, pour servir de trame à la rédaction.
  // Chaque coup est suivi d'un commentaire : on numérote donc aussi les coups noirs (« 3... »).
  const number = (ply) => (ply % 2 === 0 ? `${ply / 2 + 1}. ` : `${(ply + 1) / 2}... `);
  const describe = (n) =>
    `{${n.games} parties, ${n.share} %, score ${n.score} %${n.opening ? ` · ${n.opening}` : ""}}`;
  const moveText = (nodes, ply) => {
    if (nodes.length === 0) return "";
    const [main, ...alternatives] = nodes;
    let text = `${number(ply)}${main.san} ${describe(main)}`;
    for (const alt of alternatives) {
      const sub = moveText(alt.children, ply + 1);
      text += ` (${number(ply)}${alt.san} ${describe(alt)}${sub ? ` ${sub}` : ""})`;
    }
    const continuation = moveText(main.children, ply + 1);
    return continuation ? `${text} ${continuation}` : text;
  };

  const rootPgn = rootSans.map((san, ply) => (ply % 2 === 0 ? `${ply / 2 + 1}. ${san}` : san)).join(" ");

  collect(children, [], lines);
  mkdirSync(OUT_DIR, { recursive: true });
  const slug = options.name ? `-${options.name}` : "";
  const file = join(OUT_DIR, `${courseId}${slug}.lines.pgn`);
  const body = `${rootPgn} ${moveText(children, rootSans.length)}`.trim();
  writeFileSync(file, `[Event "${courseId} : variantes des maîtres"]\n[Side "${side}"]\n\n${body} *\n`);

  console.log(`${fetched} positions consultées, ${lines.length} lignes. Squelette : ${file}`);
  for (const line of lines.slice(0, num(options.show, 25))) {
    console.log(`  ${String(line.games).padStart(6)} parties · ${line.plies} demi-coups · ${line.moves}`);
  }

  function collect(nodes, prefix, out) {
    for (const node of nodes) {
      const path = [...prefix, node];
      if (node.children.length === 0) {
        out.push({
          moves: [...rootSans, ...path.map((n) => n.san)].join(" "),
          plies: rootSans.length + path.length,
          games: node.games,
        });
      } else collect(node.children, path, out);
    }
  }
}

// ---------------------------------------------------------------------------
// Stockfish (UCI) pour l'audit
// ---------------------------------------------------------------------------
function startEngine() {
  const binary = join(ROOT, "node_modules", "stockfish", "bin", "stockfish-19-single.js");
  if (!existsSync(binary)) throw new Error("Paquet « stockfish » introuvable (npm install).");
  const proc = spawn(process.execPath, [binary], { stdio: ["pipe", "pipe", "ignore"] });
  let buffer = "";
  let waiter = null;
  proc.stdout.on("data", (chunk) => {
    buffer += chunk;
    let index;
    while ((index = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      waiter?.(line);
    }
  });
  const send = (command) => proc.stdin.write(`${command}\n`);
  const until = (predicate) =>
    new Promise((resolve) => {
      const seen = [];
      waiter = (line) => {
        seen.push(line);
        if (predicate(line)) {
          waiter = null;
          resolve(seen);
        }
      };
    });

  const evalCache = openCache("stockfish");
  return {
    async ready() {
      send("uci");
      await until((l) => l === "uciok");
      send("setoption name Hash value 64");
      send("isready");
      await until((l) => l === "readyok");
    },
    /** Évaluation en centipions du point de vue des Blancs. */
    async evaluate(fen, depth) {
      const key = `${positionKey(fen)}|${depth}`;
      const cached = evalCache.get(key);
      if (cached !== undefined) return cached;
      send(`position fen ${fen}`);
      send(`go depth ${depth}`);
      const lines = await until((l) => l.startsWith("bestmove"));
      const info = lines.filter((l) => l.includes(" score ")).at(-1) ?? "";
      const cp = /score cp (-?\d+)/.exec(info);
      const mate = /score mate (-?\d+)/.exec(info);
      let score = cp ? Number(cp[1]) : mate ? Math.sign(Number(mate[1])) * 10_000 : 0;
      if (fen.split(" ")[1] === "b") score = -score;
      evalCache.set(key, score);
      return score;
    },
    /** Meilleure suite selon le moteur, en SAN (au plus `length` demi-coups). */
    async principalVariation(fen, depth, length) {
      send(`position fen ${fen}`);
      send(`go depth ${depth}`);
      const lines = await until((l) => l.startsWith("bestmove"));
      const info = lines.filter((l) => l.includes(" pv ")).at(-1) ?? "";
      const uci = (info.split(" pv ")[1] ?? "").split(" ").slice(0, length);
      const game = new Chess(fen);
      const sans = [];
      for (const move of uci) {
        try {
          sans.push(game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] }).san);
        } catch {
          break;
        }
      }
      return sans;
    },
    stop() {
      evalCache.save();
      send("quit");
    },
  };
}

// ---------------------------------------------------------------------------
// audit
// ---------------------------------------------------------------------------
async function audit(courseId, options) {
  const file = join(COURSES_DIR, `${courseId}.json`);
  const course = JSON.parse(readFileSync(file, "utf8"));
  const { buildLessonTree } = await import("../src/lib/data/openings/lessonTree.ts");
  const engine = options.engine ? startEngine() : null;
  const depth = num(options.depth, 14);
  const threshold = num(options.threshold, 90);
  if (engine) await engine.ready();

  const problems = [];
  const warn = (lesson, message) => problems.push(`${lesson}: ${message}`);
  const sentences = new Map();

  console.log(`Audit de « ${course.name} » (${course.side === "white" ? "Blancs" : "Noirs"})`);
  if (course.chapters.length !== 5) warn(course.id, `${course.chapters.length} chapitres (5 attendus)`);

  for (const chapter of course.chapters) {
    console.log(`\n${chapter.id} · ${chapter.stage} · ${chapter.title}`);
    if (chapter.lessons.length !== 4) warn(chapter.id, `${chapter.lessons.length} cours (4 attendus)`);

    for (const lesson of chapter.lessons) {
      const root = buildLessonTree(lesson.pgn, course.side, lesson.conclusion);
      const comments = [...lesson.pgn.matchAll(/\{([^}]*)\}/g)].map((m) =>
        m[1].replace(/\[%[^\]]*\]/g, "").trim(),
      );
      const textual = comments.filter(Boolean);
      for (const text of textual) {
        for (const sentence of text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 40)) {
          sentences.set(sentence, [...(sentences.get(sentence) ?? []), lesson.id]);
        }
      }
      const arrows = (lesson.pgn.match(/%cal/g) ?? []).length;

      // Parcours de l'arbre
      let leaves = 0;
      let maxPlies = 0;
      let rareMoves = 0;
      const chess = new Chess();
      const userColor = course.side === "white" ? "w" : "b";

      const visit = async (node, ply) => {
        const moves = Object.keys(node.children ?? {});
        if (moves.length === 0) {
          leaves++;
          maxPlies = Math.max(maxPlies, ply);
          return;
        }
        const userTurn = chess.turn() === userColor;
        if (userTurn && moves.length > 1) {
          warn(lesson.id, `plusieurs coups du joueur après « ${chess.history().join(" ")} » (${moves.join(", ")})`);
        }
        const stats = options.offline ? null : await masters(chess.fen());
        let before = null;
        if (engine && userTurn) before = await engine.evaluate(chess.fen(), depth);

        for (const san of moves) {
          const played = stats?.moves.find((m) => m.san === san);
          if (stats && !played && lesson.kind !== "trap") {
            rareMoves++;
            warn(lesson.id, `« ${san} » absent chez les maîtres après « ${chess.history().join(" ") || "départ"} »`);
          }
          chess.move(san);
          // Un mat n'a pas d'évaluation moteur exploitable : le coup est forcément le meilleur.
          if (engine && userTurn && !chess.isCheckmate()) {
            const after = await engine.evaluate(chess.fen(), depth);
            const sign = userColor === "w" ? 1 : -1;
            const loss = sign * (before - after);
            if (loss > threshold) {
              warn(lesson.id, `Stockfish : « ${san} » perd ${loss} cp après « ${chess.history().slice(0, -1).join(" ")} »`);
            }
          }
          await visit(node.children[san], ply + 1);
          chess.undo();
        }
      };
      await visit(root, 0);

      if (textual.length < 3) warn(lesson.id, `${textual.length} commentaire(s) (3 minimum)`);
      if (lesson.objectives.length === 0) warn(lesson.id, "aucun objectif");
      console.log(
        `  ${lesson.id.padEnd(14)} ${String(leaves).padStart(2)} variante(s) · ${String(maxPlies).padStart(2)} demi-coups · ` +
          `${String(textual.length).padStart(2)} commentaires · ${String(arrows).padStart(2)} flèches · ${lesson.title}` +
          (rareMoves ? ` · ${rareMoves} coup(s) rare(s)` : ""),
      );
    }
  }

  for (const [sentence, ids] of sentences) {
    if (ids.length > 1) warn(ids.join(", "), `phrase répétée : « ${sentence.slice(0, 70)}… »`);
  }

  mastersCache.save();
  engine?.stop();
  console.log(problems.length ? `\n${problems.length} remarque(s) :` : "\nAucune remarque.");
  for (const p of problems) console.log(`  - ${p}`);
  if (problems.length && options.strict) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// traps : coups adverses joués chez les maîtres (même rarement) que Stockfish réfute nettement
// ---------------------------------------------------------------------------
async function traps(courseId, options) {
  const preset = PRESETS[courseId] ?? {};
  const side = options.side ?? preset.side;
  const rootSans = String(options.root ?? preset.root ?? "").split(/\s+/).filter(Boolean);
  const maxDepth = num(options.depth, 20);
  const minGames = num(options["min-games"], 30);
  const swing = num(options.swing, 150);
  const engineDepth = num(options["engine-depth"], 14);
  const budget = { positions: num(options.budget, 120) };

  const engine = startEngine();
  await engine.ready();
  const chess = new Chess();
  for (const san of rootSans) chess.move(san);
  const sign = side === "white" ? 1 : -1;
  const found = [];

  async function walk(ply) {
    if (ply >= maxDepth || budget.positions-- <= 0) return;
    const stats = await masters(chess.fen());
    if (stats.total < minGames) return;
    const opponentToMove = (chess.turn() === "w" ? "white" : "black") !== side;

    if (opponentToMove) {
      const best = sign * (await engine.evaluate(chess.fen(), engineDepth));
      for (const move of stats.moves) {
        chess.move(move.san);
        const after = sign * (await engine.evaluate(chess.fen(), engineDepth));
        if (after - best >= swing) {
          const pv = await engine.principalVariation(chess.fen(), engineDepth + 2, 8);
          found.push({ line: chess.history().join(" "), games: move.games, gain: after - best, pv });
        }
        chess.undo();
      }
    }
    // On ne descend que dans les coups fréquents (le tronc des parties réelles).
    const descend = opponentToMove
      ? stats.moves.filter((m) => m.games >= minGames).slice(0, num(options.branches, 3))
      : stats.moves.slice(0, 1);
    for (const move of descend) {
      chess.move(move.san);
      await walk(ply + 1);
      chess.undo();
    }
  }

  console.log(`Pièges ${courseId} (${side}) depuis « ${rootSans.join(" ")} » (écart ≥ ${swing} cp)…`);
  await walk(rootSans.length);
  mastersCache.save();
  engine.stop();
  found.sort((a, b) => b.gain - a.gain);
  for (const trap of found) {
    console.log(`  +${trap.gain} cp · ${trap.games} partie(s) · ${trap.line}\n      réfutation : ${trap.pv.join(" ")}`);
  }
  if (found.length === 0) console.log("  Aucun coup adverse nettement réfuté sur ce tronc.");
}

// ---------------------------------------------------------------------------
// query : coups des maîtres après une suite de coups (aide à la rédaction)
// ---------------------------------------------------------------------------
async function query(_courseId, options) {
  for (const sequence of String(options.moves ?? "").split("|")) {
    const chess = new Chess();
    for (const san of sequence.trim().split(/\s+/).filter(Boolean)) chess.move(san);
    const stats = await masters(chess.fen());
    const summary = stats.moves
      .slice(0, num(options.top, 6))
      .map((m) => `${m.san} ${m.games} (${pct(m.games, stats.total)} %)`)
      .join(" · ");
    console.log(`${sequence.trim() || "départ"} → ${stats.total} parties : ${summary || "—"}`);
  }
  mastersCache.save();
}

// ---------------------------------------------------------------------------
// eval : évaluation Stockfish et meilleure suite après une suite de coups
// ---------------------------------------------------------------------------
async function evalLines(_courseId, options) {
  const depth = num(options.depth, 16);
  const engine = startEngine();
  await engine.ready();
  for (const sequence of String(options.moves ?? "").split("|")) {
    const chess = new Chess();
    for (const san of sequence.trim().split(/\s+/).filter(Boolean)) chess.move(san);
    const score = await engine.evaluate(chess.fen(), depth);
    const pv = await engine.principalVariation(chess.fen(), depth, 8);
    console.log(`${sequence.trim() || "départ"} → ${score > 0 ? "+" : ""}${score} cp · ${pv.join(" ")}`);
  }
  engine.stop();
}

// ---------------------------------------------------------------------------
const { command, courseId, options } = parseArgs(process.argv.slice(2));
const commands = { extract, audit, traps, query, eval: evalLines };
if (!commands[command] || !courseId) {
  console.log("Usage : npm run courses:lab -- <extract|audit|traps|query|eval> <cours> [options] (voir l'en-tête du script)");
  process.exit(1);
}
commands[command](courseId, options).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  if (error?.cause) console.error("  cause :", error.cause.code ?? "", error.cause.message ?? error.cause);
  if (options.debug) console.error(error?.stack);
  process.exit(1);
});
