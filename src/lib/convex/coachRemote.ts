import type { FunctionReference, FunctionReturnType } from "convex/server";

import type { CoachChatMessage, CoachPositionSnapshot } from "@/lib/coach/chatProtocol";

import { api } from "../../../convex/_generated/api";

/** Résultat de `coach.chat` : réponse, quota atteint ou Coach indisponible. */
export type CoachChatResult = FunctionReturnType<typeof api.coach.chat>;
export type CoachRemaining = FunctionReturnType<typeof api.coach.remaining>;

/** Ce que le chat du Coach attend du serveur (un faux dans les tests). */
export type CoachChatBackend = {
  send: (messages: CoachChatMessage[], position: CoachPositionSnapshot) => Promise<CoachChatResult>;
  remaining: () => Promise<CoachRemaining>;
};

/** Ce que le Coach utilise d'un client Convex (`ConvexReactClient`, ou un faux dans les tests). */
export type ConvexCoachCaller = {
  action<A extends FunctionReference<"action">>(action: A, args: A["_args"]): Promise<FunctionReturnType<A>>;
  query<Q extends FunctionReference<"query">>(query: Q, args: Q["_args"]): Promise<FunctionReturnType<Q>>;
};

/** L'utilisateur n'est jamais transmis : le serveur le lit dans le jeton de session. */
export function createCoachChatBackend(client: ConvexCoachCaller): CoachChatBackend {
  return {
    send: (messages, position) => client.action(api.coach.chat, { messages, position }),
    remaining: () => client.query(api.coach.remaining, {}),
  };
}
