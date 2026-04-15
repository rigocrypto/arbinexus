# ArbiNexus Architecture

## System Overview

ArbiNexus ingests two live price perspectives for each tracked asset:

- Oracle fair value from Pyth Hermes
- Executable market quote from Jupiter v6

It computes spread and net opportunity, classifies each signal, and streams
results to a live dashboard.

## Data Flow

```text
External Sources
  Pyth Hermes API
  Jupiter v6 Quote API
        |
        v
packages/sdk
  pyth.ts      -> oracle fetch + normalization
  jupiter.ts   -> quote fetch + route fallback
  arbitrage.ts -> spread, net, confidence filter, signal
        |
        v
apps/api (Fastify)
  market-data service
    - short TTL cache
    - provider health status
    - degraded fallback behavior
  routes
    - GET /health
    - GET /prices
    - GET /opportunities
    - GET /opportunities/:symbol
    - POST /simulate
    - POST /execute
    - GET /stream/opportunities (SSE)
        |
        v
apps/web (Next.js)
  Opportunities table
  Trust and explainability panel
  Health badges
  Inline simulation result
  Wallet balance via wallet adapter
```

## Signal Decision Model

```text
spreadPct = (oraclePrice - marketPrice) / oraclePrice * 100
netPct    = spreadPct - estimatedFeesPct

if netPct > threshold and spread clears confidence filter:
  signal = BUY_MARKET
elif netPct < -threshold and spread clears confidence filter:
  signal = SELL_MARKET
else:
  signal = NO_TRADE
```

## Resilience Behavior

### Pyth issue

1. Attempt fresh oracle fetch
2. Fall back to cached value if available
3. Return degraded status when fresh data is unavailable

### Jupiter issue

1. Attempt primary quote endpoint
2. Use fallback endpoint chain
3. Fall back to cached quote and mark degraded when needed

### UI behavior during degraded mode

- Dashboard continues rendering last valid opportunities
- Health badges show degraded/offline state
- No blank-screen failure mode

## Execution Safety

The current /execute route is intentionally hackathon-safe and simulated.
This avoids unsafe live trading behavior while preserving an end-to-end
interaction path for demos.
