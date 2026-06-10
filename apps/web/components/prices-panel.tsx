"use client";

import { useEffect, useState } from "react";
import { Panel } from "@arbinexus/ui";

interface PriceSample {
  symbol: string;
  source: string;
  value: number;
}

interface PricesResponse {
  network: string;
  mode: string;
  sample: PriceSample[];
  updatedAt: string;
}

interface AssetPrices {
  base: string;
  oracle: number | null;
  market: number | null;
}

function groupByBase(sample: PriceSample[]): AssetPrices[] {
  const map = new Map<string, AssetPrices>();
  for (const entry of sample) {
    const base = entry.symbol.split("/")[0];
    if (!map.has(base)) map.set(base, { base, oracle: null, market: null });
    const asset = map.get(base)!;
    if (entry.source === "pyth") asset.oracle = entry.value;
    else if (entry.source === "jupiter") asset.market = entry.value;
  }
  return Array.from(map.values());
}

export function PricesPanel() {
  const [data, setData] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    function fetchPrices() {
      fetch(`${baseUrl}/prices`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<PricesResponse>;
        })
        .then((payload) => {
          setData(payload);
          setLoading(false);
        })
        .catch((err) => {
          console.warn("Prices fetch failed:", err.message);
          setLoading(false);
        });
    }

    fetchPrices();
    const timer = setInterval(fetchPrices, 10_000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <Panel>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-10 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </Panel>
    );
  }

  const assets = data ? groupByBase(data.sample) : [];
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString()
    : null;

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Oracle &amp; Market Prices
        </h2>
        {updatedAt ? (
          <span className="text-xs text-zinc-500">Updated {updatedAt}</span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {assets.map((asset) => {
          const spread =
            asset.oracle !== null && asset.market !== null
              ? asset.oracle - asset.market
              : null;
          const spreadPositive = spread !== null && spread >= 0;

          return (
            <article
              key={asset.base}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
                {asset.base}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Oracle (Pyth)</span>
                  <span className="font-semibold text-zinc-100">
                    {asset.oracle !== null ? `$${asset.oracle.toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Market (Jupiter)</span>
                  <span className="font-semibold text-zinc-100">
                    {asset.market !== null ? `$${asset.market.toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="text-xs text-zinc-400">Spread</span>
                  <span
                    className={
                      "font-semibold " +
                      (spread === null
                        ? "text-zinc-500"
                        : spreadPositive
                        ? "text-[#14F195]"
                        : "text-rose-400")
                    }
                  >
                    {spread !== null
                      ? `${spreadPositive ? "+" : ""}${spread.toFixed(4)}`
                      : "—"}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
