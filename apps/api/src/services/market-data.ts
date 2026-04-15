import { TOKEN_MINTS, computeOpportunity, getJupiterPrice, getPythPrice } from "@arbinexus/sdk";
import type { Opportunity } from "@arbinexus/types";

const DEFAULT_CACHE_TTL_MS = 5_000;
const DEFAULT_FEE_ESTIMATE_PCT = 0.25;
const DEFAULT_NET_THRESHOLD_PCT = 0.1;
const DEFAULT_ASSET_SYMBOLS = ["SOL", "ETH"];

type SystemStatus = "ok" | "degraded";
type ProviderState = "live" | "degraded" | "offline";

interface DataHealth {
  pyth: ProviderState;
  jupiter: ProviderState;
  cacheAge: number;
}

interface PriceRow {
  symbol: string;
  source: "pyth" | "jupiter";
  value: number;
}

interface AssetMarketSnapshot {
  symbol: string;
  oraclePrice: number;
  marketPrice: number;
  confidenceAbs: number;
  confidencePct: number;
}

interface SnapshotBundle {
  mode: "live" | "mock";
  status: SystemStatus;
  message?: string;
  health: DataHealth;
  assets: AssetMarketSnapshot[];
  updatedAt: string;
}

interface CachedBundle {
  data: SnapshotBundle;
  cachedAt: number;
}

interface PricesPayload {
  network: string;
  mode: "live" | "mock";
  status: SystemStatus;
  message?: string;
  health: DataHealth;
  sample: PriceRow[];
  updatedAt: string;
}

interface OpportunitiesPayload {
  mode: "live" | "mock";
  status: SystemStatus;
  message?: string;
  health: DataHealth;
  items: Opportunity[];
  count: number;
  updatedAt: string;
}

let marketCache: CachedBundle | null = null;
let lastKnownGood: SnapshotBundle | null = null;

function parseAssetSymbols(raw: string | undefined): string[] {
  if (!raw) {
    return DEFAULT_ASSET_SYMBOLS;
  }

  const symbols = raw
    .split(",")
    .map((token) => token.trim().toUpperCase())
    .filter((token) => token.length > 0);

  return symbols.length > 0 ? symbols : DEFAULT_ASSET_SYMBOLS;
}

function getPriceIdOverrides(): Partial<Record<string, string>> {
  const clean = (value: string | undefined) => {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  };

  return {
    SOL: clean(process.env.PYTH_PRICE_ID_SOL),
    BTC: clean(process.env.PYTH_PRICE_ID_BTC),
    ETH: clean(process.env.PYTH_PRICE_ID_ETH)
  };
}

