"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { convictionConfig } from "../../config/conviction.config";

export default function Footer() {
  const pathname = usePathname();
  const isConvictionPage = pathname === "/conviction-market";

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-8">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
        <div>© {new Date().getFullYear()} ArbiNexus</div>
        <div className="flex flex-wrap items-center gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Home
          </Link>
          <Link
            href="/conviction-market"
            className={`rounded-lg px-3 py-1 transition ${
              isConvictionPage
                ? "bg-violet-500/20 text-violet-300 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Conviction Market
          </Link>
          <a
            href={convictionConfig.externalPnlUrl || "https://pnl.market"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            PNL
          </a>
          {convictionConfig.githubUrl ? (
            <a
              href={convictionConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
