/**
 * Protocole du chat du Coach (mode Exploration) : limites, consignes système et mise en
 * forme du contexte de la position.
 *
 * Module SANS IMPORT externe (seulement `./systemPrompt`, lui-même sans import) : il est partagé par le client (`useCoachChat`, `chatSnapshot`) et
 * par l'action Convex `coach.chat`, qui l'importe par chemin relatif. Le serveur valide
 * tout ce que le client envoie et formate lui-même le contexte : les consignes restent
 * sous son contrôle.
 */

// ===========================================================================
// Limites (vérifiées par le client ET par le serveur)
// ===========================================================================

/** Nombre maximal de messages (questions + réponses) envoyés au LLM à chaque appel. */
export const COACH_CHAT_MAX_HISTORY = 10;
/** Longueur maximale d'une question du joueur (caractères). */
export const COACH_CHAT_MAX_MESSAGE_LENGTH = 500;
/** Longueur maximale d'une réponse du Coach renvoyée dans l'historique (caractères). */
export const COACH_CHAT_MAX_REPLY_LENGTH = 3_000;
/** Plafonds du contexte de position. */
export const COACH_CHAT_MAX_FEN_LENGTH = 100;
export const COACH_CHAT_MAX_MOVES = 300;
export const COACH_CHAT_MAX_SAN_LENGTH = 10;
export const COACH_CHAT_MAX_OPENING_LENGTH = 120;
export const COACH_CHAT_MAX_ENGINE_LINE = 12;
export const COACH_CHAT_MAX_EXPLORER_MOVES = 6;
/** Plafonds du contexte de cours (mode Apprentissage). */
export const COACH_CHAT_MAX_LESSON_TITLE_LENGTH = 160;
export const COACH_CHAT_MAX_OBJECTIVES = 8;
export const COACH_CHAT_MAX_OBJECTIVE_LENGTH = 200;
export const COACH_CHAT_MAX_COMMENT_LENGTH = 2_000;
export const COACH_CHAT_MAX_EXPECTED_MOVES = 8;

// ===========================================================================
// Types échangés avec le serveur
// ===========================================================================

export type CoachChatRole = "user" | "assistant";

export type CoachChatMessage = {
  role: CoachChatRole;
  content: string;
  /** Coups (SAN) de la position au moment de la question (messages `user` seulement). */
  moves?: string[];
};

export type CoachScore = { type: "cp" | "mate"; value: number };

export type CoachExplorerMove = {
  san: string;
  games: number;
  /** Pourcentages (0-100) de victoires Blancs / nulles / victoires Noirs. */
  white: number;
  draws: number;
  black: number;
  averageRating: number;
};

/** Ce que le joueur voit à l'écran, envoyé avec chaque question. */
export type CoachPositionSnapshot = {
  fen: string;
  /** Coups (SAN) depuis la position initiale jusqu'à la position affichée. */
  moves: string[];
  openingName: string | null;
  /** Analyse Stockfish locale ; score du point de vue des BLANCS. */
  engine: { score: CoachScore; depth: number; line: string[] } | null;
  /** Base Masters de Lichess (null si indisponible). */
  explorer: { totalGames: number; moves: CoachExplorerMove[] } | null;
  /**
   * Orientation de l'échiquier (camp en bas = camp étudié par le joueur). Optionnelle
   * pour accepter les clients antérieurs au bouton « retourner l'échiquier ».
   */
  boardOrientation?: CoachSide;
  /** Cours suivi en mode Apprentissage (absent en Exploration). */
  lesson?: CoachLessonContext;
};

/** Camp affiché en bas de l'échiquier. */
export type CoachSide = "white" | "black";

/** Ce que le cours affiche et attend à la position courante (mode Apprentissage). */
export type CoachLessonContext = {
  courseName: string;
  chapterTitle: string;
  lessonTitle: string;
  objectives: string[];
  /** Commentaire du cours affiché pour la position courante (null : aucun). */
  comment: string | null;
  /**
   * Coups (SAN) prévus par le cours depuis la position affichée : ceux de l'élève quand
   * c'est à lui de jouer (à ne JAMAIS révéler), sinon les réponses prévues de l'adversaire.
   */
  expectedMoves: string[];
};

// ===========================================================================
// Consignes système (`./systemPrompt`, lui aussi sans import)
// ===========================================================================

export { COACH_CHAT_SYSTEM_PROMPT, COACH_LEARN_SYSTEM_PROMPT, coachSystemPrompt } from "./systemPrompt";

// ===========================================================================
// Mise en forme du contexte (côté serveur)
// ===========================================================================

