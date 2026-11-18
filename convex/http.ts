import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Routes Better Auth (/api/auth/*), dont le retour OAuth Google.
authComponent.registerRoutes(http, createAuth);

export default http;
