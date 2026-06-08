"use client";

import React from "react";

export default function PnlCard({ externalUrl }: { externalUrl?: string }) {
  const url = externalUrl && externalUrl.length > 0 ? externalUrl : "https://pnl.market";
  const isLive = !!externalUrl;

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="text-lg font-semibold">Public Conviction Market</h3>
      <p className="text-sm text-gray-600 mt-2">
        Pitch this project on PNL and let the Solana community stake SOL on whether it ships before the hackathon
        deadline.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          {isLive ? "View Live PNL Market" : "Pitch this Project on PNL"}
        </a>

        {isLive ? (
          <span className="text-sm text-gray-500">Linked PNL market: {url}</span>
        ) : (
          <span className="text-sm text-gray-500">Opens pnl.market to create a public market.</span>
        )}
      </div>
    </div>
  );
}
