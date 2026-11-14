# Fieldnotes Framer Pack — Assembly & Build Guide (Deliverable B)

This guide explains how to assemble **Fieldnotes** inside Framer using the 7 custom Code Components in `framer/components/` alongside Framer's native Stacks, Breakpoints, Color Styles, and Text Styles.

---

## 1. Setting Up Color Styles (Paper & Night Notebook)
In your Framer project, open **Assets → Styles → Colors** and create the following Color Styles with Light (`Paper`) and Dark (`Night notebook`) themes:

| Style Name | Light (Paper) | Dark (Night) | Usage |
| :--- | :--- | :--- | :--- |
| `page` | `#F5F0E3` | `#15171C` | Page background |
| `card-paper` | `#FBF8EF` | `#1D2027` | Cards, demo panes, pricing |
| `border-warm` | `#DCD3BC` | `#323746` | 1 px card and table borders |
| `ink` | `#1C1B18` | `#EDE7D6` | Primary text |
| `ink-muted` | `#5C574D` | `#A8A395` | Captions, margin notes |
| `ink-blue` | `#1F4B99` | `#8DB0FF` | Margin rule, links, focus rings, arrows |
| `marker` | `#FFE27A` | `rgba(255, 216, 92, 0.30)` | Highlighter stripe |
| `red-pencil` | `#C4321E` | `#FF8A75` | Caveat brackets, Check tags, limits |
| `green-pen` | `#246B41` | `#7FD6A0` | Source chips, confirmations |

---

## 2. Setting Up Text Styles
Open **Assets → Styles → Text** and load **Literata**, **Albert Sans**, and **Spline Sans Mono** from Google Fonts:
- **Display (Hero)**: `Literata`, `clamp(2.75rem, 1.5rem + 5.2vw, 6.25rem)`, line-height `1.0`, weight `400` (italicise one word).
- **H1 (Section Title)**: `Literata`, `clamp(2.25rem, 1.4rem + 3.2vw, 4rem)`, line-height `1.05`.
- **H2 (Card Heading)**: `Literata`, `clamp(1.625rem, 1.2rem + 1.7vw, 2.5rem)`, line-height `1.15`.
- **Body**: `Albert Sans`, `17px` (`1.0625rem`), line-height `1.6` (never below `16px` on mobile).
- **Small**: `Albert Sans`, `14px` (`0.875rem`), line-height `1.5`.
- **Margin Note**: `Spline Sans Mono`, `13px` (`0.8125rem`), line-height `1.45`.
- **Chip / Step Label**: `Spline Sans Mono`, `12px` (`0.75rem`), uppercase, letter-spacing `0.06em`.

---

## 3. Page Grid, Breakpoints & Fixed Graph-Paper Surface
1. **Breakpoints**: Desktop (`1240px`), Tablet (`810px`), Phone (`390px`, tested down to `320px`).
2. **Graph-Paper Background**: Place a fixed Frame (`position: fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`) with a 24 px CSS repeating linear gradient matching `app/globals.css`.
3. **Vertical Margin Rule**: On Desktop, place a `1px` wide vertical Frame pinned `72px` from the left edge (`right: 72px` in RTL) in `ink-blue` at 25% opacity, with a scroll-linked inner bar filling from `0%` to `100%` height.

---

## 4. Importing the 7 Signature Code Components
In Framer, go to **Assets → Code → New Code File** and paste each component from `framer/components/`:
1. `DemoWorkspace.tsx` — Hero interactive scripted workspace with scenario property controls and mandatory `"Sample run, scripted for this demo"` tag.
2. `ShowYourWork.tsx` — Margin step drawer with numbered steps and "Left out" list.
3. `LimitsTable.tsx` — Expandable Honest Limits table with status marks and workarounds.
4. `DataJourney.tsx` — 5-node data lifecycle diagram with region & retention controls and red-pencil `"Fill me in"` badges.
5. `CostCalculator.tsx` — Interactive team/hours/rate ROI calculator with 2-significant-figure range rounding.
6. `PricingTable.tsx` — Bottom-aligned unequal-height Free / Team / Business cards defaulting to Monthly.
7. `AnnotationLayer.tsx` — Deterministic `mulberry32` hand-drawn SVG marks (`arrow`, `wobbly-line`, `circle`, `bracket`, `tick`, `cross`).

> Note: If copying `AnnotationLayer.tsx` into Framer as a single file, inline the helper functions from `lib/annotations/paths.ts` and `lib/annotations/prng.ts` at the top of the Framer code file.

---

## 5. Section-by-Section Native Stack Assembly
For each of the 12 sections, create a horizontal Stack (`max-width: 1240px`, padding `72px` desktop / `20px` phone, `gap: 32px`):
- **Left Margin Column (`3fr` / `280px`)**: Holds the `H1` heading (with one italic word), a `Margin Note`, a `[sample]` tag, and an `AnnotationLayer` arrow.
- **Right Content Column (`9fr` / `1fr` on mobile)**: Holds the corresponding Code Component or native card stack.

---

## 6. Testing Phone Breakpoint & Publishing
1. Resize the Framer canvas to `320px` and `390px`: verify all stacks switch from `Direction: Horizontal` to `Direction: Vertical` and no horizontal scrollbar appears.
2. Verify that all `[sample]` and `"Fill me in"` tags are replaced with real product facts before publishing to a custom domain.
3. Click **Publish → Update** in the top-right corner of Framer.

