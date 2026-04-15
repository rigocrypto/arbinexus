"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Settings2 } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function DashboardTopbar() {
  const [mounted, setMounted] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
      <button className="inline-flex cursor-default items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300" title="Data sources use live market endpoints; execution remains devnet-safe">
        <span className="h-2 w-2 rounded-full bg-[#14F195]" />
        Solana Mainnet
        <ChevronDown className="h-4 w-4" />
      </button>

      <div className="relative">
        <button title="Notifications" aria-label="Notifications" onClick={() => { setShowNotif(!showNotif); setShowSettings(false); }} className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-zinc-100">
          <Bell className="h-4 w-4" />
        </button>
        {showNotif && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-xs text-zinc-400 shadow-xl">
            No new alerts. Threshold-based alerts coming soon.
          </div>
        )}
      </div>

      <div className="relative">
        <button title="Settings" aria-label="Settings" onClick={() => { setShowSettings(!showSettings); setShowNotif(false); }} className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-zinc-100">
          <Settings2 className="h-4 w-4" />
        </button>
        {showSettings && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-xs text-zinc-400 shadow-xl">
            Execution threshold & fee config coming soon.
          </div>
        )}
      </div>

      {mounted && (
        <WalletMultiButton className="!h-10 !rounded-xl !border !border-[#9945FF]/40 !bg-gradient-to-r !from-[#9945FF] !to-[#00C2FF] !px-4 !text-sm !font-semibold !text-white hover:!opacity-90" />
      )}
    </div>
  );
}
