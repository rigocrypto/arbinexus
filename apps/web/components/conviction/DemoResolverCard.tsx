"use client";

import React, { useState } from "react";
import { convictionConfig } from "../../config/conviction.config";
import { useMarketContext } from "../../context/MarketContext";

export default function DemoResolverCard() {
  const { market, loading, updateMarket, resolveMarket, resetMarket } = useMarketContext();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading || !market) return null;

  const deadline = new Date(market.deadline).getTime();
  const now = Date.now();
  const overrideEnabled = convictionConfig.demoResolverOverride === true;
  const canResolve = overrideEnabled || now >= deadline;
  const isResolved = market.status === "resolved";

  const onResolve = async (side: "yes" | "no") => {
    setError(null);
    if (!canResolve) {
      setError("Cannot resolve before deadline unless demoResolverOverride is enabled.");
      return;
    }
    setBusy(true);
    try {
      resolveMarket(market.id, side);
      updateMarket();
    } catch (e: any) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const onReset = () => {
    setError(null);
    setBusy(true);
    try {
      resetMarket();
      updateMarket();
    } catch (e: any) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-white">Demo Resolver</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Simulate market resolution for demo purposes. In production, an Anchor program handles resolution.
      </p>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <span className="font-semibold text-slate-200 uppercase tracking-wide">
            {market.status}
          </span>
        </div>
        {isResolved && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Winner:</span>
            <span className={`font-bold ${market.winningSide === "YES" ? "text-emerald-400" : "text-rose-400"}`}>
              {market.winningSide}
            </span>
          </div>
        )}
        {overrideEnabled && (
          <div className="inline-flex items-center rounded-lg bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-xs text-amber-300 font-medium">
            ⚡ Override enabled for demo testing
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition"
          onClick={() => onResolve("yes")}
          disabled={busy || !canResolve || isResolved}
        >
          Resolve YES
        </button>
        <button
          className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition"
          onClick={() => onResolve("no")}
          disabled={busy || !canResolve || isResolved}
        >
          Resolve NO
        </button>
      </div>

      <button
        className="mt-3 w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        onClick={onReset}
        disabled={busy}
      >
        Reset Demo Market
      </button>

      {!canResolve && !overrideEnabled && (
        <p className="mt-3 text-xs text-slate-500">
          Resolution is locked until the deadline.
        </p>
      )}

      <p className="mt-3 text-xs text-slate-600">
        Demo-only: no real SOL is transferred. Updates local mock state only.
      </p>
    </div>
  );
}
