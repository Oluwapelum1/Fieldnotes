// scripts/lint-copy.ts — Build-time copy-lint scanner enforcing Honesty Rule 1.6 and Voice Rule 1.8
import fs from 'fs';
import path from 'path';
import { lintStructuredObject, type CopyLintFinding } from '../lib/copy-lint';

const rootDir = path.resolve(__dirname, '..');

const JSON_FILES = [
  'config/site.json',
  'config/limits.json',
  'config/data-journey.json',
  'config/integrations.json',
  'config/pricing.json',
  'config/changelog.json',
  'config/faq.json',
  'config/currencies.json',
  'config/scenarios/en.json',
  'config/scenarios/es.json',
  'config/scenarios/de.json',
  'config/scenarios/ar.json',
  'config/scenarios/ja.json',
  'messages/en.json',
  'messages/es.json',
  'messages/de.json',
  'messages/ar.json',
  'messages/ja.json',
];

function main() {
  const findings: CopyLintFinding[] = [];

  for (const relPath of JSON_FILES) {
    const fullPath = path.join(rootDir, relPath);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    findings.push(...lintStructuredObject(relPath, data));
  }

  if (findings.length > 0) {
    console.error('\n❌ Fieldnotes copy-lint failed:');
    for (const f of findings) {
      console.error(`  • ${f.message}`);
    }
    process.exit(1);
  }

  console.log(`✅ Copy-lint passed across ${JSON_FILES.length} config and locale files (0 unverified claims, 0 hype words).`);
}

main();

