# Fieldnotes — Lab Notebook Landing-Page Template

**Fieldnotes** is an honest, inspectable landing-page template for AI products and SaaS startups. Instead of dark gradients, glowing orbs, and unverifiable hype, it is designed like a working researcher's engineering notebook: **Shown, Sourced, Honest**.

## Quick Start

```bash
npm install
npm run check:all   # Validates all JSON configs, runs copy-lint, and audits sample flags
npm test            # Runs Vitest unit, behaviour, and axe accessibility suites
npm run dev         # Starts Next.js development server
npm run build       # Produces a static export in ./out
```

## Two Deliverables Included
1. **Deliverable A (Next.js Reference Build & Static Export)**: Full App Router application in `app/`, `components/`, `lib/`, `config/`, and `messages/` supporting 5 locales (`en`, `es`, `de`, `ar` RTL, `ja`) and 2 themes (`Paper` and `Night notebook`).
2. **Deliverable B (Framer Pack)**: 7 standalone React Code Components with Framer Property Controls in `framer/components/` plus the complete assembly guide in `framer/FRAMER-PACK.md`.

## Retargeting the Template via Config Alone
Every piece of copy, scenario, limitation, data-journey stage, integration, plan price, currency rate, changelog item, and FAQ answer lives in `config/` and `messages/`. See `docs/CONFIG.md` and `docs/HONESTY-RULES.md` for full details.

