import { isSupabaseConfigured } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export type AuthState = {
  /** loading : session pas encore lue ; guest : invité ; authenticated : connecté */
  status: "loading" | "guest" | "authenticated";
  user: AuthUser | null;
  /** Faux si les variables d'environnement Supabase manquent (mode invité permanent). */
  configured: boolean;
};

const SERVER_STATE: AuthState = Object.freeze({
  status: "loading",
  user: null,
  configured: false,
});

let state: AuthState = { status: "loading", user: null, configured: isSupabaseConfigured };
const listeners = new Set<() => void>();

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthState(): AuthState {
  return state;
}

export function getServerAuthState(): AuthState {
  return SERVER_STATE;
}

export function setAuthState(patch: Partial<AuthState>): void {
  const next = { ...state, ...patch };
  const sameUser =
    next.user === state.user ||
    (next.user !== null &&
      state.user !== null &&
      next.user.id === state.user.id &&
      next.user.email === state.user.email &&
      next.user.fullName === state.user.fullName &&
      next.user.avatarUrl === state.user.avatarUrl);

  if (next.status === state.status && next.configured === state.configured && sameUser) return;
  state = next;
  listeners.forEach((listener) => listener());
}
