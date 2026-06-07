"use client";

import dynamic from "next/dynamic";

const SolanaWalletProvider = dynamic(
  () => import("./wallet-provider").then((mod) => mod.SolanaWalletProvider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
