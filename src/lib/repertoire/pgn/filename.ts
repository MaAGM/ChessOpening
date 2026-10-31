/** Nom de fichier sûr à partir du nom d'un répertoire : « Mon 1.e4 : Sicilienne » devient « mon-1-e4-sicilienne ». */
export function slugifyFilename(name: string, fallback = "repertoire"): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug === "" ? fallback : slug;
}
