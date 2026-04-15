import type { PricePoint } from "@arbinexus/types";

const DEFAULT_PYTH_HERMES_URL = "https://hermes.pyth.network";

export const PYTH_PRICE_IDS: Record<string, string> = {
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
};

export interface PythConfig {
  pythHermesUrl?: string;
}

export interface PythResult {
  symbol: string;
  price: number;
  confidenceAbs: number;
  confidencePct: number;
  publishedAt: string;
}

export async function fetchPythPriceById(priceId: string, config: PythConfig = {}): Promise<PricePoint | null> {
  const base = config.pythHermesUrl ?? DEFAULT_PYTH_HERMES_URL;
  const url = `${base}/v2/updates/price/latest?ids[]=${encodeURIComponent(priceId)}`;

  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    parsed?: Array<{
      price?: { price: string; expo: number; conf?: string; publish_time?: number | string };
      id: string;
      publish_time?: number | string;
    }>;
  };

  const record = payload.parsed?.[0];
  if (!record?.price) {
    return null;
  }

  const raw = Number(record.price.price);
  const expo = record.price.expo;
  const value = raw * Math.pow(10, expo);
  const confidence = record.price.conf ? Number(record.price.conf) * Math.pow(10, expo) : undefined;

  const publishTimeRaw = record.publish_time ?? record.price.publish_time;
  const publishTimeMs = Number(publishTimeRaw ?? Date.now() / 1000) * 1000;
  const safeTimestamp = Number.isFinite(publishTimeMs)
    ? new Date(publishTimeMs).toISOString()
    : new Date().toISOString();

  return {
    source: "pyth",
    symbol: record.id,
    value,
    timestamp: safeTimestamp,
    confidence
  };
}

export async function getPythPrice(symbol: string, config: PythConfig = {}, overrides: Partial<Record<string, string>> = {}): Promise<PythResult | null> {
  const uppercaseSymbol = symbol.toUpperCase();
  const priceId = overrides[uppercaseSymbol] ?? PYTH_PRICE_IDS[uppercaseSymbol];

  if (!priceId) {
    return null;
  }

  const point = await fetchPythPriceById(priceId, config);
  if (!point || point.value <= 0) {
    return null;
  }

  const confidenceAbs = point.confidence ?? 0;
  const confidencePct = confidenceAbs > 0 ? (confidenceAbs / point.value) * 100 : 0;

  return {
    symbol: uppercaseSymbol,
    price: point.value,
    confidenceAbs,
    confidencePct,
    publishedAt: point.timestamp
  };
}
