"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { convictionConfig } from "../config/conviction.config";

const STORAGE_KEY = "arbinexus_conviction_market_v1";

function normalizeMarket(market: any) {
  const normalized = { ...market };
  normalized.status = String(normalized.status || "open").toLowerCase();

  if (normalized.status !== market.status) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  if (normalized.status === "open" && Date.now() >= new Date(normalized.deadline).getTime()) {
    normalized.status = "closed";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

// NOTE: This hook currently performs localStorage-based mock staking for demo purposes.
// TODO: Replace stakeLocal/resolveLocal/claimLocal with real Anchor program calls
// using the program IDL and `@project-serum/anchor` or `@solana/web3.js` transaction builders.
export function useConvictionTx() {
  const { publicKey } = useWallet();

  const stakeLocal = (marketId: string, side: "yes" | "no", amount: number) => {
    const userPub = publicKey?.toBase58() || (window as any).__ARBI_PUBLIC_KEY;
    if (!userPub) throw new Error("Wallet not connected (or use mock connect)");

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const market = normalizeMarket(JSON.parse(raw));

    if (market.status !== "open") return;

    const lamports = amount;

    if (side === "yes") market.yesPool = (market.yesPool || 0) + lamports;
    else market.noPool = (market.noPool || 0) + lamports;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(market));

    const stakesRaw = localStorage.getItem(`${STORAGE_KEY}_stakes`) || "{}";
    const stakes = JSON.parse(stakesRaw);
    const user = userPub;
    stakes[marketId] = stakes[marketId] || {};
    stakes[marketId][user] = {
      user,
      side,
      amount: (stakes[marketId][user]?.amount || 0) + lamports,
      claimed: false,
    };

    localStorage.setItem(`${STORAGE_KEY}_stakes`, JSON.stringify(stakes));
  };

  const resolveLocal = (marketId: string, winningSide: "yes" | "no") => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const market = normalizeMarket(JSON.parse(raw));
    if (market.id !== marketId) return;
    if (market.status === "resolved") return;

    if (!convictionConfig.demoResolverOverride && Date.now() < new Date(market.deadline).getTime()) {
      throw new Error("Cannot resolve before deadline unless demoResolverOverride is enabled.");
    }

    market.status = "resolved";
    market.winningSide = winningSide === "yes" ? "YES" : "NO";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(market));
  };

  const claimLocal = (marketId: string) => {
    const userPub = publicKey?.toBase58() || (window as any).__ARBI_PUBLIC_KEY;
    if (!userPub) throw new Error("Wallet not connected (or use mock connect)");

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const market = JSON.parse(raw);
    if (market.status !== "resolved") return null;

    const stakesRaw = localStorage.getItem(`${STORAGE_KEY}_stakes`) || "{}";
    const stakes = JSON.parse(stakesRaw);
    const user = userPub;
    const stake = stakes[marketId]?.[user];
    if (!stake || stake.claimed) return null;
    if (stake.side.toUpperCase() !== market.winningSide) return null;

    const winningPool = market.winningSide === "YES" ? market.yesPool : market.noPool;
    const losingPool = market.winningSide === "YES" ? market.noPool : market.yesPool;
    const payout = stake.amount + (winningPool > 0 ? stake.amount * (losingPool / winningPool) : 0);

    stake.claimed = true;
    stakes[marketId][user] = stake;
    localStorage.setItem(`${STORAGE_KEY}_stakes`, JSON.stringify(stakes));

    return { ...stake, payout };
  };

  return { stakeLocal, resolveLocal, claimLocal };
}
