import type { PricePoint } from "@arbinexus/types";

const DEFAULT_JUPITER_API_BASE = "https://lite-api.jup.ag/swap/v1";
const JUPITER_FALLBACK_BASES = [
  "https://lite-api.jup.ag/swap/v1",
  "https://quote-api.jup.ag/v6"
];

export const TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  BTC: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
  ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
};

const MINT_DECIMALS: Record<string, number> = {
  "So11111111111111111111111111111111111111112": 9,
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": 6,
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": 8,
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 6
};

const DEFAULT_INPUT_AMOUNTS: Record<string, number> = {
  SOL: 1_000_000_000,
  BTC: 1_000_000,
  ETH: 100_000_000
};

export interface JupiterConfig {
  jupiterApiBase?: string;
}

function buildQuoteUrl(base: string, inputMint: string, outputMint: string, amountLamports: number): string {
  const normalizedBase = base.replace(/\/$/, "");
  const quotePath = normalizedBase.endsWith("/quote")
    ? normalizedBase
    : `${normalizedBase}/quote`;

  return `${quotePath}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50`;
}

export async function fetchJupiterPrice(inputMint: string, outputMint: string, amountLamports = 1_000_000, config: JupiterConfig = {}): Promise<PricePoint | null> {
  const preferredBase = config.jupiterApiBase ?? DEFAULT_JUPITER_API_BASE;
  const candidates = [preferredBase, ...JUPITER_FALLBACK_BASES.filter((item) => item !== preferredBase)];

  for (const base of candidates) {
    const url = buildQuoteUrl(base, inputMint, outputMint, amountLamports);

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      continue;
    }

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as { outAmount?: string; inAmount?: string };
    if (!payload.outAmount || !payload.inAmount) {
      continue;
    }

    const inAmount = Number(payload.inAmount);
    const outAmount = Number(payload.outAmount);
    if (inAmount === 0) {
      continue;
    }

    const inputDecimals = MINT_DECIMALS[inputMint] ?? 0;
    const outputDecimals = MINT_DECIMALS[outputMint] ?? 0;
    const normalizedIn = inAmount / Math.pow(10, inputDecimals);
    const normalizedOut = outAmount / Math.pow(10, outputDecimals);
    if (normalizedIn === 0) {
      continue;
    }

    return {
      source: "jupiter",
      symbol: `${inputMint}/${outputMint}`,
      value: normalizedOut / normalizedIn,
      timestamp: new Date().toISOString()
    };
  }

  return null;
}

export async function getJupiterPrice(inputSymbol: string, outputSymbol = "USDC", config: JupiterConfig = {}, amountBySymbol: Partial<Record<string, number>> = {}): Promise<number | null> {
  const inSymbol = inputSymbol.toUpperCase();
  const outSymbol = outputSymbol.toUpperCase();

  const inputMint = TOKEN_MINTS[inSymbol];
  const outputMint = TOKEN_MINTS[outSymbol];
  if (!inputMint || !outputMint) {
    return null;
  }

  const amount = amountBySymbol[inSymbol] ?? DEFAULT_INPUT_AMOUNTS[inSymbol] ?? 1_000_000_000;
  const quote = await fetchJupiterPrice(inputMint, outputMint, amount, config);
  return quote?.value ?? null;
}
