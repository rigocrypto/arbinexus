"use client";

import { AppSidebar } from "../components/app-sidebar";
import { CoreSignalCards } from "../components/core-signal-cards";
import { DashboardTopbar } from "../components/dashboard-topbar";
import { HeroSection } from "../components/hero-section";
import { KpiCards } from "../components/kpi-cards";
import { MarketCharts } from "../components/market-charts";
import { OpportunitiesTable } from "../components/opportunities-table";
import { RightRail } from "../components/right-rail";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#060a16] text-zinc-100">
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex-1 p-4 md:p-6">
          <DashboardTopbar />

          <div className="space-y-4">
            <HeroSection />
            <KpiCards />
            <CoreSignalCards />

            <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4">
                <OpportunitiesTable />
                <MarketCharts />
              </div>

              <RightRail />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
