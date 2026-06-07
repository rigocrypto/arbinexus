"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { convictionConfig } from "../../config/conviction.config";

export default function Footer() {
  const pathname = usePathname();
  const isConvictionPage = pathname === "/conviction-market";

  return (
    <footer className="w-full border-t bg-white mt-8">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
        <div>© {new Date().getFullYear()} ArbiNexus</div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded px-3 py-1 hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            href="/conviction-market"
            className={`rounded px-3 py-1 hover:bg-gray-50 ${
              isConvictionPage ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-600"
            }`}
          >
            Conviction Market
          </Link>
          <a
            href={convictionConfig.externalPnlUrl || "https://pnl.market"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded px-3 py-1 hover:bg-gray-50"
          >
            PNL
          </a>
          {convictionConfig.githubUrl ? (
            <a
              href={convictionConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-3 py-1 hover:bg-gray-50"
            >
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
