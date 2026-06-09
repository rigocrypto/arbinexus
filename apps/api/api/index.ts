import type { IncomingMessage, ServerResponse } from "node:http";
import Fastify from "fastify";
import type { FastifyReply, InjectOptions } from "fastify";
import { TOKEN_MINTS, computeOpportunity, getJupiterPrice, getPythPrice } from "@arbinexus/sdk";
import type { Opportunity } from "@arbinexus/types";

console.log("arbinexus-api function module loaded");

// ── inline prices logic (no dotenv, no cors, no buildApp) ─────────────────
const DEFAULT_FEE_ESTIMATE_PCT = 0.25;
const DEFAULT_ASSET_SYMBOLS = ["SOL", "ETH"];

async function getPricesInline(): Promise<unknown> {
  const symbols = DEFAULT_ASSET_SYMBOLS;
  const rows: { symbol: string; source: string; value: number }[] = [];

  for (const sym of symbols) {
    const pyth = await getPythPrice(sym, {});
    if (pyth) rows.push({ symbol: `${sym}/USD`, source: "pyth", value: pyth.price });

    const jup = await getJupiterPrice(sym, "USDC", {});
    if (jup) rows.push({ symbol: `${sym}/USDC`, source: "jupiter", value: jup });
  }

  return {
    ok: true,
    network: "mainnet-beta",
    mode: rows.length > 0 ? "live" : "mock",
    sample: rows,
    updatedAt: new Date().toISOString(),
  };
}

async function getOpportunitiesInline(): Promise<{ items: Opportunity[]; count: number }> {
  const symbols = DEFAULT_ASSET_SYMBOLS;
  const items: Opportunity[] = [];

  for (const sym of symbols) {
    const pyth = await getPythPrice(sym, {});
    const jup = await getJupiterPrice(sym, "USDC", {});
    if (!pyth || !jup) continue;

    items.push(
      computeOpportunity({
        symbol: sym,
        oraclePrice: pyth.price,
        marketPrice: jup,
        confidenceAbs: pyth.confidenceAbs,
        confidencePct: pyth.confidencePct,
        inputMint: TOKEN_MINTS[sym],
        outputMint: TOKEN_MINTS["USDC"],
        options: { feeEstimatePct: DEFAULT_FEE_ESTIMATE_PCT, netThresholdPct: 0.1 },
      })
    );
  }

  return { items, count: items.length };
}
// ─────────────────────────────────────────────────────────────────────────────

const app = Fastify({ logger: false });

app.get("/", async (_req, reply: FastifyReply) => {
  reply.header("x-arbinexus-handler", "fastify-inline");
  return {
    ok: true,
    handler: "fastify-inline",
    service: "arbinexus-api",
    status: "running",
    endpoints: ["/health", "/prices", "/opportunities"],
  };
});

app.get("/health", async (_req, reply: FastifyReply) => {
  reply.header("x-arbinexus-handler", "fastify-inline");
  return { ok: true };
});

app.get("/api/health", async (_req, reply: FastifyReply) => {
  reply.header("x-arbinexus-handler", "fastify-inline");
  return { ok: true };
});

app.get("/prices", async (_req, reply: FastifyReply) => {
  reply.header("x-arbinexus-handler", "fastify-inline");
  return getPricesInline();
});

app.get("/opportunities", async (_req, reply: FastifyReply) => {
  reply.header("x-arbinexus-handler", "fastify-inline");
  return getOpportunitiesInline();
});

let readyPromise: Promise<unknown> | null = null;

async function ensureReady() {
  if (!readyPromise) {
    readyPromise = app.ready() as unknown as Promise<unknown>;
  }
  await readyPromise;
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

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.url === "/__ping") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, handler: "bypass", url: req.url }));
    return;
  }

  console.log("arbinexus-api request received", { method: req.method, url: req.url });

  try {
    await ensureReady();

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

    const response = (await app.inject(
      injectOptions
    )) as unknown as InjectResponse;

    res.statusCode = response.statusCode;
    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        res.setHeader(key, value as string | number | readonly string[]);
      }
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
