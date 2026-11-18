import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Le tsconfig de Next utilise « jsx: preserve » : il faut dire à Vitest de compiler le JSX
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/convex/**/*.test.ts"],
    // convex-test et les composants testés (sources .ts, import.meta.glob) doivent être transformés par Vitest (import.meta.glob des modules Convex)
    server: { deps: { inline: ["convex-test", "@convex-dev/rate-limiter", "@convex-dev/batch-worker"] } },
  },
});
