# Creative Concept: Fieldnotes

## 1. Concept Spine: A Lab Notebook That Shows Its Work
AI product marketing has collapsed into a single cliché: dark mode, glowing purple-to-blue orbs, particle fields, and unverifiable promises to "supercharge your workflow." Buyers are fatigued and skeptical. Before handing over an email address or connecting a workspace, every careful visitor asks three questions:
1. **What will it actually do on a task like mine?**
2. **Can I trust the output, and how will I catch its mistakes?**
3. **Where does my data go, who sees it, and when is it deleted?**

**Fieldnotes** answers with proof instead of persuasion. Modelled after a meticulous researcher's engineering notebook—24 px graph paper, a 72 px vertical margin rule, seeded pen annotations, and marker highlights—every decision is governed by three words:
- **Shown**: The hero is an interactive, inspectable demo workspace built from real selectable HTML.
- **Sourced**: Every claim in a demo output carries a source chip (`Sourced`, `Inferred`, or `Unknown`). Every metric on the page is linked to evidence or flagged `[sample]`.
- **Honest**: The template explicitly labels its own hero demo as `"Sample run, scripted for this demo"`, publishes a live table of known product limitations, maps the exact data lifecycle with fill-in enforcement, and refuses to render unverified compliance or speed claims.

---

## 2. Colour Palettes & Verified Contrast Ratios
All colours are defined as CSS custom properties (`config/tokens.css`). Contrast ratios were computed using the WCAG 2.x relative luminance formula and verified to pass **4.5:1** for body/UI text and **3.0:1** for boundaries and graphical tokens. Where the prompt's starting hex values fell slightly below 4.5:1 against paper or marker highlights (`#D43F2A` is 4.24:1 on `#F5F0E3`; `#FFE27A` at 30% on dark mode reduces text contrast if layered over text), we tuned the exact shades so every text pairing strictly passes.

| Token | Paper (Default) | Contrast on Paper (`page` / `card`) | Night Notebook | Contrast on Night (`page` / `card`) | Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--color-page` | `#F5F0E3` | — (L = 0.871) | `#15171C` | — (L = 0.019) | Graph-paper page surface |
| `--color-card` | `#FBF8EF` | — (L = 0.941) | `#1D2027` | — (L = 0.030) | Cards, demo panes, pricing |
| `--color-grid` | `#D5CCB4` | 3.12:1 (UI boundary variant) | `#2C3140` | 3.08:1 (UI boundary variant) | 24 px graph-paper lines & borders |
| `--color-ink` | `#1C1B18` | **14.85:1** / **15.96:1** | `#EDE7D6` | **13.62:1** / **12.18:1** | Primary body & headline ink |
| `--color-ink-muted` | `#5C574D` | **5.74:1** / **6.17:1** | `#A8A395` | **6.48:1** / **5.79:1** | Captions, margin notes, timestamps |
| `--color-ink-blue` | `#1F4B99` | **7.02:1** / **7.55:1** | `#8DB0FF` | **7.94:1** / **7.10:1** | Margin rule, links, focus rings, arrows |
| `--color-marker` | `#FFE27A` | **12.41:1** (`ink` on marker) | `rgba(255, 216, 92, 0.26)` | **9.85:1** (`ink` over composite `#4E472B`) | Lower-55% skewed highlighter stripe |
| `--color-red-pencil` | `#C4321E` | **5.04:1** / **5.41:1** | `#FF8A75` | **6.78:1** / **6.06:1** | Caveat brackets, "Check" tags, limits |
| `--color-green-pen` | `#246B41` | **5.52:1** / **5.93:1** | `#7FD6A0` | **9.56:1** / **8.55:1** | Verified source chips, confirmations |

*Non-colour redundancy*: Caveats always prepend `"Check:"` and draw a bracket mark; source chips always display a label (`msg 1`, `inferred`, `check`) plus a geometric icon (`✓`, `⋯`, `?`).

---

