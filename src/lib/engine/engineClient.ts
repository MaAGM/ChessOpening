import { fenTurn } from "@/lib/review/positionKey";
import type { Side } from "@/lib/review/types";

import { LruCache, analysisKey } from "./analysisCache";
import { parseBestMove, parseInfoLine, toWhitePov, type EngineScore } from "./uci";

/**
 * Canal texte vers un moteur UCI (Web Worker en production, faux moteur en test).
 */
export type EngineTransport = {
  post(command: string): void;
  /** Abonne aux lignes émises par le moteur ; `onError` si le moteur plante ou ne charge pas. */
  subscribe(onLine: (line: string) => void, onError: (error: unknown) => void): () => void;
  terminate(): void;
};

export type EngineAnalysis = {
  fen: string;
  key: string;
  turn: Side;
  /** Profondeur atteinte (0 tant qu'aucune ligne exploitable n'est arrivée). */
  depth: number;
  /** Score du point de vue des Blancs ; `null` si le moteur n'en a donné aucun. */
  score: EngineScore | null;
  /** Meilleur coup en UCI (`e2e4`) ; `null` si aucun coup légal ou pas encore connu. */
  bestMove: string | null;
  pv: string[];
  /** `true` une fois la profondeur demandée atteinte (`bestmove` reçu). */
  complete: boolean;
};

export type EngineStatus = "loading" | "ready" | "error" | "disposed";

export type AnalyzeOptions = {
  depth?: number;
  /** Appelé à chaque amélioration de l'analyse (et une fois avec le résultat final). */
  onUpdate?: (analysis: EngineAnalysis) => void;
};

export type EngineClientOptions = {
  defaultDepth?: number;
  cacheSize?: number;
};

type Job = {
  fen: string;
  key: string;
  turn: Side;
  depth: number;
  onUpdate?: (analysis: EngineAnalysis) => void;
  resolve: (analysis: EngineAnalysis | null) => void;
  latest: EngineAnalysis;
  /** Recherche remplacée par une autre : ses lignes ne sont plus transmises. */
  cancelled: boolean;
};

export const DEFAULT_ENGINE_DEPTH = 16;

/**
 * Client UCI asynchrone, une seule recherche à la fois :
 *  - `analyze` remplace la recherche en cours (le moteur reçoit `stop`, la recherche
 *    abandonnée se résout à `null`) ; seule la dernière demande en attente est gardée ;
 *  - les analyses terminées sont mises en cache par position (LRU).
 */
export class EngineClient {
  private readonly cache: LruCache<EngineAnalysis>;
  private readonly defaultDepth: number;
  private readonly unsubscribe: () => void;
  private current: Job | null = null;
  private pending: Job | null = null;
  private _status: EngineStatus = "loading";
  private handshake: "uci" | "isready" | "done" = "uci";

  constructor(
    private readonly transport: EngineTransport,
    options: EngineClientOptions = {},
  ) {
    this.defaultDepth = options.defaultDepth ?? DEFAULT_ENGINE_DEPTH;
    this.cache = new LruCache(options.cacheSize ?? 300);
    this.unsubscribe = transport.subscribe(
      (line) => this.handleLine(line),
      () => this.fail(),
    );
    transport.post("uci");
  }

  get status(): EngineStatus {
    return this._status;
  }

  /** Analyse terminée en cache pour cette position (au moins à `depth` si précisé). */
  getCached(fen: string, depth?: number): EngineAnalysis | null {
    const cached = this.cache.get(analysisKey(fen));
    if (!cached) return null;
    return depth === undefined || cached.depth >= depth ? cached : null;
  }

