import type { Arrow } from "@/lib/data/openings/types";
import { formatMove, SYMBOL_LABELS } from "@/lib/repertoire/notation";
import type { MoveSymbol } from "@/lib/repertoire/types";
import type { Side } from "@/lib/review/types";
import type {
  BookMove,
  CoachContext,
  CoachPrompt,
  CoachVerdict,
  MoveEvaluation,
  PlayerScore,
  Severity,
} from "./types";

// ===========================================================================
// Mise en forme (déterministe : aucune date, aucun hasard, ordre des entrées conservé)
// ===========================================================================

/** Coups écrits comme dans une partie à partir du demi-coup `startPly`. */
export function formatSequence(startPly: number, sans: readonly string[]): string {
  return sans.map((san, i) => formatMove(startPly + i, san, undefined, i === 0)).join(" ");
}

/** Score du point de vue du joueur : « +0.4 », « -2.1 », « mat en 3 pour vous »… */
export function formatPlayerScore(score: PlayerScore): string {
  if (score.kind === "mate") {
    if (score.moves === 0) {
      return score.winner === "player" ? "échec et mat (vous gagnez)" : "échec et mat (vous perdez)";
    }
    return score.winner === "player"
      ? `mat en ${score.moves} pour vous`
      : `mat en ${score.moves} pour l'adversaire`;
  }
  const pawns = score.cp / 100;
  const text = Math.abs(pawns).toFixed(1);
  if (text === "0.0") return "0.0";
  return pawns > 0 ? `+${text}` : `-${text}`;
}

const SIDE_LABELS: Record<Side, string> = { white: "Blancs", black: "Noirs" };

const SEVERITY_LABELS: Record<Severity, string> = {
  none: "négligeable",
  inaccuracy: "imprécision",
  mistake: "erreur",
  blunder: "gaffe",
};

const VERDICT_LABELS: Record<CoachVerdict, string> = {
  tactical_blunder: "GAFFE TACTIQUE",
  strategic_error: "ERREUR STRATÉGIQUE",
  inaccuracy: "IMPRÉCISION",
  playable_deviation: "ÉCART DE RÉPERTOIRE (coup jouable)",
  unevaluated: "NON ÉVALUÉ",
};

const VERDICT_SUMMARIES: Record<CoachVerdict, string> = {
  tactical_blunder:
    "le coup joué perd du matériel ou concède (ou rate) un mat de façon forcée.",
  strategic_error:
    "le coup joué dégrade nettement la position sans perte matérielle immédiate.",
  inaccuracy: "le coup joué reste jouable mais concède un léger avantage.",
  playable_deviation:
    "le coup joué est objectivement correct ; il s'écarte simplement du répertoire choisi.",
  unevaluated: "aucune évaluation moteur exploitable ne permet de juger le coup objectivement.",
};

const VERDICT_INSTRUCTIONS: Record<CoachVerdict, string[]> = {
  tactical_blunder: [
    "Explique concrètement la réfutation en t'appuyant sur la suite du moteur après le coup joué : ce que l'adversaire gagne et comment.",
    "Présente ensuite le coup du répertoire et l'idée qui évite ce piège.",
    "Termine par un réflexe simple pour ne plus tomber dans ce motif.",
  ],
  strategic_error: [
    "Explique le problème positionnel du coup joué (structure, développement, sécurité du roi, cases faibles…) sans inventer de variante.",
    "Compare-le à l'idée du coup du répertoire et au plan qu'il prépare.",
  ],
  inaccuracy: [
    "Rassure le joueur : le coup n'est pas une faute grave.",
    "Explique pourquoi le répertoire préfère son coup et ce que le coup joué concède.",
  ],
  playable_deviation: [
    "Ne qualifie PAS le coup joué d'erreur ni de gaffe : il est objectivement jouable.",
    "Explique que l'enjeu est la cohérence du répertoire : pourquoi mémoriser le coup prévu (plans, structures, suites préparées).",
  ],
  unevaluated: [
    "Ne te prononce pas sur la valeur objective du coup joué : aucune évaluation moteur n'est disponible.",
    "Appuie-toi uniquement sur les annotations du répertoire pour expliquer le coup attendu.",
  ],
};

