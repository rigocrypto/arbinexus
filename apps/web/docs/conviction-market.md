# Conviction Market Demo

## What it does
The Conviction Market lets users stake simulated conviction on whether ArbiNexus will ship a working Solana MVP/demo before the Colosseum Hackathon deadline.

## Why it exists
Likes and comments are weak signals. Conviction markets create a measurable feedback loop around whether builders will actually ship, helping the team understand real product momentum instead of just popularity.

## Demo mode warning
Current implementation is demo/local mode only. Staking and claiming are simulated with localStorage. No real SOL is transferred inside the app.

## PNL integration
The app includes a PNL integration card linking to `https://pnl.market` or to a configured external PNL market URL.

## Resolution criteria
YES wins if, before the deadline:
- A public demo or deployment link is available.
- Solana wallet connection works.
- At least one core Solana interaction is functional.
- Public proof exists through GitHub, demo video, or live app.

NO wins if those criteria are not met before the deadline.

## Technical implementation (current)
- React + TypeScript frontend route: `/conviction-market`
- Wallet-aware mock staking via `@solana/wallet-adapter-react`
- localStorage-backed market state (key: `arbinexus_conviction_market_v1`)
- Demo resolver with deadline gate
- Simulated claim flow
- PNL external link integration

## Future Anchor roadmap
Planned on-chain instructions:
- `initialize_market`
- `stake_yes`
- `stake_no`
- `resolve_market`
- `claim_payout`
