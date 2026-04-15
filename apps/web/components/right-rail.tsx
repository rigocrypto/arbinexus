"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { DataHealth, Opportunity } from "@arbinexus/types";
import { systemStatus, topOpportunities } from "./mock-data";

interface OpportunitiesPayload {
  status?: "ok" | "degraded";
  health?: DataHealth;
  items?: Opportunity[];
  updatedAt?: string;
}

function statusToneClass(tone: "live" | "healthy" | "warn") {
  if (tone === "live") {
    return "text-[#14F195]";
  }
  if (tone === "healthy") {
    return "text-[#00C2FF]";
  }
  return "text-amber-300";
}

export function RightRail() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [health, setHealth] = useState<DataHealth | null>(null);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [walletBalanceSol, setWalletBalanceSol] = useState<number | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    let cancelled = false;

    async function hydrate() {
      try {
        const response = await fetch(`${baseUrl}/opportunities`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as OpportunitiesPayload;
        if (cancelled) {
          return;
        }

        setHealth(payload.health ?? null);
        setItems(payload.items ?? []);
        setUpdatedAt(payload.updatedAt ?? null);
      } catch {
        // Keep stale local state if the request fails.
      }
    }

    void hydrate();

    const timer = setInterval(() => {
      void hydrate();
    }, 8000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const strongestSignal = useMemo(() => {
    return [...items].sort((a, b) => b.confidenceScore - a.confidenceScore)[0] ?? null;
  }, [items]);

  const liveTopOpportunities = useMemo(() => {
    return [...items]
      .sort((a, b) => b.estimatedNetPct - a.estimatedNetPct)
      .slice(0, 3);
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    async function refreshBalance() {
      if (!publicKey) {
        setWalletBalanceSol(null);
        return;
      }

      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) {
          setWalletBalanceSol(lamports / LAMPORTS_PER_SOL);
        }
      } catch {
        if (!cancelled) {
          setWalletBalanceSol(null);
        }
      }
    }

    void refreshBalance();

    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  function providerDot(state: DataHealth["pyth"] | undefined) {
    if (state === "live") {
      return "bg-emerald-400";
    }
    if (state === "degraded") {
      return "bg-amber-300";
    }
    return "bg-rose-400";
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-100">Top Opportunities</h3>
          <button className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-100">View all</button>
        </div>
        <div className="space-y-3">
          {liveTopOpportunities.length > 0
            ? liveTopOpportunities.map((item) => (
              <div key={item.symbol} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div>
                  <div className="font-medium text-zinc-100">{item.symbol}/USDC</div>
                  <div className="text-xs text-zinc-400">Oracle vs Market</div>
                </div>
                <div className="text-right">
                  <div className={"font-semibold " + (item.estimatedNetPct >= 0 ? "text-[#14F195]" : "text-rose-400")}>
                    {item.estimatedNetPct.toFixed(3)}%
                  </div>
                  <div className="text-xs text-zinc-400">Spread {item.spreadPct.toFixed(3)}%</div>
                </div>
              </div>
            ))
            : topOpportunities.map((item) => (
              <div key={item.pair} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div>
                  <div className="font-medium text-zinc-100">{item.pair}</div>
                  <div className="text-xs text-zinc-400">{item.source}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#14F195]">{item.spread}</div>
                  <div className="text-xs text-zinc-400">{item.profit}</div>
                </div>
              </div>
            ))}
        </div>
        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#9945FF]/40 bg-gradient-to-r from-[#9945FF]/20 to-[#00C2FF]/20 px-3 py-2 text-sm font-medium text-zinc-100 hover:from-[#9945FF]/35 hover:to-[#00C2FF]/30"
          onClick={() => {
            const el = document.getElementById("opportunities");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        >
          View All Opportunities
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 text-lg font-semibold text-zinc-100">Trust & Explainability</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-zinc-300">Oracle Health</span>
            <span className="inline-flex items-center gap-2 text-zinc-100">
              <span className={"h-2 w-2 animate-pulse rounded-full " + providerDot(health?.pyth)} />
              {health?.pyth ?? "offline"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-zinc-300">Market Route Health</span>
            <span className="inline-flex items-center gap-2 text-zinc-100">
              <span className={"h-2 w-2 animate-pulse rounded-full " + providerDot(health?.jupiter)} />
              {health?.jupiter ?? "offline"}
            </span>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <div className="mb-1 text-zinc-400">Top Signal</div>
            {strongestSignal ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-100">{strongestSignal.symbol}</span>
                  <span className={"text-xs font-semibold uppercase tracking-[0.1em] " + (strongestSignal.actionable ? "text-[#14F195]" : "text-zinc-500")}>
                    {strongestSignal.signal.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-1 text-xs text-zinc-300">{strongestSignal.rationale}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Confidence {strongestSignal.confidenceScore}/99 · Net {strongestSignal.estimatedNetPct.toFixed(3)}%
                </div>
              </>
            ) : (
              <div className="text-xs text-zinc-500">No live signal available.</div>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500">
            Updated {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "-"} · Cache {health?.cacheAge ?? "-"}s
          </div>

          <div className="space-y-3 pt-2">
            {systemStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm last:border-none last:pb-0">
                <span className="text-zinc-300">{item.name}</span>
                <span className={"font-semibold " + statusToneClass(item.tone)}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-2 text-lg font-semibold text-zinc-100">Wallet</h3>
        {!publicKey ? (
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-400">
            Connect wallet to view live balance.
          </div>
        ) : (
          <>
            <div className="text-sm text-zinc-400">SOL Balance</div>
            <div className="text-3xl font-semibold text-zinc-100">
              {walletBalanceSol === null ? "Loading..." : `${walletBalanceSol.toFixed(4)} SOL`}
            </div>
            <div className="text-xs text-zinc-500 break-all">{publicKey.toBase58()}</div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-2 text-lg font-semibold text-zinc-100">Decision Rules</h3>
        <div className="space-y-2 text-xs text-zinc-400">
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            Simulate when net edge is positive and confidence is elevated.
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            Track if spread is narrow but can flip on minor quote drift.
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            Ignore when fees dominate or liquidity impact is too high.
          </div>
        </div>
      </section>
    </div>
  );
}