  analyze(fen: string, options: AnalyzeOptions = {}): Promise<EngineAnalysis | null> {
    const depth = options.depth ?? this.defaultDepth;

    if (this._status === "error" || this._status === "disposed") return Promise.resolve(null);

    const cached = this.getCached(fen, depth);
    if (cached) {
      // Une nouvelle demande annule toujours la précédente, même servie par le cache.
      this.cancelPending();
      this.cancelCurrent();
      options.onUpdate?.(cached);
      return Promise.resolve(cached);
    }

    return new Promise((resolve) => {
      const key = analysisKey(fen);
      const turn = fenTurn(fen);
      const job: Job = {
        fen,
        key,
        turn,
        depth,
        onUpdate: options.onUpdate,
        resolve,
        cancelled: false,
        latest: { fen, key, turn, depth: 0, score: null, bestMove: null, pv: [], complete: false },
      };
      this.cancelPending();
      this.pending = job;
      this.cancelCurrent();
      this.pump();
    });
  }

  /** Abandonne la recherche en cours et la demande en attente. */
  stop(): void {
    this.cancelPending();
    this.cancelCurrent();
  }

  dispose(): void {
    if (this._status === "disposed") return;
    this.stop();
    this.current?.resolve(null);
    this.current = null;
    this._status = "disposed";
    this.unsubscribe();
    try {
      this.transport.post("quit");
    } finally {
      this.transport.terminate();
    }
  }

  // ----------------------------------------------------------------------

  private cancelPending() {
    if (!this.pending) return;
    this.pending.cancelled = true;
    this.pending.resolve(null);
    this.pending = null;
  }

  /** Demande l'arrêt de la recherche en cours ; elle sera close au `bestmove` suivant. */
  private cancelCurrent() {
    const job = this.current;
    if (!job || job.cancelled) return;
    job.cancelled = true;
    job.resolve(null);
    this.transport.post("stop");
  }

  /** Lance la demande en attente si le moteur est prêt et libre. */
  private pump() {
    if (this._status !== "ready" || this.current || !this.pending) return;
    const job = this.pending;
    this.pending = null;
    this.current = job;
    this.transport.post(`position fen ${job.fen}`);
    this.transport.post(`go depth ${job.depth}`);
  }

  private handleLine(raw: string) {
    const line = raw.trim();
    if (!line) return;

    if (this.handshake !== "done") {
      if (this.handshake === "uci" && line === "uciok") {
        this.handshake = "isready";
        this.transport.post("isready");
      } else if (this.handshake === "isready" && line === "readyok") {
        this.handshake = "done";
        this._status = "ready";
        this.pump();
      }
      return;
    }

    if (line.startsWith("info")) {
      this.handleInfo(line);
    } else if (line.startsWith("bestmove")) {
      this.handleBestMove(line);
    }
  }

  private handleInfo(line: string) {
    const job = this.current;
    if (!job || job.cancelled) return;
    const info = parseInfoLine(line);
    // Seule la variante principale nous intéresse ; les scores partiels (bornes) sont ignorés.
    if (!info || info.multipv !== 1 || info.bound) return;

    job.latest = {
      ...job.latest,
      depth: info.depth,
      score: toWhitePov(info.score, job.turn),
      bestMove: info.pv[0] ?? job.latest.bestMove,
      pv: info.pv.length > 0 ? info.pv : job.latest.pv,
    };
    job.onUpdate?.(job.latest);
  }

  private handleBestMove(line: string) {
    const job = this.current;
    this.current = null;

    if (job && !job.cancelled) {
      const parsed = parseBestMove(line);
      const final: EngineAnalysis = {
        ...job.latest,
        bestMove: parsed ? parsed.bestMove : job.latest.bestMove,
        // Sans coup légal, la position est finale : la profondeur demandée est « atteinte ».
        depth: parsed && parsed.bestMove === null ? job.depth : job.latest.depth,
        complete: true,
      };
      if (parsed?.bestMove === null) final.pv = [];
      this.cache.set(job.key, final);
      job.onUpdate?.(final);
      job.resolve(final);
    }

    this.pump();
  }

  private fail() {
    if (this._status === "disposed") return;
    this._status = "error";
    this.cancelPending();
    if (this.current) {
      this.current.cancelled = true;
      this.current.resolve(null);
      this.current = null;
    }
  }
}
