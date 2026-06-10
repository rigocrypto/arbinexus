"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDemoWallet } from "../../context/DemoWalletContext";

export default function MarketHeader({ market }: any) {
  const { publicKey, connected } = useWallet();
  const deadline = new Date(market.deadline);
  const now = Date.now();
  const remaining = Math.max(0, deadline.getTime() - now);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);

  const statusKey = market.status as "open" | "closed" | "resolved";
  const statusBadge: Record<string, string> = {
    open: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    closed: "bg-slate-700 text-slate-300 border border-slate-600",
    resolved: "bg-violet-500/20 text-violet-300 border border-violet-500/40",
  };
  const badgeClass = statusBadge[statusKey] ?? statusBadge.closed;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white leading-snug lg:text-3xl">
        {market.question}
      </h1>
      <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-2xl">
        {market.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
        </span>

        <span className="text-slate-400">
          <span className="text-slate-300 font-medium">Deadline:</span>{" "}
          {deadline.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>

        <span className="text-slate-400">
          <span className="text-slate-300 font-medium">⏱ Time left:</span>{" "}
          {remaining > 0 ? `${days}d ${hours}h` : "Expired"}
        </span>

        <span className="text-slate-400">
          <span className="text-slate-300 font-medium">Wallet:</span>{" "}
          {connected && publicKey ? (
            <span className="font-mono text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-200">
              {publicKey.toBase58().slice(0, 8)}…{publicKey.toBase58().slice(-8)}
            </span>
          ) : (
            <span className="text-slate-500">Not connected</span>
          )}
          {!connected && <MockConnectButton />}
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <strong className="block mb-2 text-sm text-slate-200 font-semibold">
          ✓ Resolution criteria
        </strong>
        <ul className="space-y-1.5 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            Public demo or deployment link is available before deadline
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            Solana wallet connection works
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            At least one core Solana interaction is functional
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            Public proof (GitHub, demo video, or live app)
          </li>
        </ul>
      </div>
    </div>
  );
}

function MockConnectButton() {
  const { mockPublicKey, mockConnect, mockDisconnect } = useDemoWallet();

  if (mockPublicKey) {
    return (
      <>
        <span className="font-mono text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 ml-1">
          {mockPublicKey.slice(0, 10)}…
        </span>
        <button
          className="ml-2 text-xs text-rose-400 hover:text-rose-300 transition"
          onClick={mockDisconnect}
        >
          Disconnect
        </button>
      </>
    );
  }

  return (
    <button
      className="ml-2 px-3 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition"
      onClick={mockConnect}
    >
      Mock Connect
    </button>
  );
}
