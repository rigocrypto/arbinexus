import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ExecuteResponse } from "@arbinexus/types";

const executeSchema = z.object({
  symbol: z.string().min(2),
  side: z.enum(["buy_underpriced", "sell_overpriced"]),
  amountUsd: z.number().positive(),
  slippageBps: z.number().min(1).max(500),
  walletPublicKey: z.string().min(32)
});

export function registerExecuteRoute(app: FastifyInstance) {
  app.post("/execute", async (request, reply) => {
    const parsed = executeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const response: ExecuteResponse = {
      txSignature: "simulated-" + Math.random().toString(36).slice(2),
      status: "simulated",
      message: `Execution queued in hackathon-safe simulation mode for ${parsed.data.symbol.toUpperCase()}.`
    };

    return response;
  });
}
