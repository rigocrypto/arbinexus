"use client";

import React, { useState } from "react";
import { useMarket } from "../../hooks/useMarket";
import { convictionConfig } from "../../config/conviction.config";

export default function DemoResolverCard() {
  const { market, loading, updateMarket, resolveMarket, resetMarket } = useMarket();
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
    <div className="p-4 border rounded bg-white shadow-sm mt-4">
      <h3 className="text-lg font-semibold">Demo Resolver</h3>
      <p className="mt-2 text-sm text-gray-600">
        This demo-only resolver lets you simulate how the market would be resolved after the deadline. In production, resolution will be handled by the Anchor program and authorized resolver logic.
      </p>

      <div className="mt-4 text-sm text-gray-700 space-y-2">
        <div>
          <span className="font-semibold">Market status:</span> {market.status.toUpperCase()}
        </div>
        {isResolved && (
          <div>
            <span className="font-semibold">Winning side:</span> {market.winningSide}
          </div>
        )}
        {overrideEnabled && (
          <div className="inline-flex items-center rounded bg-yellow-50 border border-yellow-200 px-2 py-1 text-xs text-yellow-700">
            Override enabled for demo testing.
          </div>
        )}
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          className="flex-1 bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onResolve("yes")}
          disabled={busy || !canResolve || isResolved}
        >
          Resolve YES
        </button>
        <button
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onResolve("no")}
          disabled={busy || !canResolve || isResolved}
        >
          Resolve NO
        </button>
      </div>

      <button
        className="mt-4 w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onReset}
        disabled={busy}
      >
        Reset Demo Market
      </button>

      {!canResolve && !overrideEnabled && (
        <div className="mt-3 text-xs text-gray-500">
          Resolution is locked until the deadline.
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Demo-only: no real SOL is transferred or claimed. This only updates local mock state.
      </div>
    </div>
  );
}
