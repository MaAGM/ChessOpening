"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import type { CoachChat as CoachChatState, CoachChatEntry } from "@/hooks/useCoachChat";
import { COACH_CHAT_MAX_MESSAGE_LENGTH, formatMoveSequence } from "@/lib/coach/chatProtocol";

/** Situation du joueur vis-à-vis du Coach (réservé aux comptes connectés). */
export type CoachAccess = "unconfigured" | "loading" | "guest" | "authenticated";

type CoachChatProps = {
  chat: CoachChatState;
  access: CoachAccess;
  onSignIn: () => void;
  /** Questions proposées pour la position affichée. */
  suggestions: string[];
};

function samePosition(a?: string[], b?: string[]): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((san, i) => san === b[i]);
}

function positionLabel(moves?: string[]): string {
  return moves && moves.length > 0 ? formatMoveSequence(moves) : "Position initiale";
}

/** Fil de discussion : une pastille « Position » s'insère quand l'échiquier a changé. */
function Thread({ messages }: { messages: CoachChatEntry[] }) {
  let lastMoves: string[] | undefined;
  return (
    <>
      {messages.map((message) => {
        const showPosition = message.role === "user" && !samePosition(lastMoves, message.moves);
        if (message.role === "user") lastMoves = message.moves;
        return (
          <div key={message.id} className="flex flex-col gap-2">
            {showPosition && (
              <p className="self-center rounded-full border border-slate-700 bg-slate-900/60 px-3 py-0.5 text-[11px] text-slate-400">
                ♟ {positionLabel(message.moves)}
              </p>
            )}
            <p
              className={
                message.role === "user"
                  ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[#D4AF37]/20 px-3 py-2 text-sm text-slate-100"
                  : "max-w-[90%] self-start whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-slate-700/60 px-3 py-2 text-sm leading-relaxed text-slate-100"
              }
            >
              {message.content}
            </p>
          </div>
        );
      })}
    </>
  );
}

function LockedState({ access, onSignIn }: { access: Exclude<CoachAccess, "authenticated">; onSignIn: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm text-slate-300">
        {access === "unconfigured"
          ? "Le Coach n'est pas disponible sur cette installation."
          : access === "loading"
            ? "Connexion en cours…"
            : "Connecte-toi pour discuter de la position avec ton Coach."}
      </p>
      {access === "guest" && (
        <Button variant="primary" onClick={onSignIn} className="px-4 py-2 text-sm">
          Se connecter avec Google
        </Button>
      )}
    </div>
  );
}

/** Chat avec le Coach : il voit la position, les coups, l'explorateur et Stockfish. */
export function CoachChat({ chat, access, onSignIn, suggestions }: CoachChatProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, pending, notice, remaining, canSend, send, reset } = chat;

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, pending]);

  const submit = async (text: string) => {
    const question = text.trim();
    if (!question || !canSend) return;
    setDraft("");
    const ok = await send(question);
    if (!ok) setDraft(question);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit(draft);
    }
  };

  const exhausted = remaining !== null && remaining.remaining <= 0;
  const disabled = !canSend || exhausted;

  return (
    <section className="flex h-full min-h-0 flex-col" aria-labelledby="coach-chat-title">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 id="coach-chat-title" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Coach
        </h2>
        {access === "authenticated" && (
          <div className="flex items-center gap-3">
            {remaining && (
              <span
                className={`text-xs tabular-nums ${exhausted ? "text-rose-300" : "text-slate-500"}`}
                title="Messages restants sur 24 heures"
              >
                {remaining.remaining}/{remaining.limit}
              </span>
            )}
            {messages.length > 0 && (
              <Button variant="link" onClick={reset}>
                Nouvelle discussion
              </Button>
            )}
          </div>
        )}
      </header>

      {access !== "authenticated" ? (
        <LockedState access={access} onSignIn={onSignIn} />
      ) : (
        <>
          <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1" aria-live="polite">
            {messages.length === 0 && (
              <p className="mt-2 text-sm text-slate-400">
                Joue des coups, puis demande-moi ce que tu veux sur la position : je vois l&apos;échiquier, les
                parties des maîtres et l&apos;analyse.
              </p>
            )}
            <Thread messages={messages} />
            {pending && (
              <p className="self-start rounded-2xl rounded-bl-sm bg-slate-700/40 px-3 py-2 text-sm italic text-slate-400">
                Le Coach réfléchit…
              </p>
            )}
          </div>

          {notice && (
            <Callout
              tone={notice.kind === "quota" ? "warning" : "danger"}
              as="p"
              className={`mt-2 px-3 py-2 text-xs ${notice.kind === "quota" ? "text-amber-200" : "text-rose-200"}`}
            >
              {notice.text}
            </Callout>
          )}

          {messages.length === 0 && !pending && suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={disabled}
                  onClick={() => void submit(suggestion)}
                  className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-300 transition hover:border-[#D4AF37]/60 hover:text-[#D4AF37] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="mt-2 flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(draft);
            }}
          >
            <label className="sr-only" htmlFor="coach-chat-input">
              Ta question au Coach
            </label>
            <textarea
              id="coach-chat-input"
              rows={2}
              value={draft}
              maxLength={COACH_CHAT_MAX_MESSAGE_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              disabled={exhausted}
              placeholder={exhausted ? "Plus de messages pour aujourd'hui." : "Pose ta question…"}
              className="min-h-10 flex-1 resize-none rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#D4AF37]/60 focus:outline-none disabled:opacity-60"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={disabled || draft.trim().length === 0}
              className="px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Envoyer
            </Button>
          </form>
          {draft.length > COACH_CHAT_MAX_MESSAGE_LENGTH - 100 && (
            <p className="mt-1 text-right text-[11px] tabular-nums text-slate-500">
              {draft.length}/{COACH_CHAT_MAX_MESSAGE_LENGTH}
            </p>
          )}
        </>
      )}
    </section>
  );
}
