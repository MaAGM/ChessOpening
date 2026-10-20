import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  SRS_CONFIG,
  classifyCard,
  nextStats,
  urgency,
  type PositionStats,
} from "./srs";

const NOW = 1_000_000_000_000;

const stats = (overrides: Partial<PositionStats> = {}): PositionStats => ({
  box: 1,
  due: NOW,
  attempts: 1,
  failures: 0,
  lastSeen: NOW,
  recent: [1],
  ...overrides,
});

describe("nextStats", () => {
  it("place une fiche nouvelle réussie en boîte 2, due dans 1 jour", () => {
    const next = nextStats(undefined, true, NOW);
    expect(next).toEqual({
      box: 2,
      due: NOW + DAY_MS,
      attempts: 1,
      failures: 0,
      lastSeen: NOW,
      recent: [1],
    });
  });

  it("fait monter d'une boîte à chaque réussite, jusqu'à la dernière", () => {
    let current: PositionStats | undefined;
    const boxes: number[] = [];
    for (let i = 0; i < 6; i++) {
      current = nextStats(current, true, NOW);
      boxes.push(current.box);
    }
    expect(boxes).toEqual([2, 3, 4, 5, 5, 5]);
  });

  it("renvoie en boîte 1 après une erreur et compte l'échec", () => {
    const next = nextStats(stats({ box: 4, attempts: 3, recent: [1, 1, 1] }), false, NOW);
    expect(next.box).toBe(SRS_CONFIG.failureBox);
    expect(next.due).toBe(NOW); // à revoir tout de suite
    expect(next.failures).toBe(1);
    expect(next.attempts).toBe(4);
    expect(next.recent).toEqual([1, 1, 1, 0]);
  });

  it("ne garde que les derniers résultats", () => {
    let current: PositionStats | undefined;
    for (let i = 0; i < 8; i++) current = nextStats(current, i % 2 === 0, NOW);
    expect(current!.recent).toHaveLength(SRS_CONFIG.recentWindow);
  });

  it("ne mute pas l'état précédent", () => {
    const prev = stats({ recent: [1, 0] });
    const copy = JSON.stringify(prev);
    nextStats(prev, true, NOW);
    expect(JSON.stringify(prev)).toBe(copy);
  });
});

describe("urgency", () => {
  it("est maximale pour une fiche jamais vue", () => {
    expect(urgency(undefined, NOW)).toBe(SRS_CONFIG.urgency.unseen);
  });

  it("est forte juste après une erreur", () => {
    const failed = stats({ box: 1, due: NOW, recent: [0] });
    expect(urgency(failed, NOW)).toBeCloseTo(1, 5); // 0,5 (due) + 0,5 (échec récent)
  });

  it("croît avec le retard, dans la limite du plafond", () => {
    const onTime = urgency(stats({ box: 3, due: NOW, recent: [1] }), NOW);
    const late = urgency(stats({ box: 3, due: NOW - 3 * DAY_MS, recent: [1] }), NOW);
    const veryLate = urgency(stats({ box: 3, due: NOW - 30 * DAY_MS, recent: [1] }), NOW);
    expect(late).toBeGreaterThan(onTime);
    expect(veryLate).toBeCloseTo(SRS_CONFIG.urgency.overdueMax, 5);
  });

  it("est très faible pour une fiche maîtrisée et pas encore due", () => {
    const mastered = stats({ box: 5, due: NOW + 10 * DAY_MS, recent: [1, 1, 1, 1, 1] });
    expect(urgency(mastered, NOW)).toBeLessThan(0.05);
  });

  it("est plus forte pour une fiche souvent ratée que pour une fiche réussie, à échéance égale", () => {
    const fragile = stats({ box: 2, due: NOW + DAY_MS, recent: [0, 0, 1] });
    const solid = stats({ box: 2, due: NOW + DAY_MS, recent: [1, 1, 1] });
    expect(urgency(fragile, NOW)).toBeGreaterThan(urgency(solid, NOW));
  });
});

describe("classifyCard", () => {
  it("distingue nouvelle, due, en cours et maîtrisée", () => {
    expect(classifyCard(undefined, NOW)).toBe("new");
    expect(classifyCard(stats({ box: 2, due: NOW - 1 }), NOW)).toBe("due");
    expect(classifyCard(stats({ box: 3, due: NOW + DAY_MS }), NOW)).toBe("learning");
    expect(classifyCard(stats({ box: 5, due: NOW + DAY_MS }), NOW)).toBe("mastered");
  });
});
