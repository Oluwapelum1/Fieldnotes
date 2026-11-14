// scripts/check-sample-flags.ts — Scans config files for items still flagged `sample: true` and warns or fails in production
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

const CONFIG_FILES = [
  'config/site.json',
  'config/limits.json',
  'config/data-journey.json',
  'config/integrations.json',
  'config/pricing.json',
  'config/changelog.json',
  'config/faq.json',
  'config/currencies.json',
  'config/scenarios/en.json',
];

export function findSampleFlags(rootName: string, obj: unknown): string[] {
  const locations: string[] = [];

  function walk(node: unknown, currentPath: string) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((item, idx) => walk(item, `${currentPath}[${idx}]`));
      return;
    }
    const rec = node as Record<string, unknown>;
    if (rec.sample === true || rec.sampleFlag === true) {
      const idPart = typeof rec.id === 'string' ? ` (id="${rec.id}")` : '';
      locations.push(`${currentPath}${idPart}`);
    }
    for (const [k, v] of Object.entries(rec)) {
      walk(v, `${currentPath}.${k}`);
    }
  }

  walk(obj, rootName);
  return locations;
}

function main() {
  const siteRaw = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'config/site.json'), 'utf-8')
  ) as { failOnSampleInProduction?: boolean };

  const allSampleItems: string[] = [];
  for (const relPath of CONFIG_FILES) {
    const data = JSON.parse(fs.readFileSync(path.join(rootDir, relPath), 'utf-8'));
    allSampleItems.push(...findSampleFlags(relPath, data));
  }

  if (allSampleItems.length > 0) {
    console.warn(
      `\n⚠️  [Sample Flag Check] Found ${allSampleItems.length} sample-flagged items in config (Honesty Rule 1.6):`
    );
    allSampleItems.slice(0, 12).forEach((item) => console.warn(`   - ${item}`));
    if (allSampleItems.length > 12) {
      console.warn(`   ...and ${allSampleItems.length - 12} more sample items.`);
    }
    console.warn(
      '   Replace sample items with your real product data and set "sample": false before launching.\n'
    );

    if (
      process.env.NODE_ENV === 'production' &&
      siteRaw.failOnSampleInProduction === true
    ) {
      console.error(
        '❌ Build failed because failOnSampleInProduction is true and sample items remain.'
      );
      process.exit(1);
    }
  } else {
    console.log('✅ No sample-flagged items remain in config.');
  }
}

main();

