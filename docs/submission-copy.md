# ArbiNexus Submission Copy

## Project Title
ArbiNexus

## Tagline
Oracle-Informed Price Dislocation Intelligence for Solana

## One-Line Pitch
ArbiNexus detects oracle-to-market price dislocations and surfaces potentially actionable trade signals using Pyth fair value, Jupiter executable quotes, and confidence-aware filtering.

## 50-Word Description
ArbiNexus is a Solana-native signal intelligence layer that compares Pyth oracle fair value with executable Jupiter market quotes to detect price dislocations, filter noise using confidence intervals, and simulate trade decisions before any capital is deployed. It surfaces decision-ready explanations, not just raw prices.

## 150-Word Description
ArbiNexus is a Solana-native signal intelligence layer that compares **Pyth oracle fair value** with **executable Jupiter market quotes** to detect price dislocations, filter noise using confidence intervals, and simulate trade decisions before any capital is deployed.

Rather than showing raw prices alone, ArbiNexus asks a more useful question: **When is the executable market price meaningfully wrong relative to oracle fair value, after confidence and execution friction are considered?**

The result is a decision-oriented dashboard for traders who want explainable, execution-aware signals without building custom oracle and routing infrastructure. Instead of showing everything, ArbiNexus shows what matters: signals that are both meaningful and potentially actionable.

Users can inspect opportunities, confidence context, and health indicators for data sources and system status in one view. Paper-trade simulation lets users preview trades before committing capital.

## Full Description
ArbiNexus is a Solana-native signal intelligence layer that compares **Pyth oracle fair value** with **executable Jupiter market quotes** to detect price dislocations, filter noise using confidence intervals, and simulate trade decisions before any capital is deployed.

Rather than showing raw prices alone, ArbiNexus asks a more useful question:

> **When is the executable market price meaningfully wrong relative to oracle fair value, after confidence and execution friction are considered?**

The result is a decision-oriented dashboard for traders who want explainable, execution-aware signals without building custom oracle and routing infrastructure.

### ArbiNexus Pipeline
1. Fetch the latest **Pyth oracle price** and confidence interval.
2. Check oracle freshness and reject stale or unreliable updates.
3. Request a live **Jupiter executable quote** for a target pair and size.
4. Normalize the quote into an effective market price.
5. Compare oracle fair value vs executable market quote.
6. Apply a conservative execution cost model.
7. Reject signals that fall inside the confidence/noise band.
8. Classify the result as: `BUY_MARKET`, `SELL_MARKET`, or `NO_TRADE`.

### Dashboard Emphasis
The dashboard emphasizes trust and operability:
- Live opportunity table with spread, net edge, signal, and rationale.
- Health badges for core dependencies and pipeline status.
- Explainability panel that makes decision policy explicit.
- Simulation flow for trade preview before capital commitment.

ArbiNexus is built for fast demoability and practical utility. It gives users a readable, auditable way to monitor market dislocations and evaluate potential trades without relying on a black-box strategy.

## Problem
On-chain prices are not always aligned with fair value. On Solana, users often see:

- fragmented liquidity across venues,
- delayed market response to new information,
- executable prices that differ from displayed reference prices,
- and noise that makes many apparent opportunities non-actionable.

Most dashboards simply show market data. They do not explain whether a quoted difference is meaningful, tradable, or just noise.

For active traders and market-aware DeFi users, the real challenge is not seeing more prices — it is knowing **when an executable price dislocation is actually worth acting on**.

## Solution
ArbiNexus detects oracle-to-market price dislocations and surfaces **potentially actionable trade signals** using:

- **Pyth** for fair-value reference pricing,
- **Jupiter** for executable route-aware quote pricing,
- **confidence interval filtering** to suppress oracle-noise false positives,
- and a **paper-trade simulation layer** to preview trades before committing capital.

This makes ArbiNexus not just a price monitor, but a **signal engine** built around execution-aware decision support.

## Who It Is For
ArbiNexus is designed first for:

- active Solana traders,
- quant-minded hobbyists,
- market-aware DeFi users,
- and teams that want explainable signal infrastructure without building their own oracle + routing stack.

## Why Solana
Solana is the right environment for this product because it combines:

- low transaction costs,
- fast execution,
- strong DEX routing infrastructure via **Jupiter**,
- and high-frequency oracle support via **Pyth**.

This makes Solana a strong environment for execution-aware price dislocation detection today, and an even stronger one as tokenized real-world assets mature on-chain.

## What Is Live Today
The current MVP includes:

- live **Pyth oracle** integration,
- live **Jupiter executable quote** integration,
- price dislocation signal generation for supported assets,
- confidence-aware filtering,
- a conservative net signal model,
- live updates via **SSE streaming**,
- paper-trade simulation with estimated route and return preview,
- and a dashboard with health indicators, rationale, and wallet context.

### Currently Supported Assets
- **SOL**
- **ETH**

These were chosen for reliable demo quality and strong ecosystem support.

## How Signals Are Generated
ArbiNexus uses the following decision pipeline:

