"use client";

import { useEffect, useState } from "react";
import { BellRing, ChartNoAxesCombined, LayoutDashboard, Radar, Settings, ShieldAlert, Wallet, Waves, Compass, CandlestickChart } from "lucide-react";
import { navItems } from "./mock-data";

const iconMap = {
  Dashboard: LayoutDashboard,
  Opportunities: Radar,
  Markets: CandlestickChart,
  "Oracle Feeds": Waves,
  Simulation: Compass,
  Portfolio: Wallet,
  Analytics: ChartNoAxesCombined,
  Alerts: ShieldAlert,
  Settings
};

export function AppSidebar() {
  const [activeHash, setActiveHash] = useState("#dashboard");

  useEffect(() => {
    const onHash = () => setActiveHash(window.location.hash || "#dashboard");
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[rgba(6,9,20,0.95)] p-5 lg:flex">
      <div className="mb-8 flex items-center gap-3">
        <img
          src="/arbinexus-logo.jpeg"
          alt="ArbiNexus"
          className="h-14 w-14 rounded-lg shadow-[0_0_30px_rgba(153,69,255,0.45)]"
        />
        <div>
          <div className="text-xl font-semibold text-zinc-100">ArbiNexus</div>
          <div className="text-xs text-zinc-400">Infoaan Arbitrage Infrastructure</div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.label as keyof typeof iconMap] ?? BellRing;
          const active = activeHash === item.href;

          return (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveHash(item.href)}
              className={"group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all " + (active
                ? "bg-gradient-to-r from-[#9945FF]/25 to-[#00C2FF]/15 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(153,69,255,0.35),0_0_30px_rgba(153,69,255,0.15)]"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100")}
            >
              <Icon className={"h-4 w-4 " + (active ? "text-[#14F195]" : "text-zinc-500 group-hover:text-zinc-200")} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1 text-xs text-zinc-500">Network</div>
          <div className="text-sm font-semibold text-zinc-100">Solana Mainnet</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1 text-xs text-zinc-500">SOL Balance</div>
          <div className="text-3xl font-semibold text-zinc-100">12.45 SOL</div>
          <div className="text-xs text-zinc-400">$1,765.32 USD</div>
        </div>
      </div>
    </aside>
  );
}
