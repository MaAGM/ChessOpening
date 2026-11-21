// Constructeur de cours : brouillon de rédaction (.mjs) → src/lib/data/openings/courses/<id>.json
//
// Usage :
//   npm run courses:build -- <brouillon.mjs> [--dry]
//
// Le brouillon exporte par défaut { id, name, description, side, eco, chapters: [{ title, summary,
// stage, lessons: [{ title, eco, kind, objectives, pgn, conclusion, legacyIds?, mustCover?,
// reviewable? }] }] }. Les identifiants `<id>-c<n>` et `<id>-c<n>-l<m>` sont attribués ici.
//
// Pour chaque cours, le script :
// - parse le PGN avec le parseur interne de l'appli (aucune librairie PGN externe) ;
// - ajoute en tête des flèches de chaque coup du JOUEUR la flèche du coup lui-même (indice affiché
//   sur l'échiquier avant qu'il joue) ;
// - re-sérialise en PGN numéroté puis le valide avec `buildLessonTree` (code de l'appli).
// Avec --dry, le JSON est écrit à côté du brouillon (`<id>.dry.json`) au lieu du catalogue.
// Ensuite : `npm run courses:index`, puis `npm run courses:lab -- audit <id> --engine`.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const REPO = resolve(import.meta.dirname, "..");
const { Chess } = createRequire(join(REPO, "package.json"))("chess.js");
const { parsePgn } = await import(pathToFileURL(join(REPO, "src/lib/repertoire/pgn/parse.ts")).href);
const { buildLessonTree } = await import(pathToFileURL(join(REPO, "src/lib/data/openings/lessonTree.ts")).href);

const draftArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
if (!draftArg) {
  console.log("Usage : npm run courses:build -- <brouillon.mjs> [--dry]");
  process.exit(1);
}
const draftPath = resolve(process.cwd(), draftArg);
const draft = (await import(pathToFileURL(draftPath).href)).default;

const clean = (s) => s.replace(/\s+/g, " ").trim();

function serialize(pgn, side) {
  const [game] = parsePgn(pgn);
  if (!game || game.problems.length) throw new Error(`PGN invalide : ${game?.problems.join(" ")}\n${pgn}`);
  const chess = new Chess();
  const userTurn = () => (chess.turn() === "w" ? "white" : "black") === side;
  const number = (ply) => (ply % 2 === 0 ? `${ply / 2 + 1}. ` : `${(ply + 1) / 2}... `);

  const one = (node, ply) => {
    const isUser = userTurn();
    let move;
    try {
      move = chess.move(node.san);
    } catch {
      throw new Error(`Coup illégal ${node.san} après « ${chess.history().join(" ")} »`);
    }
    const arrows = [...(node.arrows ?? [])];
    if (isUser && !arrows.some(([a, b]) => a === move.from && b === move.to)) arrows.unshift([move.from, move.to]);
    const parts = [
      node.comment ? clean(node.comment) : "",
      arrows.length ? `[%cal ${arrows.map(([a, b]) => `G${a}${b}`).join(",")}]` : "",
    ].filter(Boolean);
    return `${number(ply)}${move.san}${parts.length ? ` {${parts.join(" ")}}` : ""}`;
  };

  // Une variante « ( … ) » suit immédiatement le coup qu'elle remplace.
  const line = (nodes, ply) => {
    if (!nodes.length) return "";
    const [main, ...alts] = nodes;
    let out = one(main, ply);
    const mainChildren = main.children;
    chess.undo();
    for (const alt of alts) {
      const sub = one(alt, ply);
      const rest = line(alt.children, ply + 1);
      chess.undo();
      out += ` (${sub}${rest ? ` ${rest}` : ""})`;
    }
    chess.move(main.san);
    const rest = line(mainChildren, ply + 1);
    chess.undo();
    return rest ? `${out} ${rest}` : out;
  };

  const intro = game.comment ? `{${clean(game.comment)}} ` : "";
  return intro + line(game.children, 0);
}

const course = {
  id: draft.id,
  name: draft.name,
  description: draft.description,
  side: draft.side,
  eco: draft.eco,
  chapters: draft.chapters.map((chapter, ci) => ({
    id: `${draft.id}-c${ci + 1}`,
    title: chapter.title,
    summary: chapter.summary,
    stage: chapter.stage,
    lessons: chapter.lessons.map((lesson, li) => {
      const id = `${draft.id}-c${ci + 1}-l${li + 1}`;
      let pgn;
      try {
        pgn = serialize(lesson.pgn, draft.side);
        buildLessonTree(pgn, draft.side, lesson.conclusion); // validation finale (code de l'appli)
      } catch (error) {
        throw new Error(`${id} (« ${lesson.title} ») : ${error.message}`);
      }
      return {
        id,
        legacyIds: lesson.legacyIds ?? [],
        title: lesson.title,
        eco: lesson.eco,
        kind: lesson.kind,
        objectives: lesson.objectives,
        pgn,
        conclusion: lesson.conclusion,
        mustCover: lesson.mustCover ?? "allBranches",
        reviewable: lesson.reviewable ?? true,
      };
    }),
  })),
};

const target = process.argv.includes("--dry")
  ? join(dirname(draftPath), `${basename(draftPath, ".mjs")}.dry.json`)
  : join(REPO, "src/lib/data/openings/courses", `${draft.id}.json`);
writeFileSync(target, `${JSON.stringify(course, null, 2)}\n`);
const lessons = course.chapters.flatMap((c) => c.lessons);
console.log(`${draft.id}.json : ${course.chapters.length} chapitres, ${lessons.length} cours → ${target}`);
