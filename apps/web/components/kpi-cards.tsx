"use client";

import React from "react";
import { Activity, Gauge, Layers, Target } from "lucide-react";

const cards = [
  { label: "Total Opportunities", value: 24, unit: "", icon: Layers, color: "text-[#14F195]" },
  { label: "Avg Spread", value: 0.73, unit: "%", icon: Activity, color: "text-[#9945FF]" },
  { label: "Total Volume", value: 2.14, unit: "M", icon: Gauge, color: "text-[#00C2FF]" },
  { label: "Success Rate", value: 87.6, unit: "%", icon: Target, color: "text-[#14F195]" }
];

function useAnimatedValue(target: number) {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 900;

    const step = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setValue(target * progress);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

function AnimatedMetric({ value, unit }: { value: number; unit: string }) {
  const animated = useAnimatedValue(value);

  if (unit === "M") {
    return <>{`$${animated.toFixed(2)}M`}</>;
  }

  return <>{`${animated.toFixed(unit === "%" ? 2 : 0)}${unit}`}</>;
}

export function KpiCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#9945FF]/50 hover:bg-white/[0.05]"
          >
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{card.label}</span>
              <Icon className={"h-4 w-4 " + card.color} />
            </div>
            <div className={"text-2xl font-semibold " + card.color}><AnimatedMetric value={card.value} unit={card.unit} /></div>
          </div>
        );
      })}
    </section>
  );
}
