import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { SimulateResponse } from "@arbinexus/types";
import { getOpportunitiesPayload } from "../services/market-data.js";

const simulateSchema = z.object({
  symbol: z.string().min(2),
  side: z.enum(["buy_underpriced", "sell_overpriced"]).optional().default("buy_underpriced"),
  amountUsd: z.number().positive().optional().default(1000),
  slippageBps: z.number().min(1).max(500).optional().default(50)
});

export function registerSimulateRoute(app: FastifyInstance) {
  app.post("/simulate", async (request, reply) => {
    const parsed = simulateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const opportunities = await getOpportunitiesPayload();
    const target = opportunities.items.find((row) => row.symbol.toLowerCase() === parsed.data.symbol.toLowerCase());
    if (!target) {
      return reply.status(404).send({ error: "Symbol not found in current opportunity set" });
    }

    const spreadPct = target.spreadPct;
    const feePct = target.estimatedFeesPct;
    const netPct = target.estimatedNetPct;

    const gross = (spreadPct / 100) * parsed.data.amountUsd;
    const fee = (feePct / 100) * parsed.data.amountUsd;
    const net = (netPct / 100) * parsed.data.amountUsd;

    const response: SimulateResponse = {
      symbol: parsed.data.symbol.toUpperCase(),
      amountUsd: parsed.data.amountUsd,
      estimatedGrossUsd: Number(gross.toFixed(4)),
      estimatedFeeUsd: Number(fee.toFixed(4)),
      estimatedNetUsd: Number(net.toFixed(4)),
      entryPrice: Number(target.marketPrice.toFixed(6)),
      oracleTarget: Number(target.oraclePrice.toFixed(6)),
      spreadPct: Number(spreadPct.toFixed(6)),
      feePct: Number(feePct.toFixed(6)),
      netPct: Number(netPct.toFixed(6)),
      estimatedProfitUsd: Number(net.toFixed(4)),
      route: "Jupiter v6 - best route",
      mode: "simulation",
      timestamp: new Date().toISOString(),
      note: "Simulation only. No on-chain transaction submitted."
    };

    return response;
  });
}
