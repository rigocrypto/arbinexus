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
 * All plugins and routes are enqueued here; they are fully initialized
 * when app.ready() or app.listen() is called by the caller.
 *
 * - Local dev (server.ts): calls app.listen()
 * - Vercel serverless (api/index.ts): calls app.ready() then inject()s requests
 *
 * Uses Fastify v4 (CJS-native) — v5 is ESM-only and its import.meta.url usage
 * breaks Vercel's ncc bundler at runtime.
 */
export function buildApp() {
  // logger: false avoids Pino thread-stream worker_threads in serverless bundles.
  // Set LOG_LEVEL=info locally (in .env or shell) to re-enable.
  const app = Fastify({
    logger: process.env.LOG_LEVEL ? { level: process.env.LOG_LEVEL } : false,
  });

  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || isAllowedOrigin(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error("Origin not allowed"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  });

  app.get("/", async () => ({
    ok: true,
    service: "arbinexus-api",
    status: "running",
    endpoints: ["/health", "/prices", "/opportunities", "/simulate", "/execute"],
  }));

  registerHealthRoute(app);
  registerPricesRoute(app);
  registerOpportunitiesRoute(app);
  registerOpportunitiesStreamRoute(app);
  registerSimulateRoute(app);
  registerExecuteRoute(app);

  return app;
}
