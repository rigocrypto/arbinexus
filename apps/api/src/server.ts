import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { registerHealthRoute } from "./routes/health.js";
import { registerPricesRoute } from "./routes/prices.js";
import { registerOpportunitiesRoute } from "./routes/opportunities.js";
import { registerOpportunitiesStreamRoute } from "./routes/opportunities-stream.js";
import { registerSimulateRoute } from "./routes/simulate.js";
import { registerExecuteRoute } from "./routes/execute.js";

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

function isAllowedOrigin(origin: string) {
  const localhostOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  if (localhostOrigins.includes(origin)) {
    return true;
  }

  // Allow common private-network hosts for local multi-device testing.
  return /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)\d+\.\d+:3000$/i.test(origin);
}

async function bootstrap() {
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

  app.get("/", async () => {
    return {
      name: "ArbiNexus API",
      status: "ok",
      endpoints: ["/health", "/prices", "/opportunities", "/simulate", "/execute"]
    };
  });

  registerHealthRoute(app);
  registerPricesRoute(app);
  registerOpportunitiesRoute(app);
  registerOpportunitiesStreamRoute(app);
  registerSimulateRoute(app);
  registerExecuteRoute(app);

  await app.listen({ port, host });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
