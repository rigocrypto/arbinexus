"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMarket } from "../../hooks/useMarket";
import { useConvictionTx } from "../../hooks/useConvictionTx";

export default function UserStakeInfo({ market }: any) {
  const { publicKey } = useWallet();
  const { getUserStake, updateMarket } = useMarket();
  const { claimLocal } = useConvictionTx();
  const [effectivePub, setEffectivePub] = useState<string | null>(publicKey ? publicKey.toBase58() : (window as any).__ARBI_PUBLIC_KEY || null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const on = () => setEffectivePub(publicKey ? publicKey.toBase58() : (window as any).__ARBI_PUBLIC_KEY || null);
    window.addEventListener("arbi:mockConnect", on);
    window.addEventListener("arbi:mockDisconnect", on);
    return () => {
      window.removeEventListener("arbi:mockConnect", on);
      window.removeEventListener("arbi:mockDisconnect", on);
    };
  }, [publicKey]);

  useEffect(() => {
    setMessage(null);
  }, [market.status, effectivePub]);

  const stake = effectivePub ? getUserStake(market.id) : null;
  const isResolved = market.status === "resolved";
  const isWinner = !!stake && isResolved && stake.side.toUpperCase() === market.winningSide;
  const canClaim = isWinner && !stake?.claimed;

  const estimatedPayout = () => {
    if (!stake) return "—";
    const winningPool = stake.side === "yes" ? market.yesPool : market.noPool;
    const losingPool = stake.side === "yes" ? market.noPool : market.yesPool;
    if (winningPool === 0) return "—";
    const payout = stake.amount + stake.amount * (losingPool / winningPool);
    return payout.toFixed(3) + " SOL";
  };

  const onClaim = () => {
    setMessage(null);
    try {
      const result = claimLocal(market.id);
      if (!result) {
        setMessage("No claim available. Make sure you staked on the winning side and the market is resolved.");
        return;
      }
      updateMarket();
      setMessage(`Claimed ${result.payout?.toFixed(3) || stake?.amount.toFixed(3)} SOL`);
    } catch (e: any) {
      setMessage(String(e));
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Your Position</h3>
      {stake ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Side:</span>
            <span className={`font-semibold ${stake.side === "yes" ? "text-green-600" : "text-red-600"}`}>
              {stake.side.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">{stake.amount.toFixed(3)} SOL</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-600">Est. Payout (if win):</span>
            <span className="font-semibold text-green-600">{estimatedPayout()}</span>
          </div>

          {isResolved && !stake.claimed && isWinner && (
            <button
              className="w-full mt-4 bg-indigo-600 text-white rounded px-3 py-2 hover:bg-indigo-700"
              onClick={onClaim}
            >
              Claim payout
            </button>
          )}

          {stake.claimed && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              ✓ Claimed
            </div>
          )}

          {isResolved && !isWinner && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
              Market resolved {market.winningSide}. Your stake did not win.
            </div>
          )}

          {message && (
            <div className="mt-2 text-sm text-gray-700">{message}</div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          {effectivePub ? "You have not staked yet." : "Connect wallet to view your position."}
        </div>
      )}
    </div>
  );
}
