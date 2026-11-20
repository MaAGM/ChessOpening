// À charger avec `node --import ./scripts/lib/register-src.mjs …` (voir src-resolver.mjs).
import { register } from "node:module";

register("./src-resolver.mjs", import.meta.url);
