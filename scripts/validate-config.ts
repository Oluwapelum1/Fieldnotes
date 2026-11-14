// scripts/validate-config.ts — Build-time config schema validator with clear file, entry, and field error messages
import fs from 'fs';
import path from 'path';
import {
  SiteConfigSchema,
  ScenarioListSchema,
  LimitsConfigSchema,
  DataJourneyConfigSchema,
  IntegrationsConfigSchema,
  PricingConfigSchema,
  ChangelogConfigSchema,
  FaqConfigSchema,
  CurrenciesConfigSchema,
  validateWithFileContext,
} from '../lib/config-schema';

const rootDir = path.resolve(__dirname, '..');
const configDir = path.join(rootDir, 'config');

function readJson(relPath: string): unknown {
  const fullPath = path.join(rootDir, relPath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allErrors: string[] = [];

  const siteRaw = readJson('config/site.json') as Record<string, unknown>;
  const siteRes = validateWithFileContext('config/site.json', SiteConfigSchema, siteRaw);
  if (!siteRes.ok) allErrors.push(...siteRes.errors);

  const allowPlaceholdersInProduction = Boolean(
    siteRes.data?.allowPlaceholdersInProduction
  );

  const filesToValidate: Array<{ file: string; schema: Parameters<typeof validateWithFileContext>[1] }> = [
    { file: 'config/limits.json', schema: LimitsConfigSchema },
    { file: 'config/data-journey.json', schema: DataJourneyConfigSchema },
    { file: 'config/integrations.json', schema: IntegrationsConfigSchema },
    { file: 'config/pricing.json', schema: PricingConfigSchema },
    { file: 'config/changelog.json', schema: ChangelogConfigSchema },
    { file: 'config/faq.json', schema: FaqConfigSchema },
    { file: 'config/currencies.json', schema: CurrenciesConfigSchema },
    { file: 'config/scenarios/en.json', schema: ScenarioListSchema },
    { file: 'config/scenarios/es.json', schema: ScenarioListSchema },
    { file: 'config/scenarios/de.json', schema: ScenarioListSchema },
    { file: 'config/scenarios/ar.json', schema: ScenarioListSchema },
    { file: 'config/scenarios/ja.json', schema: ScenarioListSchema },
  ];

  for (const item of filesToValidate) {
    const raw = readJson(item.file);
    const res = validateWithFileContext(item.file, item.schema, raw, {
      isProduction,
      allowPlaceholdersInProduction,
    });
    if (!res.ok) {
      allErrors.push(...res.errors);
    }
  }

  if (allErrors.length > 0) {
    console.error('\n❌ Fieldnotes config validation failed:');
    for (const err of allErrors) {
      console.error(`  • ${err}`);
    }
    process.exit(1);
  }

  console.log(`✅ Validated ${filesToValidate.length + 1} Fieldnotes configuration files.`);
}

main();

