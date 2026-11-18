import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

/**
 * Authentification Better Auth (OAuth Google), stockée dans le composant Convex.
 *
 * Variables d'environnement du déploiement Convex (`npx convex env set …`) :
 *  - BETTER_AUTH_SECRET   : secret aléatoire (signature des sessions)
 *  - SITE_URL             : origine de l'application Next.js (ex. http://localhost:3000)
 *  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET : identifiants OAuth Google
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [convex({ authConfig })],
  });

/** Profil de l'utilisateur connecté (null pour un invité). */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    return {
      id: user._id as string,
      email: user.email ?? null,
      fullName: user.name || null,
      avatarUrl: user.image ?? null,
    };
  },
});
