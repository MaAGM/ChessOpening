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
};

/** Camp affiché en bas de l'échiquier. */
export type CoachSide = "white" | "black";

// ===========================================================================
// Consignes système (`./systemPrompt`, lui aussi sans import)
// ===========================================================================

export { COACH_CHAT_SYSTEM_PROMPT } from "./systemPrompt";

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

/** Bloc de contexte joint à la dernière question du joueur. */
export function formatPositionContext(position: CoachPositionSnapshot): string {
  const lines: string[] = ["[Position affichée]"];
  lines.push(`FEN : ${position.fen}`);
  lines.push(`Coups joués : ${position.moves.length > 0 ? formatMoveSequence(position.moves) : "aucun (position initiale)"}`);
  lines.push(...describeSides(position));
  if (position.openingName) lines.push(`Ouverture : ${position.openingName}`);

  if (position.engine) {
    const { score, depth, line } = position.engine;
    const pv = line.length > 0 ? ` ; ligne principale : ${formatMoveSequence(line, position.moves.length)}` : "";
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
  } else {
    lines.push("Base des maîtres : aucune partie de maître depuis cette position");
  }
  return lines.join("\n");
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
