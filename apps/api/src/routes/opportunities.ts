import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getOpportunitiesPayload } from "../services/market-data.js";

const symbolParamsSchema = z.object({
  symbol: z.string().min(3)
});

export function registerOpportunitiesRoute(app: FastifyInstance) {
  app.get("/opportunities", async () => {
    return getOpportunitiesPayload();
  });

  app.get("/opportunities/:symbol", async (request, reply) => {
    const parsed = symbolParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid symbol" });
    }

    const opportunities = await getOpportunitiesPayload();
    const found = opportunities.items.find((row) => row.symbol.toLowerCase() === parsed.data.symbol.toLowerCase());
    if (!found) {
      return reply.status(404).send({ error: "Opportunity not found" });
    }

    return found;
  });
}
