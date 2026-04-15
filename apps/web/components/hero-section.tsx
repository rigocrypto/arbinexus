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

      <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#111427] to-[#0a0d18] xl:block">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="/solana-logo.mp4"
        />
      </div>
    </section>
  );
}
