import type { Opportunity } from "@arbinexus/types";

const DEFAULT_FEE_ESTIMATE_PCT = 0.25;
const DEFAULT_MIN_NET_THRESHOLD_PCT = 0.1;

export interface ComputeOpportunityOptions {
  feeEstimatePct?: number;
  netThresholdPct?: number;
}

export function computeSpreadPct(oraclePrice: number, marketPrice: number): number {
  if (oraclePrice <= 0) {
    return 0;
  }
  return ((oraclePrice - marketPrice) / oraclePrice) * 100;
}

export function confidenceScore(spreadPct: number, confidencePct = 0): number {
  const spreadSignal = Math.min(Math.abs(spreadPct) * 10, 70);
  const confidenceSignal = Math.max(0, 30 - confidencePct * 100);
  return Math.max(1, Math.min(99, Math.round(spreadSignal + confidenceSignal)));
}

export function computeOpportunity(args: {
  symbol: string;
  oraclePrice: number;
  marketPrice: number;
  confidencePct?: number;
  confidenceAbs?: number;
  inputMint?: string;
  outputMint?: string;
  options?: ComputeOpportunityOptions;
}): Opportunity {
  const feeEstimatePct = args.options?.feeEstimatePct ?? DEFAULT_FEE_ESTIMATE_PCT;
  const netThresholdPct = args.options?.netThresholdPct ?? DEFAULT_MIN_NET_THRESHOLD_PCT;

  const spreadPct = computeSpreadPct(args.oraclePrice, args.marketPrice);
  const estimatedNetPct = spreadPct - feeEstimatePct;

  const confidenceAbs = args.confidenceAbs ?? 0;
  const confidenceGatePassed = Math.abs(args.oraclePrice - args.marketPrice) > confidenceAbs * 2;

  let signal: Opportunity["signal"] = "NO_TRADE";
  let actionable = false;
  let rationale = `Net spread ${estimatedNetPct.toFixed(3)}% below profitable threshold`;

  if (!confidenceGatePassed) {
    rationale = "Spread within oracle confidence interval; signal treated as noise";
  } else if (estimatedNetPct > netThresholdPct) {
    signal = "BUY_MARKET";
    actionable = true;
    rationale = `Market underpriced by ${estimatedNetPct.toFixed(3)}% net of fees`;
  } else if (estimatedNetPct < -netThresholdPct) {
    signal = "SELL_MARKET";
    actionable = true;
    rationale = `Market overpriced by ${Math.abs(estimatedNetPct).toFixed(3)}% net of fees`;
  }

  return {
    symbol: args.symbol,
    oraclePrice: args.oraclePrice,
    marketPrice: args.marketPrice,
    spreadPct,
    estimatedFeesPct: feeEstimatePct,
    estimatedNetPct,
    confidenceScore: confidenceScore(spreadPct, args.confidencePct ?? 0),
    signal,
    actionable,
    rationale,
    route: args.inputMint && args.outputMint
      ? { inputMint: args.inputMint, outputMint: args.outputMint }
      : undefined,
    updatedAt: new Date().toISOString()
  };
}
