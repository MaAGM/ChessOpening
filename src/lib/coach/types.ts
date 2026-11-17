import type { Arrow } from "@/lib/data/openings/types";
import type { EngineScore } from "@/lib/engine/uci";
import type { MoveSymbol } from "@/lib/repertoire/types";
import type { Side } from "@/lib/review/types";

// ===========================================================================
// Entrées
// ===========================================================================

/**
 * Analyse moteur d'une position : sous-ensemble compatible avec `EngineAnalysis`
 * (on peut lui passer directement le résultat de `EngineClient.analyze`).
 */
export type CoachEngineInput = {
  /** Score du point de vue des BLANCS (convention de `EngineAnalysis`). */
  score: EngineScore | null;
  depth: number;
  /** Variante principale en UCI, depuis la position analysée. */
  pv: string[];
};

/** Un coup prévu par le répertoire depuis la position, avec ses annotations. */
export type BookMove = {
  /** Coup SAN canonique. */
  san: string;
  /** Source qui le contient (répertoire ou chapitre Masterclass). */
  sourceId: string;
  sourceName: string;
  /** Premier choix parmi les suites possibles (children[0]) dans cette source. */
  isMainLine: boolean;
  symbol?: MoveSymbol;
  comment?: string;
  arrows?: Arrow[];
  /** Suite principale du répertoire APRÈS ce coup (SAN), éventuellement vide. */
  continuation: string[];
};

/** Commentaire attaché au coup qui a mené à la position (souvent : le plan à suivre). */
export type PositionNote = {
  sourceId: string;
  sourceName: string;
  /** Coup (SAN) qui a mené à la position. */
  san: string;
  comment?: string;
  arrows?: Arrow[];
};

/** Analyses moteur disponibles au moment de l'erreur (toutes facultatives). */
export type CoachEngineData = {
  /** Position AVANT le coup (le joueur au trait) : meilleur coup du moteur. */
  before?: CoachEngineInput | null;
  /** Position APRÈS le coup joué (l'adversaire au trait) : la PV est la réfutation. */
  played?: CoachEngineInput | null;
  /** Position APRÈS chaque coup du répertoire, indexée par SAN. */
  expected?: Readonly<Record<string, CoachEngineInput | null | undefined>>;
};

/** Seuils de classification, en perte de chances de gain (échelle -1 → +1, comme Lichess). */
export type CoachThresholds = {
  inaccuracy: number;
  mistake: number;
  blunder: number;
  /** Perte matérielle (en pions) à partir de laquelle l'erreur est jugée tactique. */
  tacticalMaterial: number;
  /** Nombre maximal de demi-coups de PV rejoués pour mesurer le matériel. */
  materialPlies: number;
};

export type CoachMistakeInput = {
  /** Position où le joueur s'est trompé (FEN complète). */
  fenBefore: string;
  /** Coup joué par l'utilisateur (SAN). */
  playedSan: string;
  /** Coups (SAN) depuis la position initiale jusqu'à `fenBefore`, si connus. */
  history?: string[];
  openingName?: string | null;
  bookMoves: BookMove[];
  positionNotes?: PositionNote[];
  engine?: CoachEngineData;
  thresholds?: Partial<CoachThresholds>;
};

// ===========================================================================
// Contexte assemblé
// ===========================================================================

/** Évaluation exprimée du point de vue du JOUEUR (et non des Blancs). */
export type PlayerScore =
  | { kind: "cp"; cp: number }
  /** `moves` = 0 : la position est déjà mat. */
  | { kind: "mate"; moves: number; winner: "player" | "opponent" };

/** Évaluation d'un coup candidat (joué, du répertoire ou du moteur). */
export type MoveEvaluation = {
  /** Coup évalué (SAN), joué depuis `fenBefore`. */
  san: string;
  score: PlayerScore;
  /** Chances de gain du joueur, de -1 (perdu) à +1 (gagné). */
  winChance: number;
  depth: number;
  /** Suite attendue APRÈS le coup (SAN), convertie depuis la PV du moteur. */
  line: string[];
};

export type Severity = "none" | "inaccuracy" | "mistake" | "blunder";

/**
 * Diagnostic pédagogique de l'écart :
 *  - `tactical_blunder`   : vraie gaffe (mat concédé ou perte matérielle forcée) ;
 *  - `strategic_error`    : erreur nette sans gain matériel immédiat pour l'adversaire ;
 *  - `inaccuracy`         : coup jouable mais qui concède un peu ;
 *  - `playable_deviation` : coup objectivement correct, simple écart au répertoire ;
 *  - `unevaluated`        : pas assez de données moteur pour juger.
 */
export type CoachVerdict =
  | "tactical_blunder"
  | "strategic_error"
  | "inaccuracy"
  | "playable_deviation"
  | "unevaluated";

export type CoachMotifs = {
  /** Après le coup joué, l'adversaire a un mat forcé (et pas après le coup de référence). */
  allowsMate: boolean;
  /** Le coup de référence menait à un mat forcé que le coup joué laisse échapper. */
  missesMate: boolean;
  /**
   * Matériel perdu (en pions) par rapport à la ligne de référence, mesuré le long des
   * variantes du moteur ; `null` faute de variante exploitable.
   */
  materialLoss: number | null;
};

export type CoachAssessment = {
  played: MoveEvaluation | null;
  /** Coup qui sert d'étalon : meilleur coup du répertoire évalué, sinon meilleur coup du moteur. */
  reference: (MoveEvaluation & { origin: "book" | "engine" }) | null;
  /** Meilleur coup selon le moteur dans la position de départ, s'il est connu. */
  engineBest: MoveEvaluation | null;
  /** Perte en centipions (null si l'une des deux évaluations est un mat). */
  lossCp: number | null;
  /** Perte de chances de gain (échelle -1 → +1) ; négative si le coup joué est meilleur. */
  winChanceLoss: number | null;
  severity: Severity;
  verdict: CoachVerdict;
  motifs: CoachMotifs;
  /** Le moteur préfère (nettement) le coup joué au coup de référence. */
  playedIsBetter: boolean;
};

export type CoachContext = {
  fenBefore: string;
  fenAfter: string;
  playerSide: Side;
  /** Demi-coup (0 = premier coup des Blancs) du coup joué. */
  ply: number;
  playedSan: string;
  openingName: string | null;
  /** Coups depuis la position initiale (vide si inconnus). */
  history: string[];
  /** Coups du répertoire, ligne principale en tête. */
  bookMoves: BookMove[];
  positionNotes: PositionNote[];
  assessment: CoachAssessment;
};

// ===========================================================================
// Prompt
// ===========================================================================

export type CoachPrompt = {
  /** Consignes système (rôle, règles). */
  system: string;
  /** Message utilisateur : le contexte structuré et la consigne propre au verdict. */
  user: string;
  verdict: CoachVerdict;
};
