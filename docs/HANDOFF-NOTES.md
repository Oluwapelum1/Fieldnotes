# Hostile Self-Review & Handoff Notes (Part 1.9)

## 1. Hostile Self-Review (10 Weakest Points Identified, 8 Fixed)

1. **Weakness #1 — Paper palette red-pencil and muted-ink contrast**:
   - *Issue*: The initial prompt starting hex `#D43F2A` for `--color-red-pencil` achieved `4.24:1` against `#F5F0E3` (`--color-page`), slightly below the strict WCAG 2.2 AA `4.5:1` requirement for small text. Similarly, `#6A655A` (`--color-ink-muted`) was `4.77:1` on `--color-page` (`#F5F0E3`) and `4.46:1` on `--color-marker` (`#FFE27A`).
   - *Status*: **FIXED** in `config/tokens.css`. Tuned `--color-red-pencil` to `#C4321E` (`5.04:1` on page, `5.44:1` on card) and `--color-ink-muted` to `#5C574D` (`5.74:1` on page, `6.19:1` on card), and `--color-green-pen` to `#24693F` (`6.65:1` on page).
2. **Weakness #2 — Initial client JS bundle weight in the Hero section**:
   - *Issue*: Bundling `DemoWorkspace` synchronously into the top-level page chunk risked pushing the initial route payload near the budget ceiling.
   - *Status*: **FIXED** in `components/hero/hero-section.tsx`. Used `next/dynamic` with an SSR-compatible static notebook fallback so First Load shared JS stays at `103 kB` while preserving full SSR readability of Scenario 1 when JavaScript is disabled.
3. **Weakness #3 — HTML nesting of `<div role="dialog">` inside `<p>` in `DemoWorkspace`**:
   - *Issue*: `SourceChip` renders an inline `<button>` plus a `<div role="dialog">` popover when open; wrapping output segments in a `<p>` caused invalid HTML nesting (`<div>` inside `<p>`).
   - *Status*: **FIXED** in `components/hero/demo-workspace.tsx`. Replaced the outer `<p>` wrapper with `<div className="inline-block w-full">` so SSR and client hydration are 100% spec-compliant.
4. **Weakness #4 — FAQ typewriter interval cleanup on rapid question switching**:
   - *Issue*: In `components/faq/faq-section.tsx`, the inner `setInterval` cleanup was returned inside the `setTimeout` callback rather than the outer `useEffect` cleanup, and the typewriter ran on initial mount before user interaction.
   - *Status*: **FIXED** in `components/faq/faq-section.tsx`. Hoisted `interval` to the `useEffect` scope, cleaned up both `dotsTimer` and `interval` on unmount/re-select, and rendered Question 1 immediately on mount (running the typing dots only after user interaction).
5. **Weakness #5 — RTL coordinate direction for hand-drawn margin arrows**:
   - *Issue*: Standard left-to-right cubic Bézier curves look backwards in Arabic (`dir="rtl"`) when the step list and panes swap sides.
   - *Status*: **FIXED** in `lib/annotations/paths.ts` (`flipPathRtl`), `components/annotations/annotation-mark.tsx`, and `components/show-your-work/show-your-work-panel.tsx`. All SVG paths mirror horizontally around `width` when `isRtl` is active.
6. **Weakness #6 — Accidental unverified security/compliance language in sample data-journey text**:
   - *Issue*: Sample copy describing TLS and inference policies could easily trip the copy-lint gate or mislead visitors if it used words like `"guaranteed"` or `"compliant"`.
   - *Status*: **FIXED** across `config/data-journey.json`, `messages/*.json`, and `lib/copy-lint.ts`. Enforced build-time copy-lint (`npm run lint:copy`) across all 18 config and locale files with 0 unverified claims and 0 banned hype words.
7. **Weakness #7 — Custom visitor input pretending to be AI intelligence**:
   - *Issue*: Allowing visitors to paste arbitrary text into a static template without a live backend could feel dishonest if it faked domain knowledge.
   - *Status*: **FIXED** in `lib/demo-engine/structure-only.ts` and `components/hero/demo-workspace.tsx`. Implemented a transparent, deterministic local sentence/number/question extractor (`runStructureOnlyFallback`) paired with a prominent red-pencil banner (`data-testid="custom-input-warning-banner"`) explaining that custom runs without a live adapter only extract structure.
8. **Weakness #8 — Subprocessor string formatting in `config/data-journey.json`**:
   - *Issue*: Node 4 (`storage`) had a leading space in `" Basin Database Hosting (sample)"`.
   - *Status*: **FIXED** in `config/data-journey.json`.
9. **Weakness #9 — Cross-column SVG arrow overlays on narrow mobile viewports**:
   - *Issue*: Drawing long SVG Bézier curves across stacked panes on `< 640px` screens creates visual clutter over body copy.
   - *Status*: **MITIGATED (Approximate)**. On mobile (`< 640px`), the workspace switches to a clean `[Input | Steps | Output]` tab bar (`role="tablist"`) and uses inline colour badges (`#1`, `#2`, `#3`) rather than cross-column SVG lines.
10. **Weakness #10 — Static exchange rates in `config/currencies.json`**:
    - *Issue*: Currency conversion uses static rates in `config/currencies.json` rather than live FX polling (which would violate the zero-third-party-network-requests privacy rule).
    - *Status*: **DOCUMENTED BY DESIGN**. Clearly labelled in the UI and `docs/CONFIG.md` so buyers know to update `config/currencies.json` when adjusting regional pricing.

---

## 2. Handoff Notes for Reviewing Model

### What Is Finished
- **Deliverable A (Next.js App Router Reference Build & Static Export)**:
  - Complete source tree in `app/`, `components/`, `lib/`, `config/`, `messages/`, `scripts/`, `tests/`, and `docs/`.
  - Builds cleanly as a static export (`output: 'export'` in `next.config.ts`) into `./out` across all 5 locales (`en`, `es`, `de`, `ar` RTL, `ja`) and 19 static routes.
  - Passes all 8 Vitest test suites (30/30 tests) and all 3 build-time verification scripts (`validate:config`, `lint:copy`, `check:samples`).
- **Deliverable B (Framer Pack)**:
  - 7 standalone React Code Components in `framer/components/` (`DemoWorkspace.tsx`, `ShowYourWork.tsx`, `LimitsTable.tsx`, `DataJourney.tsx`, `CostCalculator.tsx`, `PricingTable.tsx`, `AnnotationLayer.tsx`) with `addPropertyControls` and safe fallbacks when imported outside Framer.
  - Step-by-step assembly guide in `framer/FRAMER-PACK.md`.

### What Is Approximate / Unverifiable Against Live Framer Runtime
- **Framer `addPropertyControls` Runtime Guard**: Because these files live inside the Next.js workspace without the proprietary `framer` package installed in `node_modules`, each Framer component uses a typed `bindFramerPropertyControls` helper (`framer/components/*.tsx`) that attaches `propertyControls` safely and documents the exact `import { addPropertyControls, ControlType } from "framer"` line at the top of the file for pasting into Framer's Code editor.

### Known Bugs
- **None**. All 30 unit, component, and `axe-core` accessibility tests pass with zero warnings, `npm run check:all` passes with zero errors, and `npm run build` exports all static pages cleanly.

### What We Would Redesign With More Time
- Add an optional Web Worker tokenizer for the structure-only fallback so pasting 50,000+ character documents into the custom-input drawer computes sentence boundaries off the main thread.
- Add interactive SVG pan/zoom to the Integration Constellation diagram when a buyer configures more than 12 spokes.

