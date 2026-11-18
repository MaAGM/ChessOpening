import * as reviewStore from "@/lib/review/reviewStore";
import type { StorageScope } from "@/lib/review/reviewStore";
import * as repertoireStore from "@/lib/repertoire/repertoireStore";
import { ReviewSyncEngine, type ReviewRemote } from "@/lib/review/reviewSync";
import { RepertoireSyncEngine, type RepertoireRemote } from "@/lib/repertoire/repertoireSync";
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
// Source de session : interface neutre (implémentée avec Convex + Better Auth)
// ===========================================================================

/**
 * Écoute de la session, indépendante du fournisseur d'authentification.
 *
 * `subscribe` appelle `listener` avec l'utilisateur connecté, ou null pour un invité : une
 * première fois dès que la session est connue, puis à chaque changement. La même valeur peut
 * être émise plusieurs fois (jeton rafraîchi, onglet revenu au premier plan) : le contrôleur
 * l'ignore. Renvoie la fonction de désabonnement.
 */
export type AuthSource = {
  subscribe(listener: (user: AuthUser | null) => void): () => void;
};

/** Tout ce qui dépend du backend : la session et l'accès au cloud des deux stores. */
export type SyncBackend = {
  authSource: AuthSource;
  reviewRemote: ReviewRemote;
  repertoireRemote: RepertoireRemote;
};

// ===========================================================================
// Contrôleur : réagit aux changements de session (testable, sans backend réel)
// ===========================================================================

export type AuthSyncDeps = {
  /** Source de session ; null si le backend n'est pas configuré (mode invité permanent). */
  source: AuthSource | null;
  /** Stores synchronisés (révisions, répertoires), traités en parallèle. */
  targets: SyncTarget[];
  setAuthState(patch: Partial<AuthState>): void;
};

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

  async function signInFlow(user: AuthUser): Promise<void> {
    activeUserId = user.id;
    deps.setAuthState({ status: "authenticated", user });
    await Promise.all(deps.targets.map((target) => target.signIn(user.id)));
  }

  async function signOutFlow(): Promise<void> {
    const userId = activeUserId;
    activeUserId = null;
    if (!userId) return;

    await Promise.all(deps.targets.map((target) => target.signOut(userId)));
    deps.setAuthState({ status: "guest", user: null });
  }

  async function handleUser(user: AuthUser | null): Promise<void> {
    if (user) {
      if (activeUserId === user.id) {
        deps.setAuthState({ status: "authenticated", user }); // profil éventuellement modifié
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

    if (!deps.source) {
      deps.setAuthState({ status: "guest", user: null });
      return;
    }

    unsubscribe = deps.source.subscribe((user) => {
      // Ne jamais appeler le backend directement dans ce callback (certains clients s'y
      // bloquent) : le traitement est différé puis mis en file.
      setTimeout(() => {
        void enqueue(() => handleUser(user));
      }, 0);
    });
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
    handleUser: (user: AuthUser | null) => enqueue(() => handleUser(user)),
  };
}

// ===========================================================================
// Branchement réel (navigateur)
// ===========================================================================
const REFRESH_MIN_INTERVAL_MS = 60_000;

let controller: ReturnType<typeof createAuthSyncController> | null = null;
let activeEngines: { flush(): Promise<boolean> }[] = [];

/**
 * Envoie immédiatement les changements en attente (à appeler AVANT de fermer la session :
 * ensuite, le cloud n'est plus joignable). Renvoie vrai si tout est synchronisé.
 */
export async function flushPendingSync(): Promise<boolean> {
  const results = await Promise.all(activeEngines.map((engine) => engine.flush()));
  return results.every(Boolean);
}

/**
 * Démarre l'authentification et la synchronisation (idempotent, navigateur uniquement).
 * `backend` est null quand le backend n'est pas configuré : l'application reste en mode invité.
 */
export function startAuthSync(backend: SyncBackend | null): void {
  if (typeof window === "undefined" || controller) return;

  if (!backend) {
    updateSyncStatus({ state: "disabled" });
    controller = createAuthSyncController({ source: null, targets: [], setAuthState });
    controller.start();
    return;
  }

  // Deux moteurs indépendants, chacun avec son canal d'état (combinés pour l'affichage).
  const reviewEngine = new ReviewSyncEngine({
    remote: backend.reviewRemote,
    getState: reviewStore.getSnapshot,
    applyRemoteState: reviewStore.applyRemoteState,
    setStatus: createSyncStatusChannel("review"),
    onGuestMigrated: reviewStore.clearGuestState,
  });
  const repertoireEngine = new RepertoireSyncEngine({
    remote: backend.repertoireRemote,
    getState: repertoireStore.getSnapshot,
    applyRemoteState: repertoireStore.applyRemoteState,
    setStatus: createSyncStatusChannel("repertoires"),
    onGuestMigrated: repertoireStore.clearGuestState,
  });
  const engines = [reviewEngine, repertoireEngine];
  activeEngines = engines;

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
    source: backend.authSource,
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
