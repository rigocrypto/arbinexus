"use client";

import React from "react";

export default function PoolBars({ yesPool = 0, noPool = 0 }: { yesPool: number; noPool: number }) {
  const total = Math.max(1, yesPool + noPool);
  const yesPct = (yesPool / total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <div>YES — {yesPool.toFixed(3)} SOL</div>
        <div>NO — {noPool.toFixed(3)} SOL</div>
      </div>

      <div className="w-full bg-gray-200 rounded h-6 overflow-hidden">
        <div
          className="h-6 bg-green-500"
          style={{ width: `${yesPct}%`, transition: "width 300ms ease" }}
        />
      </div>

      <div className="mt-2 text-xs text-gray-600">YES {yesPct.toFixed(1)}% • NO {(100 - yesPct).toFixed(1)}%</div>
    </div>
  );
}
