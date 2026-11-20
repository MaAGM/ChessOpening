// Crochet de résolution Node : permet aux scripts d'auteur d'importer directement le code
// TypeScript de `src/` (alias `@/`, imports sans extension). Node retire lui-même les types
// (« type stripping », Node ≥ 22.18). Utilisé uniquement par les scripts, jamais par l'appli.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = new URL("../../src/", import.meta.url);

const isFile = (url) => {
  try {
    return statSync(fileURLToPath(url)).isFile();
  } catch {
    return false;
  }
};

export async function resolve(specifier, context, nextResolve) {
  const fromTs = context.parentURL?.endsWith(".ts");
  const aliased = specifier.startsWith("@/");
  const relative = specifier.startsWith("./") || specifier.startsWith("../");

  if (aliased || (fromTs && relative)) {
    const base = aliased ? new URL(specifier.slice(2), SRC) : new URL(specifier, context.parentURL);
    for (const suffix of ["", ".ts", "/index.ts"]) {
      const candidate = new URL(base.href + suffix);
      if (isFile(candidate)) return nextResolve(candidate.href, context);
    }
    if (existsSync(fileURLToPath(base))) return nextResolve(base.href, context);
  }
  return nextResolve(specifier, context);
}

/** Les fichiers de `src/` sont des modules ES TypeScript (le package.json n'a pas de "type"). */
export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && url.endsWith(".ts")) {
    return nextLoad(url, { ...context, format: "module-typescript" });
  }
  return nextLoad(url, context);
}
