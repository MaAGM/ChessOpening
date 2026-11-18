import type { FunctionReference, FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";

/** Résultat de `coach.explain` : explication, quota atteint ou Coach indisponible. */
export type CoachExplainResult = FunctionReturnType<typeof api.coach.explain>;

/** Demande d'explication au serveur à partir de la partie « utilisateur » du prompt. */
export type CoachExplainer = (userPrompt: string) => Promise<CoachExplainResult>;

/** Ce que le Coach utilise d'un client Convex (`ConvexReactClient`, ou un faux dans les tests). */
export type ConvexActionCaller = {
  action<A extends FunctionReference<"action">>(
    action: A,
    args: A["_args"],
  ): Promise<FunctionReturnType<A>>;
};

/** L'utilisateur n'est jamais transmis : le serveur le lit dans le jeton de session. */
export function createCoachExplainer(client: ConvexActionCaller): CoachExplainer {
  return (userPrompt) => client.action(api.coach.explain, { prompt: userPrompt });
}
