/**
 * Clé de cache d'analyse : placement + trait + roques + case en passant.
 *
 * Contrairement à `toPositionKey` (répertoire), la case en passant est conservée :
 * elle change les coups légaux, donc potentiellement le meilleur coup. Les compteurs
 * de coups sont ignorés (la règle des 50 coups ne joue pas en ouverture).
 */
export function analysisKey(fen: string): string {
  const [placement, turn = "w", castling = "-", enPassant = "-"] = fen.trim().split(/\s+/);
  return `${placement} ${turn} ${castling} ${enPassant}`;
}

/** Cache LRU borné : la dernière entrée lue ou écrite est la plus récente. */
export class LruCache<V> {
  private readonly entries = new Map<string, V>();

  constructor(private readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError("La capacité du cache doit être un entier ≥ 1.");
    }
  }

  get size(): number {
    return this.entries.size;
  }

  get(key: string): V | undefined {
    if (!this.entries.has(key)) return undefined;
    const value = this.entries.get(key) as V;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, value);
    while (this.entries.size > this.capacity) {
      const oldest = this.entries.keys().next().value as string;
      this.entries.delete(oldest);
    }
  }

  clear(): void {
    this.entries.clear();
  }
}