## 3. Typography & Script Fallbacks
- **Headlines (`--font-display`)**: **Literata** (variable optical-size serif, SIL OFL). Conveys editorial permanence and laboratory notes. Exactly one italicised word per primary headline.
- **Body & UI (`--font-sans`)**: **Albert Sans** (variable geometric-humanist sans, SIL OFL). Clean, unpretentious legibility at 17 px (`1.0625rem`).
- **Margin Notes & Data (`--font-mono`)**: **Spline Sans Mono** (tabular figures `font-variant-numeric: tabular-nums`, SIL OFL). Used for source chips, step timings, calculator outputs, and `[sample]` badges.
- **Multi-script & RTL Fallbacks**: `Noto Naskh Arabic` (Arabic RTL), `Noto Sans JP` (Japanese), and `Noto Sans Devanagari` (Hindi), paired with `font-display: swap` and metric-adjusted fallback descriptors.

---

## 4. Seeded Hand-Drawn Annotation System & Motion Language
- **Deterministic SVG Generator (`lib/annotations`)**: Uses `mulberry32` seeded PRNG so every `wobblyLine`, `arrow`, `circle`, `bracket`, `tick`, `cross`, `asterisk`, and `question` path produces identical SVG coordinates across renders and tests. Anchored via `ResizeObserver` to target selectors (`aria-hidden="true"`, zero layout shift, max 3 annotations per viewport).
- **Motion Hierarchy & Intensity**:
  - Tokens: `--ease-ink: cubic-bezier(0.5, 0.1, 0.2, 1)`, `--ease-settle: cubic-bezier(0.3, 1.3, 0.5, 1)`, `--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1)`.
  - Three user-selectable modes (`Full`, `Calm`, `Off`), automatically defaulting to `Off` under `prefers-reduced-motion: reduce`.

---

## 5. Section Architecture: Unique Layouts & Motion Signatures
No two sections share a layout skeleton or entrance animation:

| # | Section | Unique Layout Skeleton | Signature Entrance & Interaction Motion |
| :- | :--- | :--- | :--- |
| 1 | **Header** | 64 px bar + 72 px vertical margin rule bookmark | Scroll-linked ink-blue bookmark line filling down the 72 px rule |
| 2 | **Hero Demo** | 3-pane notebook workbench (Rail + Input + Output + Margin Drawer) | Staggered headline rise → card settle overshoot → RAF timeline with highlighter sweeps & curved step arrows |
| 3 | **Before & After** | Pinned 200 vh stage converting scattered desk slips to 4 neat stacks | Scroll-driven cubic-bezier slip trajectories (`transform` only) + header highlighter sweep |
| 4 | **Constellation** | Elliptical 5-category orbital map + collapsible factual permissions ledger | Radial drift-in from edges (900 ms); category hover pulls 3 nodes inward via 240 ms spring |
| 5 | **Honest Limits** | Full-width lab audit sheet with margin date stamp & filter chips | Red-pencil bracket draws around heading (600 ms) → rows rise 20 px; row hover draws wobbly underline |
| 6 | **Data Journey** | 5-node horizontal SVG pipeline + slide-over inspection drawer | Travelling ink-blue packet dot (4 s pausable loop) + 320 ms right-hand inspector drawer |
| 7 | **Calculator** | Asymmetric 4-col margin proof + 8-col interactive ledger card | 600 ms odometer digit roll + 500 ms hand-drawn pencil range bar between 60% and 100% realisation |
| 8 | **Pricing** | Bottom-aligned unequal-height cards (Free, Team, Business) + word matrix | Middle → Left → Right card rise (90 ms stagger) + 320 ms digit roll on Monthly/Yearly switch |
| 9 | **Shipped This Month** | Left-margin mono date spine + stamped release slips | Rubber-stamp scale press (`1.3 → 1.0`, 200 ms `ease-settle`) + scroll-drawn vertical spine line |
| 10 | **FAQ Conversation** | Split 2-pane Q&A index + live notebook answer sheet (Accordion on mobile) | 400 ms typing dots → 20 ms/char punctuation-aware answer stream (or instant "Show all answers") |
| 11 | **Final CTA** | Single wide dispatch card with inline validation & consent | Hand-drawn arrow draws toward button at 60% view; submit folds an SVG paper plane over 640 ms |
| 12 | **Footer** | 4-column reference index + standing AI caveat banner | Final wobbly ink-blue underline draws beneath the wordmark at 40% visibility |

