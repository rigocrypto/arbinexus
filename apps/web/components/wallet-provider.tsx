"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

  const handleWalletError = (error: Error) => {
    // User-cancelled wallet prompts are expected and should not be treated as app errors.
    if (error.message?.toLowerCase().includes("user rejected")) {
      return;
    }

    console.error("Wallet error:", error);
  };

  // NOTE: For demo stability we don't instantiate adapters here to avoid
  // runtime compatibility issues during development. The wallet modal
  // will be empty until adapters are wired. Use the mock connect button
  // in the market header for demo flows.
  const wallets: any[] = [];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false} onError={handleWalletError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
