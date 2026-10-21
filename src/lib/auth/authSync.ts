import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { createSupabaseReviewRemote } from "@/lib/supabase/reviewRemote";
import {
  applyRemoteState,
  clearGuestState,
  clearUserCache,
  getSnapshot,
  hasStateData,
  readGuestState,
  setStorageScope,
  subscribeToChanges,
  type ReviewStoreState,
  type StorageScope,
} from "@/lib/review/reviewStore";
import { ReviewSyncEngine } from "@/lib/review/reviewSync";
import { updateSyncStatus } from "@/lib/review/syncStatus";
import { setAuthState, type AuthState, type AuthUser } from "./authStore";

// ===========================================================================
// Contrôleur : réagit aux changements de session (testable, sans Supabase réel)
// ===========================================================================

export type SyncEnginePort = {
  attach(userId: string, guestState: ReviewStoreState | null): Promise<boolean>;
  detach(): Promise<boolean>;
};

export type AuthSyncDeps = {
  /** Client Supabase (seul `auth.onAuthStateChange` est utilisé) ; null si non configuré. */
  client: {
    auth: {
      onAuthStateChange(
        callback: (event: string, session: Session | null) => void,
      ): { data: { subscription: { unsubscribe(): void } } };
    };
  } | null;
  engine: SyncEnginePort;
  store: {
    setStorageScope(scope: StorageScope): void;
    readGuestState(): ReviewStoreState;
    clearUserCache(userId: string): void;
  };
  setAuthState(patch: Partial<AuthState>): void;
};

export function toAuthUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  const pick = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = meta[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
    return null;
  };
  return {
    id: user.id,
    email: user.email ?? null,
    fullName: pick("full_name", "name"),
    avatarUrl: pick("avatar_url", "picture"),
  };
}

/**
 * Orchestre le passage invité <-> connecté.
 *
 *  - connexion : lit les données d'invité, bascule sur le cache de l'utilisateur, puis le
 *    moteur fusionne cache + cloud + invité et pousse la différence (auto-migration) ;
 *  - déconnexion : dernier envoi, retour au mode invité, cache effacé seulement si tout
 *    était synchronisé (sinon il est conservé pour ne rien perdre).
 *
 * Les événements d'authentification sont traités un par un, et un événement répété
 * pour le même utilisateur (jeton rafraîchi, onglet revenu au premier plan) est sans effet.
 */
export function createAuthSyncController(deps: AuthSyncDeps) {
  let activeUserId: string | null = null;
  let started = false;
  let unsubscribe: (() => void) | null = null;
  let chain: Promise<void> = Promise.resolve();

  const enqueue = (task: () => Promise<void>): Promise<void> => {
    chain = chain.then(task).catch((error) => {
      console.error("[authSync]", error);
    });
    return chain;
  };

  async function signInFlow(user: User): Promise<void> {
    activeUserId = user.id;
    deps.setAuthState({ status: "authenticated", user: toAuthUser(user) });

    const guest = deps.store.readGuestState();
    deps.store.setStorageScope({ kind: "user", userId: user.id });
    await deps.engine.attach(user.id, hasStateData(guest) ? guest : null);
  }

  async function signOutFlow(): Promise<void> {
    const userId = activeUserId;
    activeUserId = null;
    if (!userId) return;

    const synced = await deps.engine.detach();
    deps.store.setStorageScope({ kind: "guest" });
    if (synced) deps.store.clearUserCache(userId);
    deps.setAuthState({ status: "guest", user: null });
  }

  async function handleSession(session: Session | null): Promise<void> {
    const user = session?.user ?? null;

    if (user) {
      if (activeUserId === user.id) {
        deps.setAuthState({ status: "authenticated", user: toAuthUser(user) });
        return;
      }
      if (activeUserId) await signOutFlow(); // changement direct d'utilisateur
      await signInFlow(user);
      return;
    }

    if (activeUserId) await signOutFlow();
    else deps.setAuthState({ status: "guest", user: null });
  }

  function start(): void {
    if (started) return;
    started = true;

    if (!deps.client) {
      deps.setAuthState({ status: "guest", user: null });
      return;
    }

    const { data } = deps.client.auth.onAuthStateChange((_event, session) => {
      // Ne jamais appeler Supabase directement dans ce callback (risque de blocage) :
      // le traitement est différé puis mis en file.
      setTimeout(() => {
        void enqueue(() => handleSession(session));
      }, 0);
    });
    unsubscribe = () => data.subscription.unsubscribe();
  }

  function stop(): void {
    unsubscribe?.();
    unsubscribe = null;
    started = false;
  }

  return {
    start,
    stop,
    /** Attend la fin des traitements en cours (utile aux tests). */
    idle: (): Promise<void> => chain,
    handleSession: (session: Session | null) => enqueue(() => handleSession(session)),
  };
}

// ===========================================================================
// Branchement réel (navigateur)
// ===========================================================================
const REFRESH_MIN_INTERVAL_MS = 60_000;

let controller: ReturnType<typeof createAuthSyncController> | null = null;

/** Démarre l'authentification et la synchronisation (idempotent, navigateur uniquement). */
export function startAuthSync(): void {
  if (typeof window === "undefined" || controller) return;

  const client = getSupabaseClient();
  if (!client) {
    updateSyncStatus({ state: "disabled" });
    controller = createAuthSyncController({
      client: null,
      engine: { attach: async () => false, detach: async () => false },
      store: { setStorageScope, readGuestState, clearUserCache },
      setAuthState,
    });
    controller.start();
    return;
  }

  const engine = new ReviewSyncEngine({
    remote: createSupabaseReviewRemote(client),
    getState: getSnapshot,
    applyRemoteState,
    setStatus: updateSyncStatus,
    onGuestMigrated: clearGuestState,
  });

  // Chaque action locale est envoyée au cloud ; les changements venus du cloud
  // ou d'un autre onglet ne sont pas renvoyés.
  subscribeToChanges((_prev, _next, source) => {
    if (source === "local") engine.notifyLocalChange();
  });

  window.addEventListener("online", () => engine.handleOnline());

  let lastRefresh = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void engine.flush(); // dernier envoi avant de quitter l'onglet
    } else if (Date.now() - lastRefresh > REFRESH_MIN_INTERVAL_MS) {
      lastRefresh = Date.now();
      void engine.refresh(); // récupère les progrès faits sur un autre appareil
    }
  });

  controller = createAuthSyncController({
    client,
    engine,
    store: { setStorageScope, readGuestState, clearUserCache },
    setAuthState,
  });
  controller.start();
}
