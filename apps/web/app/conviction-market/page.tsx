"use client";

import React from "react";
import { SolanaWalletProvider } from "../../components/wallet-provider";
import SiteHeader from "../../components/layout/SiteHeader";
import Footer from "../../components/layout/Footer";
import MarketHeader from "../../components/conviction/MarketHeader";
import PoolBars from "../../components/conviction/PoolBars";
import StakeForm from "../../components/conviction/StakeForm";
import UserStakeInfo from "../../components/conviction/UserStakeInfo";
import PnlCard from "../../components/conviction/PnlCard";
import DemoResolverCard from "../../components/conviction/DemoResolverCard";
import { DemoWalletProvider } from "../../context/DemoWalletContext";
import { MarketProvider, useMarketContext } from "../../context/MarketContext";

function ConvictionMarketContent() {
  const { market, loading } = useMarketContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Loading market…</div>
      </div>
    );
  }

  return (
    <SolanaWalletProvider>
      <div className="min-h-screen bg-[linear-gradient(135deg,#020617_0%,#0f172a_60%,#0c1428_100%)] relative">
        {/* Subtle background glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-900/20 blur-3xl" />
          <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-900/15 blur-3xl" />
        </div>

        <SiteHeader />

        <main className="relative max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Hero card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-sm">
            <MarketHeader market={market} />
          </div>

          {/* Demo mode warning */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
            <span className="text-amber-400 text-base mt-0.5">⚠</span>
            <div>
              <span className="font-semibold text-amber-300">Demo mode:</span>{" "}
              Staking data is simulated locally until the Anchor program is connected.
              No real SOL is transferred inside this app.
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — pool + stake */}
            <div className="lg:col-span-2 space-y-6">
              <PoolBars yesPool={market.yesPool} noPool={market.noPool} />
              <StakeForm market={market} />
            </div>

            {/* Right column — position + pnl + resolver */}
            <div className="space-y-6">
              <UserStakeInfo market={market} />
              <PnlCard externalUrl={market.externalPnlUrl} />
              <DemoResolverCard />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SolanaWalletProvider>
  );
}

export default function ConvictionMarketPage() {
  return (
    <DemoWalletProvider>
      <MarketProvider>
        <ConvictionMarketContent />
      </MarketProvider>
    </DemoWalletProvider>
  );
}