/** `["e4", "c5", "Nf3"]` → `1.e4 c5 2.Nf3` (depuis la position initiale). */
export function formatMoveSequence(moves: readonly string[], startPly = 0): string {
  const parts: string[] = [];
  moves.forEach((san, index) => {
    const ply = startPly + index;
    const number = Math.floor(ply / 2) + 1;
    if (ply % 2 === 0) parts.push(`${number}.${san}`);
    else if (index === 0) parts.push(`${number}...${san}`);
    else parts.push(san);
  });
  return parts.join(" ");
}

/** Score côté Blancs en mots courts : « +0.35 (léger avantage Blancs) ». */
export function describeScore(score: CoachScore): string {
  if (score.type === "mate") {
    if (score.value === 0) return "mat sur l'échiquier";
    const side = score.value > 0 ? "Blancs" : "Noirs";
    return `mat en ${Math.abs(score.value)} pour les ${side}`;
  }
  const pawns = score.value / 100;
  const sign = pawns > 0 ? "+" : pawns < 0 ? "-" : "";
  const value = `${sign}${Math.abs(pawns).toFixed(2)}`;
  const magnitude = Math.abs(pawns);
  const side = pawns > 0 ? "Blancs" : "Noirs";
  const verdict =
    magnitude < 0.3
      ? "équilibre"
      : magnitude < 0.8
        ? `léger avantage ${side}`
        : magnitude < 2
          ? `net avantage ${side}`
          : `avantage décisif ${side}`;
  return `${value} (${verdict})`;
}

function sideToMove(fen: string): "Blancs" | "Noirs" {
  return fen.trim().split(/\s+/)[1] === "b" ? "Noirs" : "Blancs";
}

const SIDE_LABEL: Record<CoachSide, "Blancs" | "Noirs"> = { white: "Blancs", black: "Noirs" };

/**
 * Lignes qui lèvent toute ambiguïté sur les camps : qui a le trait, qui vient de jouer
 * et quel camp l'élève regarde (donc si c'est à lui ou à son adversaire de jouer).
 */
export function describeSides(position: Pick<CoachPositionSnapshot, "fen" | "moves" | "boardOrientation">): string[] {
  const toMove = sideToMove(position.fen);
  const other = toMove === "Blancs" ? "Noirs" : "Blancs";
  const lines = [`Trait aux ${toMove} : ce sont les ${toMove} qui jouent le prochain coup`];

  const last = position.moves[position.moves.length - 1];
  if (last) {
    lines.push(`Dernier coup joué : ${formatMoveSequence([last], position.moves.length - 1)} (par les ${other})`);
  }

  if (position.boardOrientation) {
    const viewed = SIDE_LABEL[position.boardOrientation];
    const opponent = viewed === "Blancs" ? "Noirs" : "Blancs";
    const whoPlays = viewed === toMove ? "c'est à l'élève de jouer" : `c'est à son adversaire (les ${opponent}) de jouer`;
    lines.push(`Camp vu par l'élève : les ${viewed} (en bas de l'échiquier) ; ${whoPlays}`);
  }
  return lines;
}

/**
 * Vrai en mode Apprentissage quand c'est à l'élève de jouer : le coup attendu (et le
 * premier coup de la ligne Stockfish, qui est souvent le même) doit rester secret.
 */
export function isStudentToMove(position: Pick<CoachPositionSnapshot, "fen" | "boardOrientation" | "lesson">): boolean {
  if (!position.lesson || !position.boardOrientation) return false;
  return SIDE_LABEL[position.boardOrientation] === sideToMove(position.fen);
}

/** Bloc « cours en cours » (mode Apprentissage). */
export function formatLessonContext(position: CoachPositionSnapshot): string[] {
  const lesson = position.lesson;
  if (!lesson) return [];
  const lines = ["", "[Cours suivi par l'élève]"];
  lines.push(`Ouverture : ${lesson.courseName} ; chapitre : ${lesson.chapterTitle} ; cours : ${lesson.lessonTitle}`);
  if (lesson.objectives.length > 0) lines.push(`Objectifs du cours : ${lesson.objectives.join(" ; ")}`);
  lines.push(`Commentaire du cours affiché à l'élève : ${lesson.comment ?? "aucun"}`);

  if (lesson.expectedMoves.length === 0) {
    lines.push("Fin de la variante étudiée : tu peux parler librement de tous les coups.");
  } else if (isStudentToMove(position)) {
    lines.push(
      `Coup(s) attendu(s) de l'élève — SECRET, ne l'écris jamais et ne le décris pas de façon reconnaissable : ${lesson.expectedMoves.join(", ")}`,
    );
    lines.push("C'est à l'élève de trouver ce coup : aide-le par un indice stratégique (idée, case, pièce à améliorer), jamais par le coup lui-même.");
  } else {
    lines.push(`Réponse(s) prévue(s) de l'adversaire dans le cours : ${lesson.expectedMoves.join(", ")} (tu peux en parler).`);
  }
  return lines;
}

