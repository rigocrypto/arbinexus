"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const DEMO_WALLET_KEY = "arbinexus_demo_wallet_v1";

interface DemoWalletContextValue {
  mockPublicKey: string | null;
  mockConnect: () => void;
  mockDisconnect: () => void;
}

const DemoWalletContext = createContext<DemoWalletContextValue>({
  mockPublicKey: null,
  mockConnect: () => {},
  mockDisconnect: () => {},
});

export function DemoWalletProvider({ children }: { children: React.ReactNode }) {
  const [mockPublicKey, setMockPublicKey] = useState<string | null>(null);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_WALLET_KEY);
      if (stored) setMockPublicKey(stored);
    } catch {
      // localStorage not available
    }
  }, []);

  const mockConnect = useCallback(() => {
    const key = "DemoPubKey" + Math.random().toString(36).slice(2, 10);
    try {
      localStorage.setItem(DEMO_WALLET_KEY, key);
    } catch {
      // ignore
    }
    setMockPublicKey(key);
  }, []);

  const mockDisconnect = useCallback(() => {
    try {
      localStorage.removeItem(DEMO_WALLET_KEY);
    } catch {
      // ignore
    }
    setMockPublicKey(null);
  }, []);

  return (
    <DemoWalletContext.Provider value={{ mockPublicKey, mockConnect, mockDisconnect }}>
      {children}
    </DemoWalletContext.Provider>
  );
}

export function useDemoWallet() {
  return useContext(DemoWalletContext);
}
