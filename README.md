# ArbiNexus

> **Oracle-Informed Price Dislocation Intelligence for Solana**
> 
> Don't just show prices — show when they are wrong.

[![Live Site](https://img.shields.io/badge/Live%20Site-rigocrypto.github.io-purple)](https://rigocrypto.github.io/arbinexus/)
[![Demo Video](https://img.shields.io/badge/Demo-YouTube-red)](https://youtu.be/G2c4WNlbrwI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Built for Solana](https://img.shields.io/badge/Built%20for-Solana-9945FF)](https://solana.com)

---

## 🌐 Live Links

| Resource | URL |
|----------|-----|
| 🌍 **Landing Page (English)** | https://rigocrypto.github.io/arbinexus/ |
| 🇪🇸 **Landing Page (Español)** | https://rigocrypto.github.io/arbinexus/es/ |
| 🎥 **Demo Video** | https://youtu.be/G2c4WNlbrwI |
| 💻 **GitHub Repository** | https://github.com/rigocrypto/arbinexus |
| 📄 **Sitemap** | https://rigocrypto.github.io/arbinexus/sitemap.xml |

---

## Overview

ArbiNexus is a Solana-native signal intelligence layer that compares **Pyth oracle fair value** with **executable Jupiter market quotes** to detect price dislocations, filter noise using confidence intervals, and simulate trade decisions before any capital is deployed.

Rather than showing raw prices alone, ArbiNexus asks a more useful question:

> **When is the executable market price meaningfully wrong relative to oracle fair value, after confidence and execution friction are considered?**

The result is a decision-oriented dashboard for traders who want explainable, execution-aware signals without building custom oracle and routing infrastructure.

Built for the **Colosseum Hackathon**.

---

## The Problem

On-chain prices are not always aligned with fair value. On Solana, users often see:

- Fragmented liquidity across venues
- Delayed market response to new information
- Executable prices that differ from displayed reference prices
- Noise that makes many apparent opportunities non-actionable

Most dashboards simply show market data. They do not explain whether a quoted difference is meaningful, tradable, or just noise.

For active traders and market-aware DeFi users, the real challenge is not seeing more prices — it is knowing **when an executable price dislocation is actually worth acting on**.

---

## The Solution

ArbiNexus detects oracle-to-market price dislocations and surfaces **potentially actionable trade signals** using:

- **Pyth** for fair-value reference pricing
- **Jupiter** for executable route-aware quote pricing
- **Confidence interval filtering** to suppress oracle-noise false positives
- **Paper-trade simulation layer** to preview trades before committing capital

This makes ArbiNexus not just a price monitor, but a **signal engine** built around execution-aware decision support.

---

## Why Solana

- **Sub-second finality** makes arbitrage execution realistic
- **Low transaction fees** make small spreads profitable
- **Jupiter** aggregates Solana liquidity across all major DEXs
- **Pyth Network** provides high-frequency oracle data natively on Solana
- **Maturing ecosystem** of tokenized assets and RWAs

---

## What Is Live Today

The current MVP includes:

- ✅ Live **Pyth oracle** integration
- ✅ Live **Jupiter executable quote** integration
- ✅ Price dislocation signal generation for SOL and ETH
- ✅ Confidence-aware filtering
- ✅ Conservative net signal model (0.25% execution cost estimate)
- ✅ Live updates via **SSE streaming**
- ✅ Paper-trade simulation with route and estimated return preview
- ✅ Dashboard with health indicators, rationale, and wallet context
- ✅ Solana Wallet Adapter integration (Phantom, Solflare, wallet-standard)
- ✅ Multilingual landing page (English + Spanish)
- ✅ Hardened security posture with CI audit workflow

---

## Screenshots

### Dashboard Overview
![ArbiNexus Dashboard Overview](https://rigocrypto.github.io/arbinexus/screenshots/dashboard-overview.png)

### MVP Upgrades
![ArbiNexus MVP Upgrades](https://rigocrypto.github.io/arbinexus/screenshots/mvp-upgrades.png)
![ArbiNexus MVP Upgrades Detail](https://rigocrypto.github.io/arbinexus/screenshots/mvp-upgrades-2.png)

### System Architecture
![ArbiNexus System Architecture](https://rigocrypto.github.io/arbinexus/screenshots/system-architecture.png)

---

## Architecture

```
External Data Sources
			 │
			 ├── Pyth Hermes REST API
			 │   └── Returns: price, confidence, publish_time, exponent
			 │
			 └── Jupiter v6 Quote API
					 └── Returns: inAmount, outAmount, route plan
								│
								▼
			 Shared SDK (packages/sdk)
			 ├── pyth.ts        — Feed ID registry + exponent normalization
			 ├── jupiter.ts     — Quote fetch with fallback endpoint chain
			 └── arbitrage.ts   — Spread + signal classification
								│
								▼
			 Fastify API (apps/api)
			 ├── /health
			 ├── /prices
			 ├── /opportunities
			 ├── /simulate
			 └── /stream/opportunities (SSE)
								│
								▼
			 Next.js Dashboard (apps/web)
			 ├── Opportunities table with signals + rationale
			 ├── Health badges (Pyth / Jupiter / cache age)
			 ├── Profitable-only filter toggle
			 ├── Per-row Simulate / Track / Ignore actions
			 ├── Trust & Explainability panel
			 └── Wallet integration with live SOL balance

			 Astro Landing Page (apps/site)
			 ├── Multilingual (EN + ES) with i18n routing
			 ├── SEO meta + Open Graph + JSON-LD
			 ├── Auto-deployed to GitHub Pages
			 └── Sitemap + robots.txt
```

---

## Signal Logic

### Core formula
```
Spread %  = (Oracle Price - Market Price) / Oracle Price × 100
Net %     = Spread % - Execution Cost Estimate (0.25%)
```

### Classification
```
Net % > +0.10%   →  BUY_MARKET   (market underpriced vs oracle)
Net % < -0.10%   →  SELL_MARKET  (market overpriced vs oracle)
Otherwise        →  NO_TRADE     (within noise threshold)
```

### Confidence filter
If the spread does not meaningfully exceed the oracle confidence band, ArbiNexus classifies the signal as `NO_TRADE` to reduce false positives.

### Example signal
```
Asset:                SOL
Oracle (Pyth):        $162.42
Market (Jupiter):     $161.79
Spread:               0.388%
Execution cost:       0.25%
Net signal:           0.138%
Confidence check:     Passed
Classification:       BUY_MARKET

Rationale: Executable quote is below oracle fair value beyond
the confidence and modeled cost threshold.
```

---

## Tech Stack

### Frontend Dashboard (apps/web)
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Solana Wallet Adapter
- Server-Sent Events for live updates
- Recharts for visualization

### Backend API (apps/api)
- Fastify + TypeScript
- Short-TTL price cache with graceful degradation
- SSE streaming endpoint
- @fastify/cors

### Landing Page (apps/site)
- Astro 6 (static site)
- Multilingual (i18n routing)
- Tailwind CSS
- Auto-deployed to GitHub Pages via GitHub Actions

### Shared SDK (packages/sdk)
- `pyth.ts` — Hermes REST integration
- `jupiter.ts` — v6 quote API with fallback chain
- `arbitrage.ts` — spread computation + signal classification

### Solana Integrations
- **Pyth Network** — oracle price feeds (SOL, ETH)
- **Jupiter v6** — best-route executable quotes
- **Solana Wallet Adapter** — Phantom, Solflare, wallet-standard
- **Solana Devnet** — safe execution environment

### Monorepo
- pnpm workspaces
- Turborepo
- Anchor program skeleton (programs/arbinexus)

---

## Project Structure

```
arbinexus/
├── apps/
│   ├── web/                    # Next.js dashboard (port 3000)
│   ├── api/                    # Fastify backend (port 3001)
│   └── site/                   # Astro landing page (port 4321)
├── packages/
│   ├── sdk/                    # Shared market data SDK
│   ├── ui/                     # Shared UI components
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared tsconfig/eslint
├── programs/
│   └── arbinexus/              # Anchor program skeleton
├── docs/
│   ├── architecture.md
│   ├── demo-script.md
│   ├── judging-map.md
│   └── submission-copy.md
├── .github/
│   └── workflows/
│       ├── deploy-site.yml     # Auto-deploy landing page
│       └── security-audit.yml  # Weekly security audit
├── SECURITY.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 22.12.0+
- pnpm 8+
- Phantom or Solflare browser extension (optional, for wallet features)

### Install

```bash
git clone https://github.com/rigocrypto/arbinexus.git
cd arbinexus
pnpm install
```

### Environment Variables

Create `apps/api/.env`:

```env
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
JUPITER_API_BASE=https://lite-api.jup.ag
PYTH_HERMES_URL=https://hermes.pyth.network
TRACKED_SYMBOLS=SOL,ETH
OPPORTUNITY_NET_THRESHOLD_PCT=0.10
API_CACHE_TTL_MS=5000
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Run

```bash
# Terminal 1 — API backend
pnpm --filter @arbinexus/api dev

# Terminal 2 — Dashboard
pnpm --filter @arbinexus/web dev

# Terminal 3 — Landing page (optional, for local development)
pnpm --filter @arbinexus/site dev
```

### Open

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API health | http://localhost:3001/health |
| Live stream | http://localhost:3001/stream/opportunities |
| Landing page | http://localhost:4321 |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health and version |
| `GET` | `/prices` | Live oracle + market prices |
| `GET` | `/opportunities` | Classified arbitrage signals |
| `GET` | `/opportunities/:symbol` | Single asset signal detail |
| `POST` | `/simulate` | Paper-trade simulation result |
| `POST` | `/execute` | Devnet execution hook |
| `GET` | `/stream/opportunities` | SSE live opportunity stream |

### Sample `/opportunities` response

```json
{
	"status": "ok",
	"mode": "live",
	"health": {
		"pyth": "live",
		"jupiter": "live",
		"cacheAge": 3
	},
	"opportunities": [
		{
			"symbol": "SOL",
			"oraclePrice": 182.43,
			"marketPrice": 180.91,
			"spreadPct": 0.834,
			"netOpportunityPct": 0.584,
			"signal": "BUY_MARKET",
			"actionable": true,
			"confidence": 0.12,
			"rationale": "Market underpriced vs oracle by 0.584% net of fees",
			"timestamp": "2025-05-01T14:32:01.000Z"
		}
	]
}
```

---

## What Makes ArbiNexus Different

Most dashboards show prices. ArbiNexus is different because it is:

- **Executable-price aware** — uses Jupiter quotes, not just displayed market prices
- **Confidence filtered** — reduces false positives using oracle confidence data
- **Decision-oriented** — classifies and explains each signal
- **Simulation-first** — lets users preview trades before committing capital
- **Transparent** — exposes provider health, rationale, and trust context

In short, ArbiNexus does not try to show *everything*. It tries to show **what matters**.

---

## Current Limitations

ArbiNexus is an MVP and makes several explicit tradeoffs:

- Supported assets currently limited to **SOL and ETH**
- Execution cost model uses a **fixed conservative assumption** (0.25%)
- Simulation is **paper-trade only**
- Signal frequency depends on real-time market conditions
- Designed as a **decision-support layer**, not a fully autonomous execution bot

These limitations are intentional for scope and reliability.

---

## Roadmap

### Near-term
- Route-specific dynamic fee modeling
- Broader supported asset coverage
- Alerts and monitoring (Telegram/Discord webhooks)
- Wallet-driven simulation context
- Improved signal history and tracking
- Custom domain deployment

### Long-term
- On-chain execution via Jupiter swap integration
- Anchor vault for automated strategy execution
- API access for signal consumers
- Multi-market coverage
- Tokenized RWA price dislocation monitoring
- Additional language support (Portuguese, French)

---

## Internationalization

The landing page is available in:

- 🇺🇸 **English** — https://rigocrypto.github.io/arbinexus/
- 🇪🇸 **Spanish** — https://rigocrypto.github.io/arbinexus/es/

Both versions feature complete localization including:
- Native typography and accents
- Localized SEO meta tags
- hreflang alternates
- Per-language Open Graph data

---

## Security

ArbiNexus follows responsible security practices:

- ✅ No secrets committed to the repository
- ✅ All `.env` files excluded via `.gitignore`
- ✅ CORS restricted to known frontend origins
- ✅ Paper-trade mode by default — no funds at risk
- ✅ Devnet-safe execution environment
- ✅ Dependency overrides for transitive vulnerabilities
- ✅ Automated weekly CI security audits
- ✅ Documented accepted-risk posture

For details on dependency vulnerabilities and remediation status, see [SECURITY.md](./SECURITY.md).

To report a vulnerability, please follow the responsible disclosure process in `SECURITY.md`.

---

## Deployment

### Landing page
The Astro landing page auto-deploys to GitHub Pages on every push to `main` that touches `apps/site/**`.

Deployment workflow: `.github/workflows/deploy-site.yml`

Live at: https://rigocrypto.github.io/arbinexus/

### Dashboard and API
The dashboard and API are designed for local development during the hackathon MVP phase. Production deployment paths (Vercel, Railway, Fly.io) are planned for post-hackathon iteration.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/architecture.md](./docs/architecture.md) | System architecture and data flow |
| [docs/demo-script.md](./docs/demo-script.md) | 2-minute demo presentation script |
| [docs/judging-map.md](./docs/judging-map.md) | Hackathon judging criteria alignment |
| [docs/submission-copy.md](./docs/submission-copy.md) | Submission form copy and pitch text |
| [SECURITY.md](./SECURITY.md) | Security policy and known vulnerabilities |

---

## Why It Matters

As on-chain markets mature, the gap between **reference value** and **executable value** becomes increasingly important.

ArbiNexus is built around that gap. It helps users answer a simple but powerful question:

> **Is the market quote wrong enough, in a meaningful and executable way, to matter?**

That is the foundation for a much more useful class of trading and market-intelligence tools on Solana.

---

## Builder

**Rigoberto Vivas** (Rigo Crypto)

Solo founder and full-stack builder focused on crypto-native product development, automation, trading systems, and execution-aware market tooling. Based in Orlando, FL.

Previous work includes **CropFolioCoin** (agricultural asset tokenization) and **ArbiMind** (the earlier arbitrage system that led directly to ArbiNexus).

**Contact:**
- 📧 Email: rigovivas71@gmail.com
- 📱 Phone: +1 (407) 454-2981
- 💻 GitHub: [@rigocrypto](https://github.com/rigocrypto)

---

## Closing Line

**ArbiNexus is not just a dashboard. It is an explainable, execution-aware signal engine for identifying meaningful price dislocations on Solana.**

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

## Acknowledgments

Built with infrastructure from:

- [Pyth Network](https://pyth.network/) — high-frequency oracle data
- [Jupiter](https://jup.ag/) — Solana liquidity aggregation
- [Solana](https://solana.com/) — fast, low-cost execution layer
- [Astro](https://astro.build/) — landing page framework
- [Next.js](https://nextjs.org/) — dashboard framework
- [Fastify](https://fastify.dev/) — API framework

Built for the [Colosseum Hackathon](https://arena.colosseum.org/).
