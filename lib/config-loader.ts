// lib/config-loader.ts — Central validated configuration and locale message loader for Fieldnotes
import siteRaw from '../config/site.json';
import limitsRaw from '../config/limits.json';
import dataJourneyRaw from '../config/data-journey.json';
import integrationsRaw from '../config/integrations.json';
import pricingRaw from '../config/pricing.json';
import changelogRaw from '../config/changelog.json';
import faqRaw from '../config/faq.json';
import currenciesRaw from '../config/currencies.json';

import scenariosEnRaw from '../config/scenarios/en.json';
import scenariosEsRaw from '../config/scenarios/es.json';
import scenariosDeRaw from '../config/scenarios/de.json';
import scenariosArRaw from '../config/scenarios/ar.json';
import scenariosJaRaw from '../config/scenarios/ja.json';

import messagesEn from '../messages/en.json';
import messagesEs from '../messages/es.json';
import messagesDe from '../messages/de.json';
import messagesAr from '../messages/ar.json';
import messagesJa from '../messages/ja.json';

import {
  SiteConfigSchema,
  LimitsConfigSchema,
  DataJourneyConfigSchema,
  IntegrationsConfigSchema,
  PricingConfigSchema,
  ChangelogConfigSchema,
  FaqConfigSchema,
  CurrenciesConfigSchema,
  ScenarioListSchema,
  type SupportedLocale,
  type Scenario,
} from './config-schema';

export type Messages = typeof messagesEn;

export const siteConfig = SiteConfigSchema.parse(siteRaw);
export const limitsConfig = LimitsConfigSchema.parse(limitsRaw);
export const dataJourneyConfig = DataJourneyConfigSchema.parse(dataJourneyRaw);
export const integrationsConfig = IntegrationsConfigSchema.parse(integrationsRaw);
export const pricingConfig = PricingConfigSchema.parse(pricingRaw);
export const changelogConfig = ChangelogConfigSchema.parse(changelogRaw);
export const faqConfig = FaqConfigSchema.parse(faqRaw);
export const currenciesConfig = CurrenciesConfigSchema.parse(currenciesRaw);

const SCENARIOS_BY_LOCALE: Record<SupportedLocale, Scenario[]> = {
  en: ScenarioListSchema.parse(scenariosEnRaw),
  es: ScenarioListSchema.parse(scenariosEsRaw),
  de: ScenarioListSchema.parse(scenariosDeRaw),
  ar: ScenarioListSchema.parse(scenariosArRaw),
  ja: ScenarioListSchema.parse(scenariosJaRaw),
};

const MESSAGES_BY_LOCALE: Record<SupportedLocale, Messages> = {
  en: messagesEn,
  es: messagesEs,
  de: messagesDe,
  ar: messagesAr,
  ja: messagesJa,
};

export function getScenariosForLocale(locale: SupportedLocale): Scenario[] {
  return SCENARIOS_BY_LOCALE[locale] ?? SCENARIOS_BY_LOCALE.en;
}

export function getMessagesForLocale(locale: SupportedLocale): Messages {
  return MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE.en;
}

