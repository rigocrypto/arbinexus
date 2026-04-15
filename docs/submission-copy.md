# ArbiNexus Submission Copy

## Project Title
ArbiNexus

## Tagline
Oracle-informed arbitrage intelligence for Solana.

## One-Line Pitch
ArbiNexus compares real-time oracle fair value with executable Solana market routes, then explains when a trade is actionable after fees.

## 50-Word Description
ArbiNexus is a Solana arbitrage intelligence dashboard that combines Pyth oracle prices and Jupiter executable quotes. It calculates spread and net edge after fees, classifies opportunities, and provides explainable rationale for each signal. Users can run paper-trade simulations before committing capital, making opportunities understandable, transparent, and safer to evaluate.

## 150-Word Description
ArbiNexus is an oracle-informed arbitrage intelligence layer built for Solana. It continuously ingests fair-value data from Pyth and executable market routes from Jupiter, then computes spread and net edge after estimated fees. Instead of showing raw numbers only, it classifies each opportunity into BUY_MARKET, SELL_MARKET, or NO_TRADE and includes rationale so users understand why a signal is actionable or filtered out.

The product is designed for transparency and confidence, not black-box bot behavior. Users can inspect opportunities, confidence context, and health indicators for data sources and system status in one dashboard. Before any execution step, ArbiNexus offers paper-trade simulation to preview expected outcomes in a safe environment.

This approach helps traders and builders detect oracle-vs-market dislocations faster, evaluate them with clear context, and make more informed decisions in real time on Solana.

## Full Description
On-chain markets can diverge from oracle fair value for short periods, creating potential arbitrage windows. These windows are often hard to detect quickly, and most existing bot-based approaches are opaque to end users.

ArbiNexus addresses this by providing a transparent, explainable intelligence layer for Solana arbitrage discovery.

ArbiNexus pipeline:
1. Pull oracle prices from Pyth (Hermes API).
2. Pull executable market quotes from Jupiter v6.
3. Compute spread and estimated net edge after fees.
4. Classify each signal into BUY_MARKET, SELL_MARKET, or NO_TRADE.
5. Surface rationale and confidence context for explainability.
6. Enable paper-trade simulation before any capital is committed.

The dashboard emphasizes trust and operability:
- Live opportunity table with spread, net, signal, and rationale.
- Health badges for core dependencies and pipeline status.
- Explainability panel that makes decision policy explicit.
- Simulation flow for safe experimentation.

ArbiNexus is built for fast demoability and practical utility. It gives users a readable, auditable way to monitor market dislocations and evaluate potential trades without relying on a black-box strategy.

## Problem
Arbitrage opportunities on Solana are time-sensitive and difficult to evaluate manually. Most users cannot compare oracle fair value versus executable market reality quickly enough, and many automated tools provide little visibility into why a trade should or should not be taken.

## Solution
ArbiNexus turns raw market and oracle data into explainable action signals. By combining Pyth and Jupiter in real time, calculating net edge after fees, and classifying opportunities with rationale, it makes arbitrage decisions transparent. A paper-trade simulator adds a safety layer before any real execution.

## Why Solana
Solana is a strong environment for this use case because:
- Low latency supports time-sensitive signal monitoring.
- Deep liquidity routing improves executable quote quality.
- Mature oracle infrastructure (Pyth) enables reliable fair-value reference data.
- High-throughput, low-cost interactions are well-suited for rapid market workflows.

## Ecosystem Integrations
- Pyth (Hermes API) for oracle prices.
- Jupiter v6 for executable quote paths.
- Solana RPC and wallet adapter stack for chain-aware UI flows.

## Tech Stack
- Frontend: Next.js 15, TypeScript, Tailwind CSS.
- Backend: Fastify, Zod.
- Data flow: Server-Sent Events for live opportunities streaming.
- Integrations: Pyth Hermes, Jupiter v6, Solana wallet adapter, Solana web3.
- Monorepo: pnpm workspaces and Turborepo.

## Demo Instructions
1. Open dashboard and show health badges plus live status.
2. Highlight opportunities table (spread, net edge, signal, rationale).
3. Toggle actionable-only filter and explain selection behavior.
4. Run a simulation on one row and explain output.
5. Use trust/explainability panel to describe policy and confidence context.

## Judging Alignment Summary
- Technical Execution: End-to-end data pipeline, real-time streaming, and coherent full-stack implementation.
- Originality: Explainable arbitrage intelligence focused on oracle-vs-executable dislocations, not opaque bot behavior.
- Usability and Design: Clear dashboard layout, confidence context, and simulation-first safety UX.
- Ecosystem Fit: Native use of key Solana infrastructure (Pyth, Jupiter, wallet stack).

## Future Roadmap
- Expand supported assets and route depth.
- Add historical signal analytics and backtesting views.
- Add user-configurable thresholds and risk profiles.
- Add alerting and notification channels for actionable signals.
- Evolve from simulated execution to guarded live execution with stricter policy controls.
- Add multi-market and cross-venue opportunities analysis.
