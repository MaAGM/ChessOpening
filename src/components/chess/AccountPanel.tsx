"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSyncStatus } from "@/hooks/useSyncStatus";

const SYNC_LABELS = {
  disabled: "Non synchronisé",
  idle: "Synchronisé",
  syncing: "Synchronisation…",
  error: "Erreur — nouvelle tentative en cours",
  offline: "Hors ligne — synchronisation en attente",
} as const;

const SYNC_DOT = {
  disabled: "bg-slate-500",
  idle: "bg-emerald-400",
  syncing: "bg-sky-400",
  error: "bg-rose-400",
  offline: "bg-amber-400",
} as const;

/** Compte et synchronisation : connexion par lien e-mail ou Google, état de la synchro. */
export function AccountPanel() {
  const { status, user, configured, signInWithMagicLink, signInWithGoogle, signOut } = useAuth();
  const sync = useSyncStatus();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  if (!configured) {
    return (
      <p className="text-center text-xs text-slate-500">
        Mode invité : la progression reste sur cet appareil.
      </p>
    );
  }

  if (status === "loading") {
    return <p className="text-center text-xs text-slate-500">Chargement du compte…</p>;
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-slate-600 bg-slate-800/70 p-3 text-sm">
        <div className="flex items-center gap-2">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-slate-100">
              {(user.fullName ?? user.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <p className="min-w-0 flex-1 truncate text-slate-100">{user.fullName ?? user.email}</p>
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${SYNC_DOT[sync.state]}`} />
          {SYNC_LABELS[sync.state]}
        </p>

        <button
          type="button"
          onClick={() => void signOut()}
          className="w-fit text-xs text-slate-400 underline transition hover:text-slate-200"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  // Invité
  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setMessage(null);
    const { error } = await signInWithMagicLink(email);
    setBusy(false);
    setMessage(
      error
        ? { kind: "error", text: error }
        : { kind: "ok", text: "Lien envoyé : consultez votre boîte mail." },
    );
  };

  const handleGoogle = async () => {
    setBusy(true);
    setMessage(null);
    const { error } = await signInWithGoogle(); // redirige vers Google en cas de succès
    if (error) {
      setBusy(false);
      setMessage({ kind: "error", text: error });
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-600 bg-slate-800/70 p-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-left font-semibold text-slate-200"
      >
        {open ? "Fermer" : "Se connecter pour sauvegarder ma progression"}
      </button>

      {open && (
        <>
          <p className="text-xs text-slate-400">
            Votre progression actuelle sera automatiquement transférée vers votre compte.
          </p>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@exemple.com"
            autoComplete="email"
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={() => void handleMagicLink()}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Recevoir un lien de connexion
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGoogle()}
            className="rounded-lg border border-slate-500 bg-slate-700/50 px-3 py-2 font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuer avec Google
          </button>

          {message && (
            <p className={message.kind === "ok" ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
              {message.text}
            </p>
          )}
        </>
      )}
    </div>
  );
}
