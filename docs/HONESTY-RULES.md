# Fieldnotes Honesty Rules (Non-Negotiable)

Fieldnotes enforces four automated honesty checks during `npm run check:all` and `npm run build`:

1. **Visible Scripted Demo Disclosure (`site.json` → `showScriptedTag`)**:
   - The hero demo ships with `"Sample run, scripted for this demo"` visible beneath the status bar at all times.
   - `lib/config-schema.ts` rejects any config that sets `showScriptedTag: false` while `liveEngineActive` is `false`.
   - When a visitor pastes custom text in `"Try your own text"`, `lib/demo-engine/structure-only.ts` runs a purely structural line/word count and explicitly states: *"This demo is scripted, so it can't read your text."*

2. **Copy-Lint (`scripts/lint-copy.ts` & `lib/copy-lint.ts`)**:
   - Scans all 18 config and locale files for unverified compliance, certification, accuracy, or security guarantees (`certified`, `compliant`, `guaranteed`, `100 percent secure`, `100% accurate`, `never wrong`, `zero hallucinations`). Any match fails the build unless the entry carries a valid `https://` `evidenceUrl`.
   - Bans empty marketing hype words outright (`unlock`, `elevate`, `seamless`, `revolutionary`, `game-changing`, `supercharge`).

3. **Data Journey Placeholders (`config/data-journey.json`)**:
   - Every node statement must either link to an `evidenceUrl` or be marked `placeholder: true` (which renders a red-pencil `✎ Fill me in` badge in the UI).
   - Before launching a real product, replace all placeholder statements, supply real subprocessor details, and have legal counsel review your privacy and security disclosures.

4. **Sample Flag Audit (`scripts/check-sample-flags.ts`)**:
   - Every demo person, quote, limitation, integration, price, and changelog entry carries `"sample": true` and displays a `[sample]` badge in the UI.
   - Set `"failOnSampleInProduction": true` in `config/site.json` when you are ready to ensure zero sample items slip into your live deployment.

