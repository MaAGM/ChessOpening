"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { COACH_CHAT_MAX_MESSAGE_LENGTH, type CoachChatMessage, type CoachPositionSnapshot } from "@/lib/coach/chatProtocol";
import { trimHistory } from "@/lib/coach/chatSnapshot";
import type { CoachChatBackend } from "@/lib/convex/coachRemote";

export type CoachChatEntry = CoachChatMessage & { id: number };

export type CoachChatNotice = { kind: "quota" | "error"; text: string };

export type UseCoachChatParams = {
  /** Serveur du Coach ; null pour un invité (aucun envoi possible). */
  backend: CoachChatBackend | null;
  /** Instantané de ce que le joueur voit, lu au moment de l'envoi. */
  getSnapshot: () => CoachPositionSnapshot;
};

const SERVER_ERROR = "Le Coach est momentanément indisponible. Réessaie dans un instant.";

/** « dans 45 s », « dans 3 min », « dans 2 h ». */
export function formatRetryDelay(ms: number): string {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  if (seconds < 60) return `dans ${seconds} s`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `dans ${minutes} min`;
  return `dans ${Math.ceil(minutes / 60)} h`;
}

export function quotaMessage(scope: "user" | "global" | "budget", retryAfterMs: number): string {
  const when = formatRetryDelay(retryAfterMs);
  switch (scope) {
    case "global":
      return `Le Coach a beaucoup parlé aujourd'hui. Il sera de nouveau disponible ${when}.`;
    case "budget":
      return `Tu as atteint ta limite d'échanges pour aujourd'hui. Reviens ${when}.`;
    default:
      return `Doucement ! Tu pourras reposer une question ${when}.`;
  }
}

/**
 * Discussion avec le Coach. La conversation vit en mémoire (rien n'est enregistré) ;
 * une seule question part à la fois, et une réponse arrivée après « Nouvelle
 * discussion » est ignorée. Une question qui échoue est retirée du fil et rendue à
 * l'appelant (`send` renvoie `false`) pour qu'il la remette dans le champ de saisie.
 */
export function useCoachChat({ backend, getSnapshot }: UseCoachChatParams) {
  const [messages, setMessages] = useState<CoachChatEntry[]>([]);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<CoachChatNotice | null>(null);
  const [remaining, setRemaining] = useState<{ remaining: number; limit: number } | null>(null);

  const messagesRef = useRef(messages);
  const pendingRef = useRef(false);
  const generationRef = useRef(0);
  const nextIdRef = useRef(1);
  const getSnapshotRef = useRef(getSnapshot);
  useEffect(() => {
    messagesRef.current = messages;
    getSnapshotRef.current = getSnapshot;
  });

  useEffect(() => {
    if (!backend) return;
    let active = true;
    backend
      .remaining()
      .then((value) => {
        if (active && value) setRemaining(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [backend]);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      const content = text.trim();
      if (!backend || pendingRef.current) return false;
      if (content.length === 0 || content.length > COACH_CHAT_MAX_MESSAGE_LENGTH) return false;

      const snapshot = getSnapshotRef.current();
      const question: CoachChatEntry = { id: nextIdRef.current++, role: "user", content, moves: snapshot.moves };
      const history = [...messagesRef.current, question];
      const generation = generationRef.current;

      pendingRef.current = true;
      setPending(true);
      setNotice(null);
      setMessages(history);
      messagesRef.current = history;

      const drop = () => {
        const without = messagesRef.current.filter((m) => m.id !== question.id);
        messagesRef.current = without;
        setMessages(without);
      };

      try {
        const payload = trimHistory(history.map(({ role, content: body, moves }) => ({ role, content: body, ...(moves ? { moves } : {}) })));
        const result = await backend.send(payload, snapshot);
        if (generation !== generationRef.current) return true;

        if (result.status === "ok") {
          const reply: CoachChatEntry = { id: nextIdRef.current++, role: "assistant", content: result.text };
          const next = [...messagesRef.current, reply];
          messagesRef.current = next;
          setMessages(next);
          setRemaining((current) => ({ remaining: result.remaining, limit: current?.limit ?? result.remaining + 1 }));
          return true;
        }
        drop();
        setNotice(
          result.status === "quota"
            ? { kind: "quota", text: quotaMessage(result.scope, result.retryAfterMs) }
            : { kind: "error", text: result.message },
        );
        if (result.status === "quota" && result.scope === "user") {
          setRemaining((current) => (current ? { ...current, remaining: 0 } : current));
        }
        return false;
      } catch {
        if (generation !== generationRef.current) return true;
        drop();
        setNotice({ kind: "error", text: SERVER_ERROR });
        return false;
      } finally {
        if (generation === generationRef.current) {
          pendingRef.current = false;
          setPending(false);
        }
      }
    },
    [backend],
  );

  const reset = useCallback(() => {
    generationRef.current += 1;
    pendingRef.current = false;
    messagesRef.current = [];
    setMessages([]);
    setPending(false);
    setNotice(null);
  }, []);

  return { messages, pending, notice, remaining, canSend: backend !== null && !pending, send, reset };
}

export type CoachChat = ReturnType<typeof useCoachChat>;
