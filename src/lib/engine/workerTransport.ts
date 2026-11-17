import type { EngineTransport } from "./engineClient";

/** Emplacement du moteur copié par `scripts/copy-stockfish.mjs` (build lite single-thread). */
export const STOCKFISH_WORKER_URL = "/engine/stockfish.js";

/** Transport UCI au-dessus d'un Web Worker (navigateur uniquement). */
export function createWorkerTransport(url: string = STOCKFISH_WORKER_URL): EngineTransport {
  const worker = new Worker(url);
  return {
    post: (command) => worker.postMessage(command),
    subscribe(onLine, onError) {
      const handleMessage = (event: MessageEvent) => {
        if (typeof event.data === "string") onLine(event.data);
      };
      const handleError = (event: ErrorEvent | MessageEvent) => onError(event);
      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.addEventListener("messageerror", handleError);
      return () => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        worker.removeEventListener("messageerror", handleError);
      };
    },
    terminate: () => worker.terminate(),
  };
}
