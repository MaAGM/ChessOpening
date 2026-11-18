import { getFunctionName, type FunctionReference } from "convex/server";
import type { ConvexCaller } from "@/lib/convex/caller";

export type RecordedCall = { kind: "query" | "mutation"; name: string; args: Record<string, unknown> };

type Target = {
  query(query: FunctionReference<"query">, args: never): Promise<unknown>;
  mutation(mutation: FunctionReference<"mutation">, args: never): Promise<unknown>;
};

/**
 * Enveloppe une instance convex-test : enregistre les appels et peut simuler une panne
 * (`failOn` renvoie un message d'erreur pour l'appel à faire échouer).
 */
export function recordingCaller(target: Target, failOn?: (call: RecordedCall) => string | null) {
  const calls: RecordedCall[] = [];

  function run(kind: RecordedCall["kind"], ref: FunctionReference<"query" | "mutation">, args: unknown) {
    const call: RecordedCall = { kind, name: getFunctionName(ref), args: args as Record<string, unknown> };
    calls.push(call);
    const message = failOn?.(call) ?? null;
    if (message) return Promise.reject(new Error(message));
    return kind === "query"
      ? target.query(ref as FunctionReference<"query">, args as never)
      : target.mutation(ref as FunctionReference<"mutation">, args as never);
  }

  const client = {
    query: (ref: FunctionReference<"query">, args: unknown) => run("query", ref, args),
    mutation: (ref: FunctionReference<"mutation">, args: unknown) => run("mutation", ref, args),
  } as ConvexCaller;

  return { client, calls };
}
