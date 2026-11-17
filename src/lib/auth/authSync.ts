import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { createSupabaseReviewRemote } from "@/lib/supabase/reviewRemote";
import { createSupabaseRepertoireRemote } from "@/lib/supabase/repertoireRemote";
import * as reviewStore from "@/lib/review/reviewStore";
import type { StorageScope } from "@/lib/review/reviewStore";
import * as repertoireStore from "@/lib/repertoire/repertoireStore";
import { ReviewSyncEngine } from "@/lib/review/reviewSync";
import { RepertoireSyncEngine } from "@/lib/repertoire/repertoireSync";
import { createSyncStatusChannel, updateSyncStatus } from "@/lib/review/syncStatus";
import { setAuthState, type AuthState, type AuthUser } from "./authStore";

// ===========================================================================
// Cibles de synchronisation : un store à périmètre + son moteur
// ===========================================================================

export type SyncEnginePort<S> = {
  attach(userId: string, guestState: S | null): Promise<boolean>;
  detach(): Promise<boolean>;
};

/** Ce que le contrôleur utilise d'un store qui a un périmètre invité / utilisateur. */
export type ScopedStorePort<S> = {
  setStorageScope(scope: StorageScope): void;
  readGuestState(): S;
  clearUserCache(userId: string): void;
  /** Vrai si les données d'invité méritent d'être migrées vers le compte. */
  hasData(state: S): boolean;
};

/**
 * Une cible = un store et son moteur, avec leur propre cycle de vie. Le contrôleur ne
 * connaît que cette interface : les révisions et les répertoires ne partagent rien.
 */
export type SyncTarget = {
  signIn(userId: string): Promise<void>;
  signOut(userId: string): Promise<void>;
};

export function createSyncTarget<S>(store: ScopedStorePort<S>, engine: SyncEnginePort<S>): SyncTarget {
  return {
    async signIn(userId) {
      // Les données d'invité sont lues AVANT de basculer sur le cache de l'utilisateur.
      const guest = store.readGuestState();
      store.setStorageScope({ kind: "user", userId });
      await engine.attach(userId, store.hasData(guest) ? guest : null);
    },
    async signOut(userId) {
      const synced = await engine.detach();
      store.setStorageScope({ kind: "guest" });
      if (synced) store.clearUserCache(userId);
    },
  };
}

// ===========================================================================
// Contrôleur : réagit aux changements de session (testable, sans Supabase réel)
// ===========================================================================

export type AuthSyncDeps = {
  /** Client Supabase (seul `auth.onAuthStateChange` est utilisé) ; null si non configuré. */
  client: {
    auth: {
      onAuthStateChange(
        callback: (event: string, session: Session | null) => void,
      ): { data: { subscription: { unsubscribe(): void } } };
    };
  } | null;
  /** Stores synchronisés (révisions, répertoires), traités en parallèle. */
  targets: SyncTarget[];
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
 * Orchestre le passage invité <-> connecté, pour chaque cible.
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
    await Promise.all(deps.targets.map((target) => target.signIn(user.id)));
  }

  async function signOutFlow(): Promise<void> {
    const userId = activeUserId;
    activeUserId = null;
    if (!userId) return;

    await Promise.all(deps.targets.map((target) => target.signOut(userId)));
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
    controller = createAuthSyncController({ client: null, targets: [], setAuthState });
    controller.start();
    return;
  }

  // Deux moteurs indépendants, chacun avec son canal d'état (combinés pour l'affichage).
  const reviewEngine = new ReviewSyncEngine({
    remote: createSupabaseReviewRemote(client),
    getState: reviewStore.getSnapshot,
    applyRemoteState: reviewStore.applyRemoteState,
    setStatus: createSyncStatusChannel("review"),
    onGuestMigrated: reviewStore.clearGuestState,
  });
  const repertoireEngine = new RepertoireSyncEngine({
    remote: createSupabaseRepertoireRemote(client),
    getState: repertoireStore.getSnapshot,
    applyRemoteState: repertoireStore.applyRemoteState,
    setStatus: createSyncStatusChannel("repertoires"),
    onGuestMigrated: repertoireStore.clearGuestState,
  });
  const engines = [reviewEngine, repertoireEngine];

  // Chaque action locale est envoyée au cloud ; les changements venus du cloud
  // ou d'un autre onglet ne sont pas renvoyés.
  reviewStore.subscribeToChanges((_prev, _next, source) => {
    if (source === "local") reviewEngine.notifyLocalChange();
  });
  repertoireStore.subscribeToChanges((_prev, _next, source) => {
    if (source === "local") repertoireEngine.notifyLocalChange();
  });

  window.addEventListener("online", () => engines.forEach((engine) => engine.handleOnline()));

  let lastRefresh = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      engines.forEach((engine) => void engine.flush()); // dernier envoi avant de quitter l'onglet
    } else if (Date.now() - lastRefresh > REFRESH_MIN_INTERVAL_MS) {
      lastRefresh = Date.now();
      engines.forEach((engine) => void engine.refresh()); // progrès faits sur un autre appareil
    }
  });

  controller = createAuthSyncController({
    client,
    targets: [
      createSyncTarget(
        {
          setStorageScope: reviewStore.setStorageScope,
          readGuestState: reviewStore.readGuestState,
          clearUserCache: reviewStore.clearUserCache,
          hasData: reviewStore.hasStateData,
        },
        reviewEngine,
      ),
      createSyncTarget(
        {
          setStorageScope: repertoireStore.setStorageScope,
          readGuestState: repertoireStore.readGuestState,
          clearUserCache: repertoireStore.clearUserCache,
          hasData: repertoireStore.hasRepertoireData,
        },
        repertoireEngine,
      ),
    ],
    setAuthState,
  });
  controller.start();
}
