# Configuration Reference (`config/` & `messages/`)

A buyer can retarget the entire **Fieldnotes** site to a different product by editing JSON files in `config/` and `messages/` alone. Every file is validated at build time by `scripts/validate-config.ts` (powered by Zod schemas in `lib/config-schema.ts`).

| File | Purpose | Key Validation Rules |
| :--- | :--- | :--- |
| `config/site.json` | Product name, tagline, locales, theme/motion defaults, form endpoint, contact emails, standing AI disclosure | `standingAiDisclosure` is required unless `disableDisclosureReason` is provided; `showScriptedTag` cannot be `false` unless `liveEngineActive` is `true`. |
| `config/scenarios/*.json` | Per-language demo scenarios (`en`, `es`, `de`, `ar`, `ja`) | Every claim segment must have `sources` (pointing to valid `inputBlocks`) or `claimType` set to `"inferred"` or `"unknown"`. Every `stepId` must exist. |
| `config/limits.json` | Honest limitations table | At least 3 entries; `lastReviewed` dates must be `YYYY-MM-DD`. |
| `config/data-journey.json` | 5 data lifecycle stages, regions, retention days, subprocessors | Each node must have an `evidenceUrl` or `placeholder: true`. Placeholders block production builds unless `allowPlaceholdersInProduction: true`. |
| `config/integrations.json` | 15 integrations across 5 categories (`Email`, `Docs`, `Chat`, `CRM`, `Storage`) | Invented geometric glyphs only; flagged `sample: true` until replaced. |
| `config/pricing.json` | Free, Team, and Business plans, yearly discount %, cancellation & refund policy, word comparison rows | `yearlyDiscountPercent` in `0..100`; `mostTeamsStartHere` requires `mostTeamsEvidenceUrl`. |
| `config/changelog.json` | Dated release entries with `New`, `Improved`, `Fixed` tags | Sorted descending by `YYYY-MM-DD`; percentage speedup claims fail without `evidenceUrl`. |
| `config/faq.json` | 8+ questions and answers per locale | Any item with `isDataQuestion: true` must specify a valid `dataJourneyNodeRef`. |
| `config/currencies.json` | Currency rate table (`USD`, `EUR`, `GBP`, `JPY`) and `asOfDate` | Strictly positive rates; `decimals` (`0` for JPY, `2` for USD/EUR/GBP). |
| `config/tokens.css` | CSS Custom Properties for Paper and Night notebooks, typography, and motion | Verified WCAG 2.2 AA contrast ratios (`>= 4.5:1` for text). |

