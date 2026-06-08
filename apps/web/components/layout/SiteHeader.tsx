"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isConvictionPage = pathname === "/conviction-market";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 bg-gray-50 border px-3 py-1 rounded hover:bg-gray-100"
          >
            ← Back
          </button>
          <Link
            href="/"
            className="text-sm text-gray-600 bg-gray-50 border px-3 py-1 rounded hover:bg-gray-100"
          >
            Home
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">ArbiNexus</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isConvictionPage ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            Conviction Market
          </span>
        </div>
      </div>
    </header>
  );
}
