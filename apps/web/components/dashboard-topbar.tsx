"use client";

import { Bell, ChevronDown, Settings2 } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function DashboardTopbar() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
      <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:border-[#14F195]/50 hover:text-zinc-100">
        <span className="h-2 w-2 rounded-full bg-[#14F195]" />
        Solana Mainnet
        <ChevronDown className="h-4 w-4" />
      </button>

      <button title="Notifications" aria-label="Notifications" className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-zinc-100">
        <Bell className="h-4 w-4" />
      </button>

      <button title="Settings" aria-label="Settings" className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-zinc-100">
        <Settings2 className="h-4 w-4" />
      </button>

      <WalletMultiButton className="!h-10 !rounded-xl !border !border-[#9945FF]/40 !bg-gradient-to-r !from-[#9945FF] !to-[#00C2FF] !px-4 !text-sm !font-semibold !text-white hover:!opacity-90" />
    </div>
  );
}
