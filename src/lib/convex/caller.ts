import {
  getFunctionName,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType,
} from "convex/server";

/**
 * Ce que les implémentations distantes utilisent d'un client Convex : `ConvexReactClient`,
 * `ConvexHttpClient` ou, dans les tests, une instance `convex-test` authentifiée.
 * L'utilisateur n'est jamais passé en argument : le serveur le lit dans le jeton.
 */
export type ConvexCaller = {
  query<Q extends FunctionReference<"query">>(query: Q, args: FunctionArgs<Q>): Promise<FunctionReturnType<Q>>;
  mutation<M extends FunctionReference<"mutation">>(
    mutation: M,
    args: FunctionArgs<M>,
  ): Promise<FunctionReturnType<M>>;
};

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Appel d'une requête ; une erreur est préfixée du nom de la fonction (ex. `[reviews:listPositions]`). */
export async function callQuery<Q extends FunctionReference<"query">>(
  client: ConvexCaller,
  query: Q,
  args: FunctionArgs<Q>,
): Promise<FunctionReturnType<Q>> {
  try {
    return await client.query(query, args);
  } catch (error) {
    throw new Error(`[${getFunctionName(query)}] ${describe(error)}`);
  }
}

export async function callMutation<M extends FunctionReference<"mutation">>(
  client: ConvexCaller,
  mutation: M,
  args: FunctionArgs<M>,
): Promise<FunctionReturnType<M>> {
  try {
    return await client.mutation(mutation, args);
  } catch (error) {
    throw new Error(`[${getFunctionName(mutation)}] ${describe(error)}`);
  }
}

type Page<T> = { page: T[]; isDone: boolean; continueCursor: string };

/** Lit toutes les pages d'une requête paginée (`paginationOpts`). */
export async function fetchAllPages<T>(
  fetchPage: (paginationOpts: { numItems: number; cursor: string | null }) => Promise<Page<T>>,
  pageSize: number,
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | null = null;
  for (;;) {
    const result: Page<T> = await fetchPage({ numItems: pageSize, cursor });
    items.push(...result.page);
    if (result.isDone) return items;
    cursor = result.continueCursor;
  }
}

export function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}
