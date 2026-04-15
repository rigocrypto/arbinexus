import { TOKEN_MINTS, fetchJupiterPrice, getJupiterPrice } from "./jupiter";
import { fetchPythPriceById, getPythPrice, PYTH_PRICE_IDS } from "./pyth";
import { computeOpportunity, computeSpreadPct, confidenceScore } from "./arbitrage";
import type { Opportunity } from "@arbinexus/types";

export type { JupiterConfig } from "./jupiter";
export type { PythConfig, PythResult } from "./pyth";
export type { ComputeOpportunityOptions } from "./arbitrage";

export { TOKEN_MINTS, PYTH_PRICE_IDS };
export { fetchPythPriceById, getPythPrice };
export { fetchJupiterPrice, getJupiterPrice };
export { computeOpportunity, computeSpreadPct, confidenceScore };

// Compatibility wrapper for existing callers.
export function buildOpportunity(args: {
  symbol: string;
  oraclePrice: number;
  marketPrice: number;
  estimatedFeesPct: number;
  confidence?: number;
  inputMint?: string;
  outputMint?: string;
}): Opportunity {
  const confidenceAbs = args.confidence ?? 0;
  const confidencePct = args.oraclePrice > 0 ? (confidenceAbs / args.oraclePrice) * 100 : 0;

  return computeOpportunity({
    symbol: args.symbol,
    oraclePrice: args.oraclePrice,
    marketPrice: args.marketPrice,
    confidenceAbs,
    confidencePct,
    inputMint: args.inputMint,
    outputMint: args.outputMint,
    options: {
      feeEstimatePct: args.estimatedFeesPct,
      netThresholdPct: 0.1
    }
  });
}
