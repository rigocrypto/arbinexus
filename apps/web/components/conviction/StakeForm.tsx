"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "../../hooks/useMarket";
import { useConvictionTx } from "../../hooks/useConvictionTx";

export default function StakeForm({ market }: any) {
  const [amount, setAmount] = useState<string>("0.1");
  const [error, setError] = useState<string>("");
  const { publicKey } = useWallet();
  const { stakeLocal } = useConvictionTx();
  const { updateMarket } = useMarket();

  const disabled = Date.now() >= new Date(market.deadline).getTime() || market.status !== "open";
  const [mockConnected, setMockConnected] = useState<boolean>(!!(typeof window !== "undefined" && (window as any).__ARBI_PUBLIC_KEY));

  useEffect(() => {
    const on = () => setMockConnected(!!(window as any).__ARBI_PUBLIC_KEY);
    window.addEventListener("arbi:mockConnect", on);
    window.addEventListener("arbi:mockDisconnect", on);
    return () => {
      window.removeEventListener("arbi:mockConnect", on);
      window.removeEventListener("arbi:mockDisconnect", on);
    };
  }, []);

  const connected = !!(publicKey || mockConnected);

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
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Place Your Conviction Stake</h3>

      <div className="text-sm text-gray-600 mb-3">
        Amount of SOL to stake:
      </div>
      <input
        className="w-full p-2 border rounded mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        step="0.001"
        min="0"
        placeholder="0.1"
      />

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      <div className="flex gap-3">
        <button
          className="flex-1 bg-green-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
          onClick={() => onStake("yes")}
          disabled={disabled || !connected}
        >
          ✓ Stake YES
        </button>

        <button
          className="flex-1 bg-red-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
          onClick={() => onStake("no")}
          disabled={disabled || !connected}
        >
          ✗ Stake NO
        </button>
      </div>

      {!connected && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          Connect wallet via the modal button to stake (wallet button in header).
        </div>
      )}
      {disabled && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
          Staking is closed for this market.
        </div>
      )}
    </div>
  );
}
