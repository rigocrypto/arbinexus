"use client";

import { footerKpis, trendData } from "./mock-data";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MarketCharts() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="card-interactive rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 text-lg font-semibold text-zinc-100">Spread % (SOL)</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                cursor={{ stroke: "rgba(153,69,255,0.35)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "#0e1220",
                  border: "1px solid rgba(153,69,255,0.35)",
                  borderRadius: "12px",
                  color: "#f4f4f5"
                }}
              />
              <Line type="monotone" dataKey="spread" stroke="#9945FF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card-interactive rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 text-lg font-semibold text-zinc-100">Volume Scanned</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e1220",
                  border: "1px solid rgba(20,241,149,0.35)",
                  borderRadius: "12px",
                  color: "#f4f4f5"
                }}
              />
              <defs>
                <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14F195" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#14F195" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="volume" stroke="#14F195" fill="url(#volumeFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="xl:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {footerKpis.map((item, index) => (
          <div key={item.label} className="card-interactive min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-zinc-500">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-3xl">
              {item.value}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{item.delta}</div>
            <div className="mt-4 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.slice(Math.max(0, trendData.length - 6))}>
                  <Line
                    type="monotone"
                    dataKey={index % 2 === 0 ? "pnl" : "winRate"}
                    stroke={index % 2 === 0 ? "#00C2FF" : "#9945FF"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