1. Fetch the latest **Pyth oracle price** and confidence interval.
2. Check oracle freshness and reject stale or unreliable updates.
3. Request a live **Jupiter executable quote** for a target pair and size.
4. Normalize the quote into an effective market price.
5. Compare oracle fair value vs executable market quote.
6. Apply a conservative execution cost model.
7. Reject signals that fall inside the confidence/noise band.
8. Classify the result as:
   - `BUY_MARKET`
   - `SELL_MARKET`
   - `NO_TRADE`

This keeps the dashboard focused on **decision quality**, not just price display.

## Signal Logic
### Core Formula
- **Spread %** = `(Oracle Price - Market Price) / Oracle Price × 100`
- **Net Signal %** = `Spread % - Execution Cost Estimate`

### Current MVP Assumption
The current MVP uses a **fixed 0.25% conservative cost model** to approximate execution friction, including swap fees and slippage.

This is intentionally simple and conservative for hackathon scope. Future versions will use route-specific dynamic slippage and fee modeling.

### Confidence Filtering
If the apparent spread does not exceed the oracle confidence band meaningfully, ArbiNexus classifies it as `NO_TRADE` to reduce false positives.

## Example Signal
**Asset:** SOL  
**Oracle fair value (Pyth):** $162.42  
**Executable market quote (Jupiter):** $161.79  
**Spread:** 0.388%  
**Execution cost estimate:** 0.25%  
**Net signal:** 0.138%  
**Confidence check:** Passed  
**Classification:** `BUY_MARKET`

**Rationale:**  
The executable market quote is below oracle fair value by more than the modeled execution cost and beyond the confidence-noise threshold.

## What Makes ArbiNexus Different
Most dashboards show prices.  
ArbiNexus is different because it is:

- **executable-price aware** — uses Jupiter quotes, not just displayed market prices,
- **confidence filtered** — reduces false positives using oracle confidence data,
- **decision-oriented** — classifies and explains each signal,
- **simulation-first** — lets users preview trades before committing capital,
- **transparent** — exposes provider health, rationale, and trust context.

In short, ArbiNexus does not try to show *everything*.  
It tries to show **what matters**.

## Current Limitations
ArbiNexus is an MVP and makes several explicit tradeoffs:

- supported assets are currently limited to **SOL** and **ETH**,
- the execution cost model is currently a **fixed conservative assumption**,
- simulation is **paper-trade only**,
- signal frequency depends on live market conditions,
- and this version is designed as a **decision-support layer**, not a fully autonomous execution bot.

These limitations are intentional for scope and reliability.

## Ecosystem Integrations
- **Pyth (Hermes API)** for oracle prices and confidence data.
- **Jupiter v6** for executable quote paths and route-aware pricing.
- **Solana RPC and wallet adapter stack** for chain-aware UI flows.

## Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS.
- **Backend:** Fastify, Zod.
- **Data Flow:** Server-Sent Events for live opportunities streaming.
- **Integrations:** Pyth Hermes, Jupiter v6, Solana wallet adapter, Solana web3.
- **Monorepo:** pnpm workspaces and Turborepo.

## Demo Instructions
1. **Open dashboard** and show health badges plus live status (Pyth, Jupiter, API endpoints).
2. **Highlight opportunities table:** Show spread, net edge, signal classification, and rationale for each row.
3. **Explain filtering:** Toggle actionable-only filter and demonstrate how confidence intervals suppress false positives.
4. **Run a simulation:** Select one row, run paper-trade simulation, and explain route output and estimated return preview.
5. **Trust layer:** Use explainability panel to describe signal policy, cost assumptions, and confidence context.
6. **Show supported assets:** Demonstrate SOL and ETH pair monitoring in real time.

## Judging Alignment Summary
- **Technical Execution:** End-to-end data pipeline with real-time streaming, robust error handling, and coherent full-stack implementation.
- **Originality:** Execution-aware, oracle-informed signal generation focused on explainability and confidence filtering, not opaque bot behavior.
- **Usability and Design:** Clear dashboard layout with trust indicators, explainability context, and simulation-first safety UX.
- **Ecosystem Fit:** Native use of Solana key infrastructure (Pyth, Jupiter, wallet adapter).
- **Honesty and Rigor:** Explicit limitations section, conservative cost assumptions, and transparent framing of MVP scope.

## Future Roadmap

### Near-term
- Route-specific dynamic fee modeling.
- Broader supported asset coverage.
- Alerting and notification channels for actionable signals.
- Wallet-driven simulation context.
- Signal history and performance tracking.

### Longer-term
- Execution hooks for advanced users.
- API access for signal consumers.
- Multi-market coverage.
- Support for tokenized commodity and RWA price dislocation monitoring.
- Multi-venue opportunity analysis.

## Why It Matters
As on-chain markets mature, the gap between **reference value** and **executable value** becomes increasingly important.

ArbiNexus is built around that gap.

It helps users answer a simple but powerful question:

> **Is the market quote wrong enough, in a meaningful and executable way, to matter?**

That is the foundation for a much more useful class of trading and market-intelligence tools on Solana.

## Closing
**ArbiNexus is not just a dashboard. It is an explainable, execution-aware signal engine for identifying meaningful price dislocations on Solana.**

The tagline says it best: **Don't just show prices — show when they are wrong.**
