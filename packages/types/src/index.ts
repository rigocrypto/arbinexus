export type NetworkName = "devnet" | "mainnet-beta";
export type ProviderState = "live" | "degraded" | "offline";

export interface DataHealth {
  pyth: ProviderState;
  jupiter: ProviderState;
  cacheAge: number;
}

export interface PricePoint {
  source: "pyth" | "jupiter";
  symbol: string;
  value: number;
  timestamp: string;
  confidence?: number;
}

export interface Opportunity {
  symbol: string;
  oraclePrice: number;
  marketPrice: number;
  spreadPct: number;
  estimatedFeesPct: number;
  estimatedNetPct: number;
  confidenceScore: number;
  signal: "BUY_MARKET" | "SELL_MARKET" | "NO_TRADE";
  actionable: boolean;
  rationale: string;
  route?: {
    inputMint: string;
    outputMint: string;
  };
  updatedAt: string;
}

export interface SimulateRequest {
  symbol: string;
  side?: "buy_underpriced" | "sell_overpriced";
  amountUsd: number;
  slippageBps?: number;
}

export interface SimulateResponse {
  symbol: string;
  amountUsd?: number;
  estimatedGrossUsd: number;
  estimatedFeeUsd: number;
  estimatedNetUsd: number;
  entryPrice?: number;
  oracleTarget?: number;
  spreadPct?: number;
  feePct?: number;
  netPct?: number;
  estimatedProfitUsd?: number;
  route?: string;
  mode?: "simulation";
  timestamp?: string;
  note: string;
}

export interface ExecuteRequest extends SimulateRequest {
  walletPublicKey: string;
}

export interface ExecuteResponse {
  txSignature: string;
  status: "queued" | "simulated";
  message: string;
}