function getMockBundle(): SnapshotBundle {
  return {
    mode: "mock",
    status: "degraded",
    message: "Using fallback market data. Check Pyth/Jupiter configuration.",
    health: {
      pyth: "degraded",
      jupiter: "degraded",
      cacheAge: 0
    },
    assets: [
      {
        symbol: "SOL",
        oraclePrice: 162.42,
        marketPrice: 161.79,
        confidenceAbs: 0.02,
        confidencePct: (0.02 / 162.42) * 100
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

function providerState(successCount: number, attemptedCount: number): ProviderState {
  if (successCount === 0) {
    return "offline";
  }
  if (successCount === attemptedCount) {
    return "live";
  }
  return "degraded";
}

function addCacheAge(health: Omit<DataHealth, "cacheAge">, updatedAt: string): DataHealth {
  const ageMs = Math.max(0, Date.now() - new Date(updatedAt).getTime());
  return {
    ...health,
    cacheAge: Math.floor(ageMs / 1000)
  };
}

async function fetchAssetSnapshot(symbol: string): Promise<{
  snapshot: AssetMarketSnapshot | null;
  pythOk: boolean;
  jupiterOk: boolean;
}> {
  const pythHermesUrl = process.env.PYTH_HERMES_URL;
  const jupiterApiBase = process.env.JUPITER_API_BASE;

  const pyth = await getPythPrice(symbol, { pythHermesUrl }, getPriceIdOverrides());
  if (!pyth) {
    return {
      snapshot: null,
      pythOk: false,
      jupiterOk: false
    };
  }

  const marketPrice = await getJupiterPrice(symbol, "USDC", { jupiterApiBase });
  if (!marketPrice || marketPrice <= 0) {
    return {
      snapshot: null,
      pythOk: true,
      jupiterOk: false
    };
  }

  return {
    snapshot: {
      symbol,
      oraclePrice: pyth.price,
      marketPrice,
      confidenceAbs: pyth.confidenceAbs,
      confidencePct: pyth.confidencePct
    },
    pythOk: true,
    jupiterOk: true
  };
}

async function fetchLiveBundle(): Promise<SnapshotBundle | null> {
  const symbols = parseAssetSymbols(process.env.ASSET_SYMBOLS);
  const snapshots = await Promise.all(symbols.map((symbol) => fetchAssetSnapshot(symbol)));
  const assets = snapshots
    .map((result) => result.snapshot)
    .filter((snapshot): snapshot is AssetMarketSnapshot => snapshot !== null);

  const pythSuccessCount = snapshots.filter((result) => result.pythOk).length;
  const jupiterSuccessCount = snapshots.filter((result) => result.jupiterOk).length;
  const attemptedCount = symbols.length;

  if (assets.length === 0) {
    return null;
  }

  const updatedAt = new Date().toISOString();

  return {
    mode: "live",
    status: pythSuccessCount === attemptedCount && jupiterSuccessCount === attemptedCount ? "ok" : "degraded",
    health: addCacheAge({
      pyth: providerState(pythSuccessCount, attemptedCount),
      jupiter: providerState(jupiterSuccessCount, attemptedCount)
    }, updatedAt),
    assets,
    updatedAt
  };
}

export async function getMarketSnapshotBundle(): Promise<SnapshotBundle> {
  const ttlMs = Number(process.env.API_CACHE_TTL_MS ?? DEFAULT_CACHE_TTL_MS);
  if (marketCache && Date.now() - marketCache.cachedAt < ttlMs) {
    return marketCache.data;
  }

  try {
    const liveBundle = await fetchLiveBundle();
    if (!liveBundle) {
      throw new Error("No live assets resolved");
    }

    marketCache = { data: liveBundle, cachedAt: Date.now() };
    lastKnownGood = liveBundle;
    return liveBundle;
  } catch {
    if (lastKnownGood) {
      const updatedAt = new Date().toISOString();
      const degraded = {
        ...lastKnownGood,
        status: "degraded" as const,
        message: "Using cached live data after upstream fetch failure.",
        health: addCacheAge({
          pyth: "degraded",
          jupiter: "degraded"
        }, updatedAt),
        updatedAt
      };
      marketCache = { data: degraded, cachedAt: Date.now() };
      return degraded;
    }

    const mock = getMockBundle();
    marketCache = { data: mock, cachedAt: Date.now() };
    return mock;
  }
}

export async function getPricesPayload(): Promise<PricesPayload> {
  const bundle = await getMarketSnapshotBundle();
  const sample: PriceRow[] = [];

  for (const asset of bundle.assets) {
    sample.push({ symbol: `${asset.symbol}/USD`, source: "pyth", value: asset.oraclePrice });
    sample.push({ symbol: `${asset.symbol}/USDC`, source: "jupiter", value: asset.marketPrice });
  }

  return {
    network: process.env.SOLANA_NETWORK ?? "devnet",
    mode: bundle.mode,
    status: bundle.status,
    message: bundle.message,
    health: addCacheAge(bundle.health, bundle.updatedAt),
    sample,
    updatedAt: bundle.updatedAt
  };
}

export async function getOpportunitiesPayload(): Promise<OpportunitiesPayload> {
  const bundle = await getMarketSnapshotBundle();
  const feeEstimatePct = Number(process.env.FEE_ESTIMATE_PCT ?? DEFAULT_FEE_ESTIMATE_PCT);
  const thresholdPct = Number(process.env.OPPORTUNITY_NET_THRESHOLD_PCT ?? DEFAULT_NET_THRESHOLD_PCT);

  const items = bundle.assets
    .map((asset) => computeOpportunity({
      symbol: asset.symbol,
      oraclePrice: asset.oraclePrice,
      marketPrice: asset.marketPrice,
      confidenceAbs: asset.confidenceAbs,
      confidencePct: asset.confidencePct,
      inputMint: TOKEN_MINTS[asset.symbol],
      outputMint: TOKEN_MINTS.USDC,
      options: {
        feeEstimatePct,
        netThresholdPct: thresholdPct
      }
    }))
    .sort((a, b) => b.estimatedNetPct - a.estimatedNetPct);

  return {
    mode: bundle.mode,
    status: bundle.status,
    message: bundle.message,
    health: addCacheAge(bundle.health, bundle.updatedAt),
    items,
    count: items.length,
    updatedAt: bundle.updatedAt
  };
}
