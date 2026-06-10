"use client";

import React, { createContext, useContext } from "react";
import { useMarket } from "../hooks/useMarket";

// Mirror the return type of useMarket so consumers can be swapped without type changes.
type MarketContextValue = ReturnType<typeof useMarket>;

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const market = useMarket();
  return (
    <MarketContext.Provider value={market}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarketContext(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error("useMarketContext must be used inside <MarketProvider>");
  }
  return ctx;
}
