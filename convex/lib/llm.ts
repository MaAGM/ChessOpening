import Anthropic from "@anthropic-ai/sdk";

/**
 * Appel au LLM du Coach, isolé dans son module : les tests le remplacent (`vi.mock`)
 * pour ne jamais interroger l'API réelle.
 */

export const DEFAULT_COACH_MODEL = "claude-haiku-5-5";

/**
 * Plafond de sortie (réflexion comprise). La réponse attendue fait 150 mots au plus :
 * ce plafond borne le coût d'un appel sans tronquer une réponse normale.
 */
const MAX_OUTPUT_TOKENS = 4096;

export type CoachCompletion = {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

/** Erreur « métier » du LLM (refus, réponse vide) : message affichable, sans détail interne. */
export class CoachModelError extends Error {}

export async function callCoachModel(args: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
}): Promise<CoachCompletion> {
  const client = new Anthropic({ apiKey: args.apiKey, maxRetries: 1, timeout: 60_000 });

  const response = await client.messages.create({
    model: args.model,
    max_tokens: MAX_OUTPUT_TOKENS,
    // Explication courte à partir d'un contexte déjà analysé : peu de réflexion nécessaire.
    output_config: { effort: "low" },
    system: args.system,
    messages: [{ role: "user", content: args.user }],
  });

  if (response.stop_reason === "refusal") {
    throw new CoachModelError("Le Coach n'a pas pu répondre à cette demande.");
  }

  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
  if (!text) throw new CoachModelError("Le Coach n'a renvoyé aucune explication.");

  return {
    text,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
