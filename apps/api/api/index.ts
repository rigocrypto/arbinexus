/**
 * Vercel serverless entry point — fully self-contained.
 *
 * No workspace package imports (@arbinexus/sdk, @arbinexus/types) because
 * ncc cannot resolve their "main": "src/index.ts" TypeScript entries under
 * the monorepo's "moduleResolution": "Bundler" tsconfig.
 *
 * SDK logic is inlined here. src/app.ts and its routes remain for local dev.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import Fastify from "fastify";
import type { FastifyInstance, FastifyReply, InjectOptions } from "fastify";
import { z } from "zod";

console.log("arbinexus-api function module loaded");

// ── Inlined types (from @arbinexus/types) ────────────────────────────────────
interface Opportunity {
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
  route?: { inputMint: string; outputMint: string };
  updatedAt: string;
}

// ── Inlined SDK: constants ─────────────────────────────────────────────────
const TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  BTC: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
  ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

const MINT_DECIMALS: Record<string, number> = {
  "So11111111111111111111111111111111111111112": 9,
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": 6,
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": 8,
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 6,
};

const DEFAULT_INPUT_AMOUNTS: Record<string, number> = {
  SOL: 1_000_000_000,
  BTC: 1_000_000,
  ETH: 100_000_000,
};

const PYTH_PRICE_IDS: Record<string, string> = {
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
};

const DEFAULT_JUPITER_API_BASE = "https://lite-api.jup.ag/swap/v1";
const DEFAULT_PYTH_HERMES_URL = "https://hermes.pyth.network";

// ── Inlined SDK: Jupiter ──────────────────────────────────────────────────
async function getJupiterPrice(
  inputSymbol: string,
  outputSymbol = "USDC",
  jupiterApiBase?: string
): Promise<number | null> {
  const inSym = inputSymbol.toUpperCase();
  const outSym = outputSymbol.toUpperCase();
  const inputMint = TOKEN_MINTS[inSym];
  const outputMint = TOKEN_MINTS[outSym];
  if (!inputMint || !outputMint) return null;

  const base = (jupiterApiBase ?? DEFAULT_JUPITER_API_BASE).replace(/\/$/, "");
  const quotePath = base.endsWith("/quote") ? base : `${base}/quote`;
  const amount = DEFAULT_INPUT_AMOUNTS[inSym] ?? 1_000_000_000;
  const url = `${quotePath}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;

  const candidates = [
    jupiterApiBase ?? DEFAULT_JUPITER_API_BASE,
    "https://lite-api.jup.ag/swap/v1",
    "https://quote-api.jup.ag/v6",
  ];

  for (const candidate of candidates) {
    const b = candidate.replace(/\/$/, "");
    const qp = b.endsWith("/quote") ? b : `${b}/quote`;
    const u = `${qp}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const data = (await r.json()) as { outAmount?: string; inAmount?: string };
      if (!data.outAmount || !data.inAmount) continue;
      const inAmt = Number(data.inAmount);
      const outAmt = Number(data.outAmount);
      if (inAmt === 0) continue;
      const inDec = MINT_DECIMALS[inputMint] ?? 0;
      const outDec = MINT_DECIMALS[outputMint] ?? 0;
      const normIn = inAmt / Math.pow(10, inDec);
      const normOut = outAmt / Math.pow(10, outDec);
      if (normIn === 0) continue;
      return normOut / normIn;
    } catch {
      continue;
    }
  }
  return null;
}

// ── Inlined SDK: Pyth ─────────────────────────────────────────────────────
interface PythResult {
  symbol: string;
  price: number;
  confidenceAbs: number;
  confidencePct: number;
  publishedAt: string;
}

async function getPythPrice(
  symbol: string,
  pythHermesUrl?: string,
  priceIdOverrides?: Partial<Record<string, string>>
): Promise<PythResult | null> {
  const sym = symbol.toUpperCase();
  const priceId = (priceIdOverrides?.[sym]) ?? PYTH_PRICE_IDS[sym];
  if (!priceId) return null;

  const base = pythHermesUrl ?? DEFAULT_PYTH_HERMES_URL;
  const url = `${base}/v2/updates/price/latest?ids[]=${encodeURIComponent(priceId)}`;

  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const payload = (await r.json()) as {
      parsed?: Array<{
        price?: { price: string; expo: number; conf?: string };
        publish_time?: number | string;
        id: string;
      }>;
    };
    const record = payload.parsed?.[0];
    if (!record?.price) return null;

    const raw = Number(record.price.price);
    const expo = record.price.expo;
    const value = raw * Math.pow(10, expo);
    if (value <= 0) return null;

    const conf = record.price.conf ? Number(record.price.conf) * Math.pow(10, expo) : 0;
    const publishMs = Number(record.publish_time ?? Date.now() / 1000) * 1000;
    const publishedAt = Number.isFinite(publishMs)
      ? new Date(publishMs).toISOString()
      : new Date().toISOString();

    return {
      symbol: sym,
      price: value,
      confidenceAbs: conf,
      confidencePct: conf > 0 ? (conf / value) * 100 : 0,
      publishedAt,
    };
  } catch {
    return null;
  }
}

// ── Inlined SDK: arbitrage ────────────────────────────────────────────────
function computeSpreadPct(oraclePrice: number, marketPrice: number): number {
  if (oraclePrice <= 0) return 0;
  return ((oraclePrice - marketPrice) / oraclePrice) * 100;
}

function calcConfidenceScore(spreadPct: number, confidencePct = 0): number {
  const spreadSignal = Math.min(Math.abs(spreadPct) * 10, 70);
  const confidenceSignal = Math.max(0, 30 - confidencePct * 100);
  return Math.max(1, Math.min(99, Math.round(spreadSignal + confidenceSignal)));
}

function computeOpportunity(args: {
  symbol: string;
  oraclePrice: number;
  marketPrice: number;
  confidencePct?: number;
  confidenceAbs?: number;
  inputMint?: string;
  outputMint?: string;
  feeEstimatePct?: number;
  netThresholdPct?: number;
}): Opportunity {
  const feeEstimatePct = args.feeEstimatePct ?? 0.25;
  const netThresholdPct = args.netThresholdPct ?? 0.1;
  const spreadPct = computeSpreadPct(args.oraclePrice, args.marketPrice);
  const estimatedNetPct = spreadPct - feeEstimatePct;
  const confidenceAbs = args.confidenceAbs ?? 0;
  const confidenceGatePassed =
    Math.abs(args.oraclePrice - args.marketPrice) > confidenceAbs * 2;

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
    confidenceScore: calcConfidenceScore(spreadPct, args.confidencePct ?? 0),
    signal,
    actionable,
    rationale,
    route:
      args.inputMint && args.outputMint
        ? { inputMint: args.inputMint, outputMint: args.outputMint }
        : undefined,
    updatedAt: new Date().toISOString(),
  };
}

// ── Market data helpers ───────────────────────────────────────────────────
const ASSET_SYMBOLS = ["SOL", "ETH"];
const FEE_ESTIMATE_PCT = Number(process.env.FEE_ESTIMATE_PCT ?? 0.25);
const NET_THRESHOLD_PCT = Number(process.env.OPPORTUNITY_NET_THRESHOLD_PCT ?? 0.1);

interface AssetSnapshot {
  symbol: string;
  oraclePrice: number;
  marketPrice: number;
  confidenceAbs: number;
  confidencePct: number;
}

async function fetchSnapshot(symbol: string): Promise<AssetSnapshot | null> {
  const pyth = await getPythPrice(
    symbol,
    process.env.PYTH_HERMES_URL,
    {
      SOL: process.env.PYTH_PRICE_ID_SOL,
      BTC: process.env.PYTH_PRICE_ID_BTC,
      ETH: process.env.PYTH_PRICE_ID_ETH,
    }
  );
  if (!pyth) return null;

  const jup = await getJupiterPrice(symbol, "USDC", process.env.JUPITER_API_BASE);
  if (!jup || jup <= 0) return null;

  return {
    symbol,
    oraclePrice: pyth.price,
    marketPrice: jup,
    confidenceAbs: pyth.confidenceAbs,
    confidencePct: pyth.confidencePct,
  };
}

interface MarketBundle {
  mode: "live" | "mock";
  assets: AssetSnapshot[];
  updatedAt: string;
}

let _cache: { bundle: MarketBundle; cachedAt: number } | null = null;
const CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS ?? 5_000);

async function getMarketBundle(): Promise<MarketBundle> {
  if (_cache && Date.now() - _cache.cachedAt < CACHE_TTL_MS) {
    return _cache.bundle;
  }
  const results = await Promise.all(ASSET_SYMBOLS.map(fetchSnapshot));
  const assets = results.filter((s): s is AssetSnapshot => s !== null);

  if (assets.length === 0) {
    return {
      mode: "mock",
      assets: [
        { symbol: "SOL", oraclePrice: 162.42, marketPrice: 161.79, confidenceAbs: 0.02, confidencePct: 0.012 },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  const bundle: MarketBundle = { mode: "live", assets, updatedAt: new Date().toISOString() };
  _cache = { bundle, cachedAt: Date.now() };
  return bundle;
}

// ── Zod schemas ───────────────────────────────────────────────────────────
const simulateSchema = z.object({
  symbol: z.string().min(2),
  side: z.enum(["buy_underpriced", "sell_overpriced"]).optional().default("buy_underpriced"),
  amountUsd: z.number().positive().optional().default(1000),
  slippageBps: z.number().min(1).max(500).optional().default(50),
});

const executeSchema = z.object({
  symbol: z.string().min(2),
  side: z.enum(["buy_underpriced", "sell_overpriced"]),
  amountUsd: z.number().positive(),
  slippageBps: z.number().min(1).max(500),
  walletPublicKey: z.string().min(32),
});

// ── CORS helper ───────────────────────────────────────────────────────────
const LOCALHOST_ORIGINS = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);
const PRIVATE_NET = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)\d+\.\d+:3000$/i;

function isAllowedOrigin(origin: string): boolean {
  if (LOCALHOST_ORIGINS.has(origin)) return true;
  if (PRIVATE_NET.test(origin)) return true;
  const configured = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return configured.includes(origin);
}

// ── Fastify app ───────────────────────────────────────────────────────────
function buildServerlessApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  // CORS — manual hook (no @fastify/cors to avoid version mismatch with ncc)
  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
      reply.header("access-control-allow-origin", origin);
      reply.header("access-control-allow-credentials", "true");
      reply.header("vary", "Origin");
    }
    reply.header("access-control-allow-methods", "GET,POST,OPTIONS");
    reply.header("access-control-allow-headers", "content-type,authorization");
    if (request.method === "OPTIONS") {
      reply.status(204).send();
    }
  });

  app.get("/", async (_req, reply: FastifyReply) => {
    reply.header("x-arbinexus-handler", "serverless");
    return {
      ok: true,
      service: "arbinexus-api",
      status: "running",
      endpoints: ["/health", "/prices", "/opportunities", "/simulate", "/execute"],
    };
  });

  app.get("/health", async (_req, reply: FastifyReply) => {
    reply.header("x-arbinexus-handler", "serverless");
    return { ok: true };
  });

  app.get("/api/health", async (_req, reply: FastifyReply) => {
    reply.header("x-arbinexus-handler", "serverless");
    return { ok: true };
  });

  app.get("/prices", async (_req, reply: FastifyReply) => {
    reply.header("x-arbinexus-handler", "serverless");
    const bundle = await getMarketBundle();
    const sample = bundle.assets.flatMap((a) => [
      { symbol: `${a.symbol}/USD`, source: "pyth", value: a.oraclePrice },
      { symbol: `${a.symbol}/USDC`, source: "jupiter", value: a.marketPrice },
    ]);
    return {
      network: process.env.SOLANA_NETWORK ?? "mainnet-beta",
      mode: bundle.mode,
      sample,
      updatedAt: bundle.updatedAt,
    };
  });

  app.get("/opportunities", async (_req, reply: FastifyReply) => {
    reply.header("x-arbinexus-handler", "serverless");
    const bundle = await getMarketBundle();
    const items = bundle.assets.map((a) =>
      computeOpportunity({
        symbol: a.symbol,
        oraclePrice: a.oraclePrice,
        marketPrice: a.marketPrice,
        confidenceAbs: a.confidenceAbs,
        confidencePct: a.confidencePct,
        inputMint: TOKEN_MINTS[a.symbol],
        outputMint: TOKEN_MINTS["USDC"],
        feeEstimatePct: FEE_ESTIMATE_PCT,
        netThresholdPct: NET_THRESHOLD_PCT,
      })
    );
    return { mode: bundle.mode, items, count: items.length, updatedAt: bundle.updatedAt };
  });

  app.post("/simulate", async (request, reply: FastifyReply) => {
    const parsed = simulateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }
    const bundle = await getMarketBundle();
    const target = bundle.assets.find(
      (a) => a.symbol.toLowerCase() === parsed.data.symbol.toLowerCase()
    );
    if (!target) {
      return reply.status(404).send({ error: "Symbol not found in current opportunity set" });
    }
    const opp = computeOpportunity({
      symbol: target.symbol,
      oraclePrice: target.oraclePrice,
      marketPrice: target.marketPrice,
      confidenceAbs: target.confidenceAbs,
      confidencePct: target.confidencePct,
      feeEstimatePct: FEE_ESTIMATE_PCT,
      netThresholdPct: NET_THRESHOLD_PCT,
    });
    const amt = parsed.data.amountUsd;
    return {
      symbol: parsed.data.symbol.toUpperCase(),
      amountUsd: amt,
      estimatedGrossUsd: Number(((opp.spreadPct / 100) * amt).toFixed(4)),
      estimatedFeeUsd: Number(((opp.estimatedFeesPct / 100) * amt).toFixed(4)),
      estimatedNetUsd: Number(((opp.estimatedNetPct / 100) * amt).toFixed(4)),
      entryPrice: Number(target.marketPrice.toFixed(6)),
      oracleTarget: Number(target.oraclePrice.toFixed(6)),
      spreadPct: Number(opp.spreadPct.toFixed(6)),
      feePct: Number(opp.estimatedFeesPct.toFixed(6)),
      netPct: Number(opp.estimatedNetPct.toFixed(6)),
      route: "Jupiter v6 - best route",
      mode: "simulation",
      timestamp: new Date().toISOString(),
      note: "Simulation only. No on-chain transaction submitted.",
    };
  });

  app.post("/execute", async (request, reply: FastifyReply) => {
    const parsed = executeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }
    return {
      txSignature: "simulated-" + Math.random().toString(36).slice(2),
      status: "simulated",
      message: `Execution queued in hackathon-safe simulation mode for ${parsed.data.symbol.toUpperCase()}.`,
    };
  });

  return app;
}

// ── Vercel handler ────────────────────────────────────────────────────────
let appInstance: FastifyInstance | null = null;
let readyPromise: Promise<unknown> | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!appInstance) appInstance = buildServerlessApp();
  if (!readyPromise) readyPromise = appInstance.ready() as unknown as Promise<unknown>;
  await readyPromise;
  return appInstance;
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

interface InjectResponse {
  statusCode: number;
  headers: Record<string, string | string[] | number | undefined>;
  body: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/__ping") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, handler: "bypass", url: req.url }));
    return;
  }

  try {
    const app = await getApp();
    const method = (req.method || "GET").toUpperCase();
    const payload = ["POST", "PUT", "PATCH", "DELETE"].includes(method)
      ? await readBody(req)
      : undefined;

    const injectOptions: InjectOptions = {
      method: method as InjectOptions["method"],
      url: req.url || "/",
      headers: req.headers as Record<string, string | string[]>,
      payload,
    };

    const response = (await app.inject(injectOptions)) as unknown as InjectResponse;
    res.statusCode = response.statusCode;
    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) res.setHeader(key, value as string | number | readonly string[]);
    }
    res.end(response.body);
  } catch (error) {
    console.error("[arbinexus-api] handler error:", error);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    );
  }
}
