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

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: ["http://localhost:3000"],
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
