/**
 * Répétition espacée de type Leitner (5 boîtes).
 *
 * Une « fiche » est une position où c'est au joueur de jouer. Le résultat est
 * binaire : juste du premier coup, ou au moins une erreur sur cette position.
 *
 * Tout est pur : l'horloge (`now`) est toujours passée en paramètre.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

export const SRS_CONFIG = {
  maxBox: 5,
  /** Intervalle de révision par boîte (index = boîte - 1). 0 = à revoir tout de suite. */
  intervalsDays: [0, 1, 3, 7, 21],
  /** Boîte où retombe une fiche après une erreur. */
  failureBox: 1,
  /** Nombre de derniers résultats retenus pour le taux d'échec récent. */
  recentWindow: 5,
  urgency: {
    /** Urgence d'une fiche jamais vue. */
    unseen: 1,
    /** Urgence minimale d'une fiche pas encore due. */
    notDueFloor: 0.01,
    /** Urgence maximale due au retard. */
    overdueMax: 1.5,
    /** Bonus multiplié par le taux d'échec récent (0 à 1). */
    failureBonus: 0.5,
  },
  /** Part du tirage de l'ordinateur répartie uniformément (jamais d'exclusion totale). */
  explorationFloor: 0.1,
} as const;

export type PositionStats = {
  /** Boîte de Leitner, de 1 à maxBox. */
  box: number;
  /** Date d'échéance (ms depuis l'epoch). */
  due: number;
  attempts: number;
  failures: number;
  lastSeen: number;
  /** Derniers résultats, du plus ancien au plus récent (1 = juste, 0 = raté). */
  recent: number[];
};

export type CardStatus = "new" | "due" | "learning" | "mastered";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampBox(box: number): number {
  return clamp(Math.round(box), 1, SRS_CONFIG.maxBox);
}

export function intervalMs(box: number): number {
  return SRS_CONFIG.intervalsDays[clampBox(box) - 1] * DAY_MS;
}

/** Nouvel état d'une fiche après un résultat. */
export function nextStats(
  prev: PositionStats | undefined,
  success: boolean,
  now: number,
): PositionStats {
  const currentBox = prev?.box ?? 1;
  const box = success ? clampBox(currentBox + 1) : SRS_CONFIG.failureBox;

  return {
    box,
    due: now + intervalMs(box),
    attempts: (prev?.attempts ?? 0) + 1,
    failures: (prev?.failures ?? 0) + (success ? 0 : 1),
    lastSeen: now,
    recent: [...(prev?.recent ?? []), success ? 1 : 0].slice(-SRS_CONFIG.recentWindow),
  };
}

/** Taux d'échec sur les derniers résultats (0 à 1). */
export function recentFailureRate(stats: PositionStats): number {
  if (stats.recent.length === 0) return 0;
  const successes = stats.recent.reduce((sum, r) => sum + r, 0);
  return 1 - successes / stats.recent.length;
}

/**
 * Urgence d'une fiche : plus elle est élevée, plus il faut la tester.
 * Jamais vue = forte ; en retard = d'autant plus forte que le retard est grand
 * par rapport à son intervalle ; pas encore due = faible ; + bonus d'échecs récents.
 */
export function urgency(stats: PositionStats | undefined, now: number): number {
  const u = SRS_CONFIG.urgency;
  if (!stats) return u.unseen;

  // Au minimum un jour, pour que la boîte 1 (intervalle nul) ait une échelle de temps.
  const interval = Math.max(intervalMs(stats.box), DAY_MS);
  const overdue = (now - stats.due) / interval;
  const dueness = clamp(0.5 + overdue, u.notDueFloor, u.overdueMax);

  return dueness + u.failureBonus * recentFailureRate(stats);
}

export function classifyCard(stats: PositionStats | undefined, now: number): CardStatus {
  if (!stats) return "new";
  if (now >= stats.due) return "due";
  return stats.box >= SRS_CONFIG.maxBox ? "mastered" : "learning";
}