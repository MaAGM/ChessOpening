import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Client Better Auth. Les appels passent par la route Next.js `/api/auth/*`
 * (src/app/api/auth/[...all]/route.ts), qui les relaie au déploiement Convex :
 * les cookies de session restent sur le domaine de l'application.
 */
export const authClient = createAuthClient({
  plugins: [convexClient()],
});
