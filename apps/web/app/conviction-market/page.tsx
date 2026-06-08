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

  if (loading) return <div className="p-8">Loading market…</div>;

  return (
    <SolanaWalletProvider>
      <SiteHeader />
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <MarketHeader market={market} />
          </div>
        </div>

        <div className="mt-6">
          <PoolBars yesPool={market.yesPool} noPool={market.noPool} />
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
          <strong>Demo mode:</strong> Staking data is simulated locally until the Anchor program is connected.
          No real SOL is transferred inside this app yet.
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StakeForm market={market} />
            <div className="mt-4">
              <UserStakeInfo market={market} />
            </div>
          </div>

          <div>
            <PnlCard externalUrl={market.externalPnlUrl} />
            <DemoResolverCard />
          </div>
        </div>
      </div>
      <Footer />
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


