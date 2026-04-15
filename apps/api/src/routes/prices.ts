import type { FastifyInstance } from "fastify";
import { getPricesPayload } from "../services/market-data.js";

export function registerPricesRoute(app: FastifyInstance) {
  app.get("/prices", async () => {
    return getPricesPayload();
  });
}
