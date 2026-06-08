import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { registerHealthRoute } from "./routes/health.js";
import { registerPricesRoute } from "./routes/prices.js";
import { registerOpportunitiesRoute } from "./routes/opportunities.js";
import { registerOpportunitiesStreamRoute } from "./routes/opportunities-stream.js";
import { registerSimulateRoute } from "./routes/simulate.js";
import { registerExecuteRoute } from "./routes/execute.js";
import { isAllowedOrigin } from "./lib/allowed-origins.js";

/**
 * Build and configure the Fastify application without starting the server.
 * Call app.listen() separately for local development (see server.ts).
 * For Vercel serverless, import this from api/index.ts instead.
 */
export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || isAllowedOrigin(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error("Origin not allowed"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  });

  app.get("/", async () => ({
    name: "ArbiNexus API",
    status: "ok",
    endpoints: ["/health", "/prices", "/opportunities", "/simulate", "/execute"]
  }));

  registerHealthRoute(app);
  registerPricesRoute(app);
  registerOpportunitiesRoute(app);
  registerOpportunitiesStreamRoute(app);
  registerSimulateRoute(app);
  registerExecuteRoute(app);

  return app;
}
