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

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <DashboardTopbar />

          <div className="space-y-4">
            <section id="dashboard" className="scroll-mt-20">
              <HeroSection />
            </section>

            <section id="analytics" className="scroll-mt-20">
              <KpiCards />
            </section>

            <section id="oracle-feeds" className="scroll-mt-20">
              <CoreSignalCards />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <div className="space-y-4">
                <section id="opportunities" className="scroll-mt-20">
                  <OpportunitiesTable />
                </section>

                <section id="markets" className="scroll-mt-20">
                  <MarketCharts />
                </section>
              </div>

              <section id="simulation" className="scroll-mt-20">
                <RightRail />
              </section>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
