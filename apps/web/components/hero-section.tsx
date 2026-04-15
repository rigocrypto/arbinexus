"use client";

import { heroStats } from "./mock-data";

export function HeroSection() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(153,69,255,0.12),rgba(0,194,255,0.08)_45%,rgba(20,241,149,0.06))] p-7">
        <div className="absolute -left-20 top-2 h-52 w-52 rounded-full bg-[#9945FF]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#00C2FF]/15 blur-3xl" />

        <div className="relative max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-zinc-100 lg:text-5xl">
            Oracle-Informed Arbitrage Infrastructure for <span className="bg-gradient-to-r from-[#14F195] to-[#00C2FF] bg-clip-text text-transparent">Solana</span>
          </h1>
          <p className="mt-3 max-w-xl text-zinc-300">
            Detect spread opportunities between oracle fair value and real executable market routes, then simulate or execute with confidence.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
              <div className="text-xs text-zinc-400">{stat.label}</div>
              <div className="text-xl font-semibold text-zinc-100">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#111427] to-[#0a0d18] p-6 xl:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_20%,rgba(153,69,255,0.28),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_80%,rgba(0,194,255,0.24),transparent_40%)]" />
        <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#14F195]/20" />
        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9945FF]/35 shadow-[0_0_40px_rgba(153,69,255,0.5)]" />
        <div className="absolute left-1/2 top-[56%] h-6 w-40 -translate-x-1/2 rounded-full bg-[#9945FF]/35 blur-lg" />
        <div className="absolute left-1/2 top-[43%] h-16 w-16 -translate-x-1/2 -rotate-12 rounded-xl bg-gradient-to-br from-[#14F195] via-[#00C2FF] to-[#9945FF] shadow-[0_0_45px_rgba(20,241,149,0.35)]" />
      </div>
    </section>
  );
}