const SYSTEM_PROMPT = [
  "Tu es un entraîneur d'échecs bienveillant et précis. Tu aides un joueur à mémoriser son répertoire d'ouvertures pendant une séance de révision.",
  "Le joueur vient de jouer un coup qui ne figure pas dans son répertoire. Explique-lui l'écart de façon pédagogique.",
  "Règles :",
  "1. Appuie-toi uniquement sur les données fournies (annotations du répertoire, analyse du moteur). N'invente aucune variante, évaluation ou référence théorique.",
  "2. Cite les coups en notation algébrique abrégée, exactement comme dans les données.",
  "3. Respecte le verdict fourni : il est calculé à partir du moteur et ne doit pas être contredit.",
  "4. Les évaluations sont données du point de vue du joueur (+ = avantage pour lui) ; traduis-les en mots plutôt que de répéter les chiffres.",
  "5. Réponds en français, en tutoyant le joueur, en 150 mots au maximum, sans titre ni liste à puces.",
].join("\n");

function formatSymbol(symbol: MoveSymbol | undefined): string {
  return symbol ? ` (${SYMBOL_LABELS[symbol]})` : "";
}

function formatArrows(arrows: readonly Arrow[] | undefined): string {
  return arrows && arrows.length > 0
    ? `flèches : ${arrows.map(([from, to]) => `${from}→${to}`).join(", ")}`
    : "";
}

function formatBookMove(move: BookMove, ply: number): string {
  const role = move.isMainLine ? "ligne principale" : "variante";
  const parts = [`${formatMove(ply, move.san, move.symbol)}${formatSymbol(move.symbol)} — ${role} de « ${move.sourceName} »`];
  if (move.continuation.length > 0) {
    parts.push(`suite prévue : ${formatSequence(ply + 1, move.continuation)}`);
  }
  return `  - ${parts.join(" ; ")}`;
}

function formatEvaluation(label: string, evaluation: MoveEvaluation, ply: number, lineLabel: string): string {
  const parts = [
    `${label} ${formatMove(ply, evaluation.san)} : ${formatPlayerScore(evaluation.score)} (profondeur ${evaluation.depth})`,
  ];
  if (evaluation.line.length > 0) {
    parts.push(`${lineLabel} : ${formatSequence(ply + 1, evaluation.line)}`);
  }
  return `- ${parts.join(" ; ")}`;
}

// ===========================================================================
// Sections
// ===========================================================================

function situationSection(context: CoachContext): string[] {
  const { ply } = context;
  const history =
    context.history.length > 0
      ? formatSequence(0, context.history)
      : ply === 0
        ? "(position initiale)"
        : "(non communiquée)";

  const lines = [
    "## Situation",
    `- Ouverture : ${context.openingName ?? "non identifiée"}`,
    `- Camp du joueur : ${SIDE_LABELS[context.playerSide]}`,
    `- Coups joués jusqu'ici : ${history}`,
    `- Position avant le coup (FEN) : ${context.fenBefore}`,
    `- Coup joué : ${formatMove(ply, context.playedSan)}`,
  ];
  if (context.bookMoves.length === 0) {
    lines.push("- Coup(s) attendu(s) par le répertoire : (non communiqués)");
  } else {
    lines.push("- Coup(s) attendu(s) par le répertoire :");
    for (const move of context.bookMoves) lines.push(formatBookMove(move, ply));
  }
  return lines;
}

function annotationsSection(context: CoachContext): string[] {
  const entries: string[] = [];
  const previousPly = Math.max(0, context.ply - 1);

  for (const note of context.positionNotes) {
    const details = [note.comment?.trim(), formatArrows(note.arrows)].filter(Boolean).join(" ; ");
    entries.push(`- Après ${formatMove(previousPly, note.san)} (« ${note.sourceName} ») : ${details}`);
  }
  for (const move of context.bookMoves) {
    const details = [move.comment?.trim(), formatArrows(move.arrows)].filter(Boolean).join(" ; ");
    if (!details) continue;
    entries.push(
      `- Sur ${formatMove(context.ply, move.san, move.symbol)} (« ${move.sourceName} ») : ${details}`,
    );
  }

  return [
    "## Annotations du répertoire",
    ...(entries.length > 0
      ? entries
      : ["- Aucun commentaire ni annotation dans le répertoire pour cette position."]),
  ];
}

