"use client";

import { Activity, Cpu, Globe } from "lucide-react";

const cards = [
  {
    icon: Globe,
    label: "Network",
    value: "devnet",
    hint: "Hackathon-safe default"
  },
  {
    icon: Cpu,
    label: "Mode",
    value: "Paper Trade",
    hint: "Execution endpoint starts in simulation mode"
  },
  {
    icon: Activity,
    label: "Core Signal",
    value: "Pyth vs Jupiter",
    hint: "Fair value against executable quote"
  }
];

export function CoreSignalCards() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
              <Icon className="h-4 w-4 text-[#00C2FF]" />
              {card.label}
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{card.value}</div>
            <p className="mt-1 text-sm text-zinc-400">{card.hint}</p>
          </article>
        );
      })}
    </section>
  );
}
