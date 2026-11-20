// Génère l'index léger du catalogue Masterclass (src/lib/data/openings/courses/index.json).
//
// Chaque ouverture vit dans son propre fichier JSON (chargé à la demande avec import()).
// L'index ne garde que ce dont l'interface a besoin sans charger les cours : titres,
// camp, chapitres et identifiants des leçons (avec leurs anciens identifiants, pour la
// migration de la progression). Il ne contient aucun PGN.
//
// À relancer après toute modification d'un fichier de cours :  npm run courses:index
// (le test `catalog.test.ts` échoue tant que l'index n'est pas à jour).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "data", "openings", "courses");
const order = JSON.parse(fs.readFileSync(path.join(dir, "order.json"), "utf8"));

const courses = order.map((id) => {
  const course = JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8"));
  if (course.id !== id) throw new Error(`${id}.json : identifiant « ${course.id} » inattendu.`);
  return {
    id: course.id,
    name: course.name,
    description: course.description,
    side: course.side,
    eco: course.eco,
    chapters: course.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      summary: chapter.summary,
      stage: chapter.stage,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        legacyIds: lesson.legacyIds ?? [],
      })),
    })),
  };
});

fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify({ version: 1, courses }, null, 2) + "\n");
console.log(`Index du catalogue : ${courses.length} ouvertures.`);
