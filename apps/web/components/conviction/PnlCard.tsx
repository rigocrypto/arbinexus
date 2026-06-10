"use client";

import React from "react";

export default function PnlCard({ externalUrl }: { externalUrl?: string }) {
  const url = externalUrl && externalUrl.length > 0 ? externalUrl : "https://pnl.market";
  const isLive = !!externalUrl;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-white">Public Conviction Market</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Pitch this project on PNL and let the Solana community stake SOL on whether it ships before the hackathon deadline.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          {isLive ? "View Live PNL Market" : "Pitch this Project on PNL"}
          <span className="text-xs opacity-70">↗</span>
        </a>
        <p className="text-xs text-slate-500">
          {isLive ? `Linked: ${url}` : "Opens pnl.market to create a public conviction market."}
        </p>
      </div>
    </div>
  );
}
