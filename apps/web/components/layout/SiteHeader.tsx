"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isConvictionPage = pathname === "/conviction-market";

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition"
          >
            ← Back
          </button>
          <Link
            href="/"
            className="text-sm text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition"
          >
            Home
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">ArbiNexus</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium border ${
              isConvictionPage
                ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            Conviction Market
          </span>
        </div>
      </div>
    </header>
  );
}
