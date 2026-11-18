import type { AuthSource } from "@/lib/auth/authSync";
import type { AuthUser } from "@/lib/auth/authStore";

/**
 * Source de session alimentée « par poussée » : un composant React (ConvexAuthBridge) lit
 * l'état d'authentification Convex et appelle `publish`. Le contrôleur `authSync` s'abonne
 * sans dépendre de React.
 *
 * Tant que rien n'a été publié, la session est inconnue (chargement) : rien n'est émis.
 * Un abonné tardif reçoit immédiatement la dernière valeur publiée.
 */
export function createPushAuthSource() {
  let known = false;
  let current: AuthUser | null = null;
  const listeners = new Set<(user: AuthUser | null) => void>();

  const source: AuthSource = {
    subscribe(listener) {
      listeners.add(listener);
      if (known) listener(current);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  function publish(user: AuthUser | null): void {
    known = true;
    current = user;
    listeners.forEach((listener) => listener(user));
  }

  return { source, publish };
}

/** Source partagée par le pont React et la synchronisation. */
export const convexAuthSource = createPushAuthSource();
