"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConvictionTx } from "../../hooks/useConvictionTx";
import { useDemoWallet } from "../../context/DemoWalletContext";
import { useMarketContext } from "../../context/MarketContext";

export default function UserStakeInfo({ market }: any) {
  const { publicKey } = useWallet();
  const { mockPublicKey } = useDemoWallet();
  const { getUserStake, updateMarket } = useMarketContext();
  const { claimLocal } = useConvictionTx();
  const effectivePub = publicKey?.toBase58() ?? mockPublicKey;
  const [message, setMessage] = useState<string | null>(null);

  const stake = getUserStake(market.id, effectivePub);
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
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-white mb-5">Your Position</h3>
      {stake ? (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Side</span>
            <span className={`font-bold text-base ${stake.side === "yes" ? "text-emerald-400" : "text-rose-400"}`}>
              {stake.side.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Amount</span>
            <span className="font-semibold text-white">{stake.amount.toFixed(3)} SOL</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <span className="text-slate-400">Est. Payout (if win)</span>
            <span className="font-semibold text-emerald-400">{estimatedPayout()}</span>
          </div>

          {canClaim && (
            <button
              className="w-full mt-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg transition"
              onClick={onClaim}
            >
              Claim Payout
            </button>
          )}

          {stake.claimed && (
            <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-300">
              ✓ Payout claimed
            </div>
          )}

          {isResolved && !isWinner && (
            <div className="mt-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400">
              Market resolved {market.winningSide}. Your stake did not win.
            </div>
          )}

          {message && (
            <div className="mt-2 text-sm text-slate-300">{message}</div>
          )}
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          {effectivePub ? "You have not staked yet." : "Connect wallet to view your position."}
        </div>
      )}
    </div>
  );
}
