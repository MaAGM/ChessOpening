import type { Lesson, TutorialNode } from "@/lib/data/openings/types";
import type { Side } from "@/lib/review/types";
import { createNodeId } from "./repertoireTree";
import type { RepertoireDraft, RepertoireNode, TreeRoot } from "./types";

/**
 * Arbre de coups au format attendu par `buildReviewGraph` : un répertoire alimente
 * le moteur de révision exactement comme un chapitre Masterclass.
 */
export function toTutorialRoot(root: TreeRoot): TutorialNode {
  const convert = (node: RepertoireNode): TutorialNode => ({
    move: node.san,
    ...(node.comment ? { explanation: node.comment } : {}),
    ...(node.arrows ? { arrows: node.arrows } : {}),
    children: convertAll(node.children),
  });
  const convertAll = (nodes: RepertoireNode[]): Record<string, TutorialNode> =>
    Object.fromEntries(nodes.map((node) => [node.san, convert(node)]));

  return { children: convertAll(root.children) };
}

/** Arbre d'un chapitre Masterclass vers l'arbre d'un répertoire (explications → commentaires). */
export function fromTutorialRoot(
  root: TutorialNode,
  idFactory: (taken: ReadonlySet<string>) => string = createNodeId,
): TreeRoot {
  const taken = new Set<string>();

  const convertAll = (children: Record<string, TutorialNode> | undefined): RepertoireNode[] =>
    Object.entries(children ?? {}).map(([san, node]) => {
      const id = idFactory(taken);
      taken.add(id);
      return {
        id,
        san,
        ...(node.explanation ? { comment: node.explanation } : {}),
        ...(node.arrows && node.arrows.length > 0 ? { arrows: node.arrows } : {}),
        children: convertAll(node.children),
      };
    });

  return { children: convertAll(root.children) };
}

/** Brouillon de répertoire à partir d'un cours Masterclass (copie dans « mes répertoires »). */
export function repertoireFromLesson(
  lesson: Pick<Lesson, "title" | "side" | "root">,
  course: { name: string; side: Side },
): RepertoireDraft {
  return {
    name: lesson.title,
    side: lesson.side ?? course.side,
    category: course.name,
    reviewEnabled: true,
    children: fromTutorialRoot(lesson.root).children,
    origin: { kind: "custom" },
  };
}
