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

Last verified: May 1, 2026 (`pnpm audit --json`)

### Current status

- Resolved: 6 advisories via dependency overrides and lockfile updates
- Remaining: 1 low-severity advisory (`elliptic`) with no upstream patched version currently available

### Remediation applied

Workspace-level `pnpm` overrides were added for transitive dependencies:

- `lodash` -> `4.18.0`
- `postcss` -> `8.5.13`
- `protobufjs` -> `7.5.5`
- `uuid` -> `14.0.0`

These overrides addressed the previously open `protobufjs`, `lodash`, `postcss`, and `uuid` advisories.

### Remaining accepted risk: elliptic (low)

- Package: `elliptic@6.6.1` (transitive)
- Source path: wallet-adapter torus-related dependency chain
- Severity: Low
- Status: No patched upstream release currently available for this chain
- Project impact: Low for current MVP scope; package is not directly used in application business logic
- Mitigation: Keep dependency overrides in place for all patchable advisories and update immediately when upstream publishes a fix

## Risk Acceptance for Submission

For the current hackathon submission, the above vulnerabilities are documented and accepted because:

1. Exposure is transitive rather than from custom in-repo security code.
2. Critical exploit preconditions are not present in current backend request flows.
3. Immediate direct patches are not available for all findings without replacing core ecosystem dependencies.

Post-submission actions:

1. Re-run `pnpm audit` and apply updates as fixes become available.
2. Minimize web wallet dependency surface where feasible.
3. Prioritize upstream wallet adapter updates that remove the remaining `elliptic` finding.

## Reporting Security Issues

If you discover a security issue in this repository:

1. Do not open a public issue with exploit details.
2. Provide a private report with impact and reproduction steps.
3. Include affected package/path information from `pnpm audit` where possible.
