// tests/config.test.ts — Unit tests for Config schema validation vectors (Part 5.9)
import { describe, it, expect } from 'vitest';
import {
  ScenarioListSchema,
  DataJourneyConfigSchema,
  validateWithFileContext,
} from '../lib/config-schema';
import { getScenariosForLocale, dataJourneyConfig } from '../lib/config-loader';

describe('Config Validation Vectors (Part 5.9)', () => {
  it('fails a scenario claim with no source and no Inferred/Unknown label, naming file, scenario id, and claim index', () => {
    const validScenario = structuredClone(getScenariosForLocale('en')[0]);
    // Strip sources and claimType from claim index 1
    validScenario.outputCards[0].segments[1].sources = [];
    delete validScenario.outputCards[0].segments[1].claimType;

    const res = validateWithFileContext(
      'config/scenarios/en.json',
      ScenarioListSchema,
      [validScenario]
    );

    expect(res.ok).toBe(false);
    const joined = res.errors.join(' ');
    expect(joined).toContain('config/scenarios/en.json');
    expect(joined).toContain(validScenario.id);
    expect(joined).toContain('claim index 1');
  });

  it('fails a data-journey statement with no evidence link and placeholder: false', () => {
    const badDj = structuredClone(dataJourneyConfig);
    badDj.nodes[0].placeholder = false;
    delete badDj.nodes[0].evidenceUrl;

    const res = validateWithFileContext(
      'config/data-journey.json',
      DataJourneyConfigSchema,
      badDj
    );
    expect(res.ok).toBe(false);
    expect(res.errors.join(' ')).toContain('your-data');
  });

  it('fails a production build when placeholders are present unless allowPlaceholdersInProduction is true', () => {
    const djWithPlaceholders = structuredClone(dataJourneyConfig);
    djWithPlaceholders.nodes[0].placeholder = true;

    const blocked = validateWithFileContext(
      'config/data-journey.json',
      DataJourneyConfigSchema,
      djWithPlaceholders,
      { isProduction: true, allowPlaceholdersInProduction: false }
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.errors.join(' ')).toContain('Placeholder statements are not allowed in production');

    const allowed = validateWithFileContext(
      'config/data-journey.json',
      DataJourneyConfigSchema,
      djWithPlaceholders,
      { isProduction: true, allowPlaceholdersInProduction: true }
    );
    expect(allowed.ok).toBe(true);
  });
});

