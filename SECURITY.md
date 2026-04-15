# Security Policy

## Project Status

ArbiNexus is currently an **MVP / hackathon project** under active development.
It operates in **paper-trade / simulation mode by default** and does not
custody user funds or execute live trades without explicit user action.

---

## Supported Versions

| Version | Supported          | Notes                        |
| ------- | ------------------ | ---------------------------- |
| 0.1.x   | ✅ Yes             | Current hackathon MVP        |
| < 0.1   | ❌ No              | Pre-release scaffolding only |

---

## Scope

### In scope
- API endpoint security (CORS, input validation, injection)
- Wallet connection handling
- Environment variable / secret exposure
- Dependency vulnerabilities
- Data integrity issues in price feed handling

### Out of scope for this MVP phase
- On-chain program exploits (Anchor program is skeleton only)
- Live trade execution vulnerabilities (execution is devnet/simulation only)
- Third-party provider issues (Pyth, Jupiter, Solana RPC)

---

## Known Security Posture

- No user funds are held or custodied by this application
- No private keys are stored or transmitted
- API keys and secrets are managed via environment variables
- `.env` files are excluded from version control via `.gitignore`
- CORS is restricted to known frontend origins
- All execution defaults to devnet and simulation mode

---

## Reporting a Vulnerability

If you discover a security vulnerability in ArbiNexus, please report it
responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

### How to report

1. Email: [ADD YOUR CONTACT EMAIL]
   Or open a private GitHub Security Advisory:
   https://github.com/YOUR_USERNAME/arbinexus/security/advisories/new

2. Include in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix if known

### What to expect

- Acknowledgement within 48 hours
- Status update within 7 days
- Fix or mitigation plan communicated before public disclosure

---

## Dependency Security

This project uses `pnpm` with a lockfile.
To audit dependencies locally:

```bash
pnpm audit
