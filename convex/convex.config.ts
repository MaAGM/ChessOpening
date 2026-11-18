import { defineApp } from "convex/server";
import { v } from "convex/values";
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp({
  env: {
    /** Clé de l'API Claude (Coach IA) : `npx convex env set ANTHROPIC_API_KEY …`. Jamais côté client. */
    ANTHROPIC_API_KEY: v.optional(v.string()),
    /** Modèle du Coach (facultatif) ; défaut : claude-haiku-5-5. */
    COACH_MODEL: v.optional(v.string()),
  },
});
app.use(betterAuth);
/** Quotas du Coach IA par utilisateur (voir convex/coach.ts). */
app.use(rateLimiter);

export default app;
