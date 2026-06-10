"use client";

import React from "react";

export default function PoolBars({ yesPool = 0, noPool = 0 }: { yesPool: number; noPool: number }) {
  const total = Math.max(1, yesPool + noPool);
  const yesPct = (yesPool / total) * 100;
  const noPct = 100 - yesPct;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Pool Distribution
      </h3>

      <div className="flex items-center justify-between text-sm font-semibold mb-3">
        <span className="text-emerald-400">YES — {yesPool.toFixed(3)} SOL</span>
        <span className="text-rose-400">NO — {noPool.toFixed(3)} SOL</span>
      </div>

      <div className="w-full h-5 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-300"
          style={{ width: `${yesPct}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-300"
          style={{ width: `${noPct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="text-emerald-500 font-medium">YES {yesPct.toFixed(1)}%</span>
        <span className="text-rose-500 font-medium">NO {noPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}
