"use client";

import { Fragment, useEffect, useState } from "react";
import type { DataHealth, Opportunity, SimulateResponse } from "@arbinexus/types";
import { Panel } from "@arbinexus/ui";

const ACTION_STATE_STORAGE_KEY = "arbinexus-row-actions";

interface OpportunitiesResponse {
  status?: "ok" | "degraded";
  message?: string;
  updatedAt?: string;
  health?: DataHealth;
  items?: Opportunity[];
  opportunities?: Opportunity[];
}

type DecisionAction = "simulate" | "track" | "ignore";

function confidenceBarWidthClass(score: number) {
  if (score >= 85) {
    return "w-full";
  }
  if (score >= 70) {
    return "w-4/5";
  }
  if (score >= 55) {
    return "w-3/5";
  }
  if (score >= 35) {
    return "w-2/5";
  }
  return "w-1/5";
}

export function OpportunitiesTable() {
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<"ok" | "degraded">("ok");
  const [health, setHealth] = useState<DataHealth | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [profitableOnly, setProfitableOnly] = useState(false);
  const [rowActionState, setRowActionState] = useState<Record<string, "Tracked" | "Ignored">>({});
  const [simulatingSymbol, setSimulatingSymbol] = useState<string | null>(null);
  const [simResults, setSimResults] = useState<Record<string, SimulateResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(ACTION_STATE_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      setRowActionState(JSON.parse(stored) as Record<string, "Tracked" | "Ignored">);
    } catch {
      window.localStorage.removeItem(ACTION_STATE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACTION_STATE_STORAGE_KEY, JSON.stringify(rowActionState));
  }, [rowActionState]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;
    const hydrate = () =>
      fetch(`${baseUrl}/opportunities`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<OpportunitiesResponse>;
        })
        .then((data) => {
          setRows(data.opportunities ?? data.items ?? []);
          setStatus(data.status ?? "ok");
          setHealth(data.health ?? null);
          setMessage(data.message ?? null);
          setUpdatedAt(data.updatedAt ?? null);
        })
        .catch((err) => {
          console.warn("Opportunities fetch failed:", err.message);
        })
        .finally(() => setLoading(false));

    void hydrate();

    const stream = new EventSource(`${baseUrl}/stream/opportunities`);
    stream.onmessage = (event) => {
      const payload = JSON.parse(event.data) as OpportunitiesResponse;
      setRows(payload.opportunities ?? payload.items ?? []);
      setStatus(payload.status ?? "ok");
      setHealth(payload.health ?? null);
      setMessage(payload.message ?? null);
      setUpdatedAt(payload.updatedAt ?? null);
      setLoading(false);
    };
    stream.onerror = () => {
      stream.close();
      if (!fallbackTimer) {
        fallbackTimer = setInterval(() => {
          void hydrate();
        }, 15_000);
      }
    };

    return () => {
      stream.close();
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const secondsAgo = updatedAt ? Math.max(0, Math.floor((now - new Date(updatedAt).getTime()) / 1000)) : null;

  const visibleRows = profitableOnly ? rows.filter((row) => row.actionable) : rows;

  function providerToneClass(state: DataHealth["pyth"] | undefined) {
    if (state === "live") {
      return "bg-emerald-500";
    }
    if (state === "degraded") {
      return "bg-amber-400";
    }
    return "bg-rose-500";
  }

  function primaryDecisionForRow(row: Opportunity): DecisionAction {
    if (row.actionable) {
      return "simulate";
    }
    if (Math.abs(row.estimatedNetPct) < 0.18) {
      return "track";
    }
    return "ignore";
  }

  async function handleRowAction(row: Opportunity) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const action = primaryDecisionForRow(row);

    if (action === "simulate") {
      setSimulatingSymbol(row.symbol);

      try {
        const response = await fetch(`${baseUrl}/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: row.symbol, amountUsd: 1000 })
        });

        if (!response.ok) {
          throw new Error("Simulation request failed");
        }

        const payload = (await response.json()) as SimulateResponse;
        setSimResults((previous) => ({ ...previous, [row.symbol]: payload }));
      } catch {
        setSimResults((previous) => ({
          ...previous,
          [row.symbol]: {
            symbol: row.symbol,
            estimatedGrossUsd: 0,
            estimatedFeeUsd: 0,
            estimatedNetUsd: 0,
            note: "Simulation unavailable right now."
          }
        }));
      } finally {
        setSimulatingSymbol(null);
      }

      return;
    }

    setRowActionState((previous) => {
      // If already Ignored, clicking again will remove the Ignored state (undo)
      if (previous[row.symbol] === "Ignored") {
        const { [row.symbol]: _, ...rest } = previous;
        return rest;
      }
      return {
        ...previous,
        [row.symbol]: action === "track" ? "Tracked" : "Ignored"
      };
    });
  }

  function actionLabel(row: Opportunity) {
    const decision = primaryDecisionForRow(row);
    if (decision === "simulate") {
      return "Simulate Trade";
    }
    if (decision === "track") {
      return rowActionState[row.symbol] === "Tracked" ? "Tracked" : "Track";
    }
    return rowActionState[row.symbol] === "Ignored" ? "Ignored" : "Ignore";
  }

  function actionClass(row: Opportunity) {
    const decision = primaryDecisionForRow(row);
    if (decision === "simulate") {
      return "border-[#14F195]/40 bg-[#14F195]/10 text-[#14F195] hover:bg-[#14F195]/20";
    }
    if (decision === "track") {
      return "border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#00C2FF] hover:bg-[#00C2FF]/20";
    }
    return "border-zinc-700 bg-white/5 text-zinc-400 hover:bg-white/10";
  }

  if (loading) {
    return (
      <Panel>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-10 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className={"inline-flex items-center gap-2 rounded-full px-2 py-1 " + (status === "ok" ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300")}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
          {status === "ok" ? "Live Data" : "Fallback Data"}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            <span className={"h-2 w-2 animate-pulse rounded-full " + providerToneClass(health?.pyth)} />
            Pyth {health?.pyth ?? "offline"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            <span className={"h-2 w-2 animate-pulse rounded-full " + providerToneClass(health?.jupiter)} />
            Jupiter {health?.jupiter ?? "offline"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">
            {secondsAgo !== null ? `Updated ${secondsAgo}s ago` : "Waiting for first update"}
          </span>
          {health ? <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1">Cache {health.cacheAge}s</span> : null}
        </div>
      </div>

      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setProfitableOnly((value) => !value)}
          className={"rounded-md border px-2 py-1 text-xs transition " + (profitableOnly
            ? "border-[#9945FF]/45 bg-[#9945FF]/15 text-[#00C2FF]"
            : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100")}
        >
          {profitableOnly ? "Showing: Actionable Only" : "Showing: All Signals"}
        </button>
      </div>

      {message ? <div className="mb-3 text-xs text-amber-300">{message}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="pb-2">Asset</th>
              <th className="pb-2">Oracle</th>
              <th className="pb-2">Market</th>
              <th className="pb-2">Spread %</th>
              <th className="pb-2">Net %</th>
              <th className="pb-2">Signal</th>
              <th className="pb-2">Confidence</th>
              <th className="pb-2">Rationale</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const simulation = simResults[row.symbol];

              return (
              <Fragment key={row.symbol}>
                <tr className="border-b border-zinc-900/80 transition hover:bg-white/[0.03]">
                  <td className="py-3 font-medium text-zinc-100">{row.symbol}</td>
                  <td className="py-3 text-zinc-300">${row.oraclePrice.toFixed(4)}</td>
                  <td className="py-3 text-zinc-300">${row.marketPrice.toFixed(4)}</td>
                  <td className={"py-3 " + (row.spreadPct >= 0 ? "text-[#14F195]" : "text-rose-400")}>{row.spreadPct.toFixed(3)}%</td>
                  <td className={"py-3 " + (row.estimatedNetPct >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {row.estimatedNetPct.toFixed(3)}%
                  </td>
                  <td className={"py-3 text-xs font-semibold uppercase tracking-[0.12em] " + (row.actionable ? "text-[#14F195]" : "text-zinc-500")}>{row.signal.replaceAll("_", " ")}</td>
                  <td className="py-3">
                    <div className="mb-1 text-xs text-zinc-300">{row.confidenceScore}/99</div>
                    <div className="h-1.5 w-20 rounded-full bg-white/10">
                      <div className={"h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] " + confidenceBarWidthClass(row.confidenceScore)} />
                    </div>
                  </td>
                  <td className="py-3 text-xs text-zinc-400">{row.rationale}</td>
                  <td className="py-3">
                    <button
                      className={"rounded-md border px-2 py-1 text-xs transition " + actionClass(row)}
                      onClick={() => void handleRowAction(row)}
                      disabled={simulatingSymbol === row.symbol}
                    >
                      {simulatingSymbol === row.symbol ? "Running..." : actionLabel(row)}
                    </button>
                  </td>
                </tr>

                {simulation ? (
                  <tr className="border-b border-zinc-900/80 bg-white/[0.02]">
                    <td colSpan={9} className="px-3 py-2 text-xs text-zinc-300">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>Entry: <strong className="text-zinc-100">${simulation.entryPrice?.toFixed(4) ?? "-"}</strong></span>
                        <span>Target: <strong className="text-zinc-100">${simulation.oracleTarget?.toFixed(4) ?? "-"}</strong></span>
                        <span>Net: <strong className={(simulation.netPct ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>{simulation.netPct?.toFixed(3) ?? "0.000"}%</strong></span>
                        <span>Est. Return: <strong className={(simulation.estimatedProfitUsd ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>${simulation.estimatedProfitUsd?.toFixed(2) ?? "0.00"}</strong></span>
                        <span className="text-zinc-500">{simulation.route ?? "Jupiter best route"}</span>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