/** Bloc de contexte joint à la dernière question du joueur. */
export function formatPositionContext(position: CoachPositionSnapshot): string {
  const lines: string[] = ["[Position affichée]"];
  lines.push(`FEN : ${position.fen}`);
  lines.push(`Coups joués : ${position.moves.length > 0 ? formatMoveSequence(position.moves) : "aucun (position initiale)"}`);
  lines.push(...describeSides(position));
  if (position.openingName) lines.push(`Ouverture : ${position.openingName}`);

  if (position.engine) {
    const { score, depth, line } = position.engine;
    // Quand l'élève doit trouver le coup, la ligne Stockfish commencerait par la réponse.
    const pv =
      line.length === 0
        ? ""
        : isStudentToMove(position)
          ? " ; ligne principale masquée (elle commence par le coup que l'élève doit trouver)"
          : ` ; ligne principale : ${formatMoveSequence(line, position.moves.length)}`;
    lines.push(`Stockfish (profondeur ${depth}) : ${describeScore(score)}${pv}`);
  } else {
    lines.push("Stockfish : analyse indisponible");
  }

  if (position.explorer && position.explorer.totalGames > 0) {
    lines.push(`Base des maîtres : ${position.explorer.totalGames} parties depuis cette position`);
    for (const move of position.explorer.moves) {
      lines.push(
        `- ${move.san} : ${move.games} parties, Blancs ${Math.round(move.white)} % / nulles ${Math.round(move.draws)} % / Noirs ${Math.round(move.black)} %, Elo moyen ${Math.round(move.averageRating)}`,
      );
    }
  } else if (!position.lesson) {
    lines.push("Base des maîtres : aucune partie de maître depuis cette position");
  }
  lines.push(...formatLessonContext(position));
  return lines.join("\n");
}

// ===========================================================================
// Garde-fou anti-divulgation (côté serveur, mode Apprentissage)
// ===========================================================================

const FRENCH_PIECES: Record<string, string> = { N: "C", B: "F", R: "T", Q: "D", K: "R" };
/** Coup de pion simple (« e4 », « d5+ ») : son nom est aussi celui d'une case, on ne le masque pas. */
const PLAIN_PAWN_PUSH = /^[a-h][1-8][+#]?$/;
const SPOILER_MASK = "(à toi de le trouver)";

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Écritures d'un coup reconnaissables dans une réponse : SAN anglaise, française, roques. */
function spellings(san: string): string[] {
  const bare = san.replace(/[+#!?]+$/, "");
  if (bare === "O-O" || bare === "O-O-O") return [bare, bare.replace(/O/g, "0")];
  const french = FRENCH_PIECES[bare[0]] ? FRENCH_PIECES[bare[0]] + bare.slice(1) : bare;
  return [...new Set([bare, french])];
}

/** Coups qui ne doivent pas apparaître dans la réponse du Coach. */
export function secretMoves(position: CoachPositionSnapshot): string[] {
  if (!isStudentToMove(position)) return [];
  const secrets = [...(position.lesson?.expectedMoves ?? [])];
  const best = position.engine?.line[0];
  if (best) secrets.push(best);
  return [...new Set(secrets)].filter((san) => !PLAIN_PAWN_PUSH.test(san));
}

/**
 * Masque dans la réponse du Coach les coups que l'élève doit trouver (filet de sécurité :
 * les consignes l'interdisent déjà). Les poussées de pion simples ne sont pas masquées,
 * car « e4 » désigne aussi la case : la consigne système seule les protège.
 */
export function maskSpoilers(text: string, position: CoachPositionSnapshot): string {
  let masked = text;
  for (const san of secretMoves(position)) {
    for (const spelling of spellings(san)) {
      const pattern = new RegExp(
        `(?<![A-Za-z0-9-])(?:\\d+\\.(?:\\.\\.)?\\s?)?${escapeRegExp(spelling)}[+#!?]*(?![A-Za-z0-9-])`,
        "g",
      );
      masked = masked.replace(pattern, SPOILER_MASK);
    }
  }
  return masked;
}

/**
 * Messages envoyés au LLM : chaque ancienne question rappelle la position où elle a été
 * posée ; la dernière porte le contexte complet de la position affichée.
 */
export function buildChatTurns(
  messages: readonly CoachChatMessage[],
  position: CoachPositionSnapshot,
): { role: CoachChatRole; content: string }[] {
  const lastIndex = messages.length - 1;
  return messages.map((message, index) => {
    if (message.role === "assistant") return { role: "assistant", content: message.content };
    if (index === lastIndex) {
      return { role: "user", content: `${formatPositionContext(position)}\n\n[Question]\n${message.content}` };
    }
    const where =
      message.moves && message.moves.length > 0
        ? `(Position après ${formatMoveSequence(message.moves)})`
        : "(Position initiale)";
    return { role: "user", content: `${where} ${message.content}` };
  });
}
