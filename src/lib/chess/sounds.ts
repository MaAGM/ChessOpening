export type SoundType =
  | "move"
  | "capture"
  | "castle"
  | "check"
  | "checkmate"
  | "select";

export const playSound = (type: SoundType) => {
  if (typeof window !== "undefined") {
    new Audio(`/sounds/${type}.mp3`).play().catch((e) => console.log("Audio play failed", e));
  }
};