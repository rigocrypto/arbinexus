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
      <a
        href="https://docs.google.com/document/d/1IAtaavGbsZUqsc8mlG6DQvJF13wl1W3P4xfAvNqsygk/edit?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-blue-200 hover:bg-white/10 transition"
        title="View Submission Google Doc"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm6 1.414L18.586 10H14a2 2 0 0 1-2-2V3.414zM6 4h5v4a4 4 0 0 0 4 4h4v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4zm2 10v2h8v-2H8z"/></svg>
        <span className="hidden sm:inline">Google Doc</span>
      </a>
      <a
        href="https://github.com/rigocrypto/arbinexus"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
        title="View on GitHub"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.089 2.91.833.092-.647.35-1.09.636-1.341-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z" /></svg>
        <span className="hidden sm:inline">GitHub</span>
      </a>
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
