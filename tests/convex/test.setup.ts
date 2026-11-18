/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import schema from "../../convex/schema";

/** Modules Convex chargés par convex-test (les tests vivent hors de convex/ : ils ne sont pas déployés). */
export const modules = import.meta.glob("../../convex/**/*.ts");

/** Instance de test et deux utilisateurs isolés l'un de l'autre. */
export function setup() {
  const t = convexTest(schema, modules);
  // Composant des quotas du Coach (convex.config.ts)
  rateLimiterTest.register(t);
  return {
    t,
    alice: t.withIdentity({ subject: "user-alice", name: "Alice" }),
    bob: t.withIdentity({ subject: "user-bob", name: "Bob" }),
  };
}
