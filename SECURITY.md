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
```

## Known Dependency Vulnerabilities

Last verified: April 15, 2026 (`pnpm audit`)

### follow-redirects moderate (transitive)

- Package: `follow-redirects@1.16.0` (transitive)
- Severity: Moderate
- Status: No patched version published as of this date
- Description: May leak custom auth headers on cross-domain redirects
- Project impact: Low for current backend usage (unauthenticated public API reads, no outbound credential headers)
- Plan: Upgrade immediately when upstream publishes a fix

### lodash high/moderate (transitive in wallet adapter dependency chain)

- Package: `lodash` (transitive through `@solana/wallet-adapter-wallets` and walletconnect chain)
- Severity: 1 high + 2 moderate advisories
- Status: Transitive-only; not a direct dependency in this repository
- Project impact: Primarily in web wallet dependency surface, not backend execution paths
- Plan: Track upstream wallet package releases and upgrade when patched versions are available

### elliptic low (transitive)

- Package: `elliptic` (transitive through wallet-related dependency chain)
- Severity: Low
- Status: Transitive-only; no direct dependency
- Project impact: Low in current MVP scope
- Plan: Resolve via upstream dependency updates

## Risk Acceptance for Submission

For the current hackathon submission, the above vulnerabilities are documented and accepted because:

1. Exposure is transitive rather than from custom in-repo security code.
2. Critical exploit preconditions are not present in current backend request flows.
3. Immediate direct patches are not available for all findings without replacing core ecosystem dependencies.

Post-submission actions:

1. Re-run `pnpm audit` and apply updates as fixes become available.
2. Minimize web wallet dependency surface where feasible.
3. Prioritize dependency PRs that reduce known vulnerability count.

## Reporting Security Issues

If you discover a security issue in this repository:

1. Do not open a public issue with exploit details.
2. Provide a private report with impact and reproduction steps.
3. Include affected package/path information from `pnpm audit` where possible.
