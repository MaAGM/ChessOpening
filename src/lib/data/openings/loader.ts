import blueprintData from "./eco-blueprints.json";
import { buildTreeFromMoves, type Annotation } from "@/lib/utils/openingParser";
import type { OpeningCourse } from "./types";

interface RawChapter {
  id: string;
  name: string;
  side?: "white" | "black";
  moves: string;
  comments?: Annotation[];
  annotations?: Annotation[];
}

interface RawCourse {
  id: string;
  name: string;
  description: string;
  side?: "white" | "black";
  chapters: RawChapter[];
}

export function loadOpeningCourse(courseId: string): OpeningCourse {
  const data = blueprintData as unknown as { courses?: RawCourse[] } | RawCourse[];
  const coursesList: RawCourse[] = Array.isArray(data) ? data : data.courses ?? [];
  const rawCourse = coursesList.find((c) => c.id === courseId);

  if (!rawCourse) {
    throw new Error(`[Loader] Cours introuvable pour l'ID : "${courseId}" dans eco-blueprints.json`);
  }

  // On récupère le camp depuis le JSON, ou "white" par défaut
  const courseSide = rawCourse.side ?? "white";

  const chapters = rawCourse.chapters.map((chap) => {
    // Un chapitre spécifique peut surcharger la couleur du cours (optionnel)
    const chapterSide = chap.side ?? courseSide;
    const isBlackRepertoire = chapterSide === "black";

    return {
      id: chap.id,
      name: chap.name,
      side: chapterSide,
      root: buildTreeFromMoves(
        [chap.moves], 
        chap.comments ?? chap.annotations ?? [],
        isBlackRepertoire // <-- On passe le booléen calculé à partir du JSON !
      ),
    };
  });

  return {
    id: rawCourse.id,
    name: rawCourse.name,
    description: rawCourse.description,
    side: courseSide, // On ajoute le side au niveau du cours
    chapters,
  };
}