"use client";

const statusCards = [
  { label: "API Status", value: "Live" },
  { label: "Network", value: "mainnet-beta" },
  { label: "Price Feeds", value: "Pyth + Jupiter" },
  { label: "Signals", value: "SOL / ETH" },
  { label: "Stable Tag", value: "v1.0.0-stable" },
  { label: "Conviction Market", value: "Demo Mode" },
];

const ctaButtons = [
  { label: "Open Dashboard", href: "/", style: "gradient" as const },
  { label: "Conviction Market", href: "/conviction-market", style: "outline" as const },
  { label: "Open API", href: "https://arbinexus-api.vercel.app", style: "outline" as const, external: true },
  { label: "Prices API", href: "https://arbinexus-api.vercel.app/prices", style: "green" as const, external: true },
  { label: "Opportunities API", href: "https://arbinexus-api.vercel.app/opportunities", style: "cyan" as const, external: true },
];

function buttonClass(style: "gradient" | "outline" | "green" | "cyan") {
  if (style === "gradient") {
    return "rounded-lg bg-gradient-to-r from-[#9945FF]/80 to-[#00C2FF]/80 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90";
  }
  if (style === "green") {
    return "rounded-lg border border-[#14F195]/40 bg-[#14F195]/10 px-4 py-2 text-sm font-semibold text-[#14F195] transition hover:bg-[#14F195]/20";
  }
  if (style === "cyan") {
    return "rounded-lg border border-[#00C2FF]/40 bg-[#00C2FF]/10 px-4 py-2 text-sm font-semibold text-[#00C2FF] transition hover:bg-[#00C2FF]/20";
  }
  return "rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/10";
}

export function HeroSection() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(153,69,255,0.12),rgba(0,194,255,0.08)_45%,rgba(20,241,149,0.06))] p-7">
        <div className="absolute -left-20 top-2 h-52 w-52 rounded-full bg-[#9945FF]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#00C2FF]/15 blur-3xl" />

        <div className="relative max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-zinc-100 lg:text-5xl">
            ArbiNexus — Live Solana{" "}
            <span className="bg-gradient-to-r from-[#14F195] to-[#00C2FF] bg-clip-text text-transparent">
              Arbitrage Intelligence
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-zinc-300">
            Production API is live on mainnet-beta with Pyth + Jupiter price feeds, real-time opportunity scoring, and a Conviction Market demo for the Solana Colosseum Hackathon.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-3">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur"
            >
              <div className="text-xs text-zinc-400">{card.label}</div>
              <div className="text-sm font-semibold text-zinc-100">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          {ctaButtons.map((btn) => (
            <a
              key={btn.label}
              href={btn.href}
              className={buttonClass(btn.style)}
              {...(btn.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {btn.label}
            </a>
          ))}
        </div>

        <p className="relative mt-4 text-xs text-zinc-500">
          <span className="text-zinc-400">arbinexus-web.vercel.app</span> = visual dashboard
          &nbsp;·&nbsp;
          <span className="text-zinc-400">arbinexus-api.vercel.app</span> = JSON API backend
        </p>
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
