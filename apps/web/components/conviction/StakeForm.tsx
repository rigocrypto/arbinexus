"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConvictionTx } from "../../hooks/useConvictionTx";
import { useDemoWallet } from "../../context/DemoWalletContext";
import { useMarketContext } from "../../context/MarketContext";

export default function StakeForm({ market }: any) {
  const [amount, setAmount] = useState<string>("0.1");
  const [error, setError] = useState<string>("");
  const { publicKey } = useWallet();
  const { stakeLocal } = useConvictionTx();
  const { updateMarket } = useMarketContext();

  const { mockPublicKey } = useDemoWallet();
  const disabled = Date.now() >= new Date(market.deadline).getTime() || market.status !== "open";
  const connected = !!(publicKey || mockPublicKey);

  const onStake = async (side: "yes" | "no") => {
    setError("");
    const sol = parseFloat(amount) || 0;
    if (sol <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!connected) {
      setError("Wallet not connected");
      return;
    }
    try {
      stakeLocal(market.id, side, sol);
      updateMarket();
      setAmount("0.1");
      console.log(`Staked ${sol} SOL on ${side.toUpperCase()} (mock)`);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-white mb-5">Place Your Conviction Stake</h3>

      <label className="block text-sm text-slate-400 mb-2">
        Amount of SOL to stake
      </label>
      <input
        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4 transition"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        step="0.001"
        min="0"
        placeholder="0.1"
      />

      {error && (
        <div className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
          onClick={() => onStake("yes")}
          disabled={disabled || !connected}
        >
          ✓ Stake YES
        </button>
        <button
          type="button"
          className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
          onClick={() => onStake("no")}
          disabled={disabled || !connected}
        >
          ✗ Stake NO
        </button>
      </div>

      {!connected && (
        <div className="mt-4 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400">
          Connect wallet via the header button to stake.
        </div>
      )}
      {disabled && (
        <div className="mt-4 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-500">
          Staking is closed for this market.
        </div>
      )}
    </div>
  );
}
