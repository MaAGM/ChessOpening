import { getFunctionName } from "convex/server";
import { describe, expect, it, vi } from "vitest";
import { createCoachExplainer, type ConvexActionCaller } from "./coachRemote";

describe("createCoachExplainer", () => {
  it("appelle coach:explain avec le seul prompt (jamais l'utilisateur)", async () => {
    const action = vi.fn(async () => ({ status: "ok", text: "Explication.", cached: false }));
    const explain = createCoachExplainer({ action } as unknown as ConvexActionCaller);

    expect(await explain("# Écart")).toEqual({ status: "ok", text: "Explication.", cached: false });
    const [ref, args] = action.mock.calls[0] as unknown as [Parameters<typeof getFunctionName>[0], unknown];
    expect(getFunctionName(ref)).toBe("coach:explain");
    expect(args).toEqual({ prompt: "# Écart" });
  });
});
