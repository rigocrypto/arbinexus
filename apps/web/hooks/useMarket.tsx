"use client";

import { useEffect, useState } from "react";
import { convictionConfig } from "../config/conviction.config";

const STORAGE_KEY = "arbinexus_conviction_market_v1";

function createDefaultMarket() {
  return {
    id: "project-market-1",
    creator: "ArbiNexus",
    question: "Will ArbiNexus launch a working Solana MVP/demo before the Colosseum Hackathon deadline?",
    description:
      "ArbiNexus is testing community conviction around whether the project will ship a working Solana MVP/demo before the hackathon deadline. Users can preview the conviction market in demo mode here, or open the project on PNL for a public market.",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    yesPool: 0,
    noPool: 0,
    status: "open",
    resolver: "",
    winningSide: null,
    externalPnlUrl: convictionConfig.externalPnlUrl || "",
  };
}

function normalizeMarket(market: any) {
  const normalized = { ...createDefaultMarket(), ...market };
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

export function useMarket() {
  const [market, setMarket] = useState<any>(createDefaultMarket());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setMarket(normalizeMarket(JSON.parse(raw)));
      } catch (e) {
        const fallback = createDefaultMarket();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        setMarket(fallback);
      }
    } else {
      const initial = createDefaultMarket();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setMarket(initial);
    }
    setLoading(false);
  }, []);

  const updateMarket = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    setMarket(normalizeMarket(JSON.parse(raw)));
  };

  const resolveMarket = (marketId: string, winningSide: "yes" | "no") => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const storedMarket = normalizeMarket(JSON.parse(raw));
    if (storedMarket.id !== marketId) return;
    if (storedMarket.status === "resolved") return;

    if (!convictionConfig.demoResolverOverride && Date.now() < new Date(storedMarket.deadline).getTime()) {
      throw new Error("Cannot resolve before deadline unless demoResolverOverride is enabled.");
    }

    storedMarket.status = "resolved";
    storedMarket.winningSide = winningSide === "yes" ? "YES" : "NO";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMarket));
    setMarket(storedMarket);
  };

  const resetMarket = () => {
    const fresh = createDefaultMarket();
    localStorage.removeItem(`${STORAGE_KEY}_stakes`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setMarket(fresh);
  };

  const getUserStake = (marketId: string) => {
    const raw = localStorage.getItem(`${STORAGE_KEY}_stakes`);
    if (!raw) return null;
    const stakes = JSON.parse(raw);
    const pub = (window as any).__ARBI_PUBLIC_KEY || null;
    if (!pub) return null;
    return stakes[marketId]?.[pub] || null;
  };

  return { market, loading, updateMarket, getUserStake, resolveMarket, resetMarket };
}
