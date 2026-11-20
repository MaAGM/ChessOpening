import Anthropic from "@anthropic-ai/sdk";

/**
 * Appel au LLM du Coach, isolé dans son module : les tests le remplacent (`vi.mock`)
 * pour ne jamais interroger l'API réelle.
 */

export const DEFAULT_COACH_MODEL = "claude-haiku-5-5";

/**
 * Plafond de sortie. Le Coach répond en 2 à 4 phrases courtes : ce plafond borne le
 * coût d'un appel sans tronquer une réponse normale.
 */
export const COACH_MAX_OUTPUT_TOKENS = 600;

export type CoachCompletion = {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export type CoachTurn = { role: "user" | "assistant"; content: string };

/** Erreur « métier » du LLM (refus, réponse vide) : message affichable, sans détail interne. */
export class CoachModelError extends Error {}

export async function callCoachModel(args: {
  apiKey: string;
  model: string;
  system: string;
  messages: CoachTurn[];
}): Promise<CoachCompletion> {
  const client = new Anthropic({ apiKey: args.apiKey, maxRetries: 1, timeout: 30_000 });

  const response = await client.messages.create({
    model: args.model,
    max_tokens: COACH_MAX_OUTPUT_TOKENS,
    // Discussion courte à partir d'un contexte déjà analysé : effort minimal. Sur Haiku,
    // la réflexion est coupée pour que tout le plafond serve à la réponse visible.
    output_config: { effort: "low" },
    ...(args.model.startsWith("claude-haiku") ? { thinking: { type: "disabled" as const } } : {}),
    // Consignes figées en tête : préfixe stable, mis en cache d'un message à l'autre.
    system: [{ type: "text", text: args.system, cache_control: { type: "ephemeral" } }],
    messages: args.messages,
  });

  if (response.stop_reason === "refusal") {
    throw new CoachModelError("Le Coach n'a pas pu répondre à cette demande.");
  }

  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
  if (!text) throw new CoachModelError("Le Coach n'a renvoyé aucune réponse.");

  const usage = response.usage;
  return {
    text,
    model: response.model,
    inputTokens:
      usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0),
    outputTokens: usage.output_tokens,
  };
}
