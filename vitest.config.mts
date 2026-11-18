import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Le tsconfig de Next utilise « jsx: preserve » : il faut dire à Vitest de compiler le JSX
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/convex/**/*.test.ts"],
    // convex-test doit être transformé par Vitest (import.meta.glob des modules Convex)
    server: { deps: { inline: ["convex-test"] } },
  },
});