function engineSection(context: CoachContext): string[] {
  const { assessment, ply } = context;
  const { played, reference, engineBest, motifs } = assessment;
  if (!played && !reference && !engineBest) {
    return ["## Analyse du moteur", "- Aucune analyse moteur disponible."];
  }

  const lines = [
    "## Analyse du moteur",
    "Évaluations du point de vue du joueur (+ = avantage pour lui).",
  ];
  if (reference) {
    const label = reference.origin === "book" ? "Coup du répertoire" : "Meilleur coup du moteur";
    lines.push(formatEvaluation(label, reference, ply, "suite"));
  }
  if (engineBest && (!reference || reference.origin === "book") && engineBest.san !== reference?.san) {
    lines.push(formatEvaluation("Meilleur coup du moteur", engineBest, ply, "suite"));
  }
  if (played) {
    lines.push(formatEvaluation("Coup joué", played, ply, "réponse attendue de l'adversaire"));
  } else {
    lines.push(`- Coup joué ${formatMove(ply, context.playedSan)} : non évalué`);
  }

  if (assessment.winChanceLoss !== null) {
    const loss = [
      assessment.lossCp !== null ? `${(assessment.lossCp / 100).toFixed(1)} pion(s)` : null,
      `${Math.round(assessment.winChanceLoss * 50)} point(s) de pourcentage de chances de gain`,
    ].filter(Boolean);
    lines.push(`- Écart par rapport à la référence : ${loss.join(" ; ")}`);
  }

  const motifLines: string[] = [];
  if (motifs.allowsMate) motifLines.push("le coup joué permet un mat forcé");
  if (motifs.missesMate) motifLines.push("le coup joué laisse échapper un mat forcé");
  if (motifs.materialLoss !== null && motifs.materialLoss > 0) {
    motifLines.push(`perte matérielle estimée : ${motifs.materialLoss} pion(s)`);
  }
  if (assessment.playedIsBetter) motifLines.push("le moteur préfère le coup joué au coup de référence");
  if (motifLines.length > 0) lines.push(`- Motifs : ${motifLines.join(" ; ")}`);

  return lines;
}

function diagnosticSection(context: CoachContext): string[] {
  const { verdict, severity } = context.assessment;
  const lines = ["## Diagnostic"];
  if (verdict !== "unevaluated") lines.push(`- Gravité : ${SEVERITY_LABELS[severity]}`);
  lines.push(`- Verdict : ${VERDICT_LABELS[verdict]} — ${VERDICT_SUMMARIES[verdict]}`);
  return lines;
}

function missionSection(context: CoachContext): string[] {
  const { verdict, playedIsBetter } = context.assessment;
  const instructions = [...VERDICT_INSTRUCTIONS[verdict]];
  if (playedIsBetter && verdict === "playable_deviation") {
    instructions.push(
      "Le moteur juge même le coup joué meilleur que celui du répertoire : reconnais-le honnêtement, puis rappelle l'intérêt de rester fidèle à son répertoire (ou de le mettre à jour).",
    );
  }
  if (context.bookMoves.some((m) => m.comment) || context.positionNotes.some((n) => n.comment)) {
    instructions.push("Reprends l'idée des commentaires du répertoire, reformulée simplement.");
  }
  return ["## Ta mission", ...instructions.map((text, i) => `${i + 1}. ${text}`)];
}

/**
 * Prompt structuré et déterministe : même contexte → même texte, au caractère près.
 */
export function buildCoachPrompt(context: CoachContext): CoachPrompt {
  const sections = [
    ["# Écart au répertoire en révision"],
    situationSection(context),
    annotationsSection(context),
    engineSection(context),
    diagnosticSection(context),
    missionSection(context),
  ];
  return {
    system: SYSTEM_PROMPT,
    user: sections.map((lines) => lines.join("\n")).join("\n\n"),
    verdict: context.assessment.verdict,
  };
}
