// app/[locale]/page.tsx — Main Fieldnotes Landing Page in exact 12-section order (Part 4.1)
import React from 'react';
import {
  siteConfig,
  limitsConfig,
  dataJourneyConfig,
  integrationsConfig,
  pricingConfig,
  changelogConfig,
  faqConfig,
  currenciesConfig,
  getScenariosForLocale,
  getMessagesForLocale,
} from '@/lib/config-loader';
import { normalizeLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { Header } from '@/components/header/header';
import { HeroSection } from '@/components/hero/hero-section';
import { BeforeAfterSection } from '@/components/before-after/before-after-section';
import { ConstellationSection } from '@/components/constellation/constellation-section';
import { LimitsSection } from '@/components/limits/limits-section';
import { DataJourneySection } from '@/components/data-journey/data-journey-section';
import { CalculatorSection } from '@/components/calculator/calculator-section';
import { PricingSection } from '@/components/pricing/pricing-section';
import { ChangelogSection } from '@/components/changelog/changelog-section';
import { FaqSection } from '@/components/faq/faq-section';
import { CtaSection } from '@/components/cta/cta-section';
import { Footer } from '@/components/footer/footer';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale);
  const messages = getMessagesForLocale(locale);
  const scenarios = getScenariosForLocale(locale);
  const faqItems = faqConfig.locales[locale] ?? faqConfig.locales.en ?? [];

  return (
    <>
      {/* 1. Header */}
      <Header
        productName={siteConfig.productName}
        messages={messages.header}
        skipToContentLabel={messages.skipToContent}
      />

      <main>
        {/* 2. Hero: live scripted demo (Part 3.1 & 3.2) */}
        <HeroSection
          scenarios={scenarios}
          messages={messages.hero}
          sampleLabel={messages.sampleBadge}
          showScriptedTag={siteConfig.showScriptedTag}
          allowCustomInput={siteConfig.allowCustomInputInDemo}
        />

        {/* 3. Before and After: chaos to calm (Part 3.4) */}
        <BeforeAfterSection
          messages={messages.beforeAfter}
          sampleLabel={messages.sampleBadge}
        />

        {/* 4. Integration constellation (Part 4.5) */}
        <ConstellationSection
          config={integrationsConfig}
          messages={messages.constellation}
          sampleLabel={messages.sampleBadge}
        />

        {/* 5. Honest limits (Part 3.5 & 4.6) */}
        <LimitsSection
          config={limitsConfig}
          messages={messages.limits}
          sampleLabel={messages.sampleBadge}
          reportLimitationUrl={siteConfig.reportLimitationUrl}
        />

        {/* 6. Data journey (Part 3.6 & 4.7) */}
        <DataJourneySection
          config={dataJourneyConfig}
          messages={messages.dataJourney}
          sampleLabel={messages.sampleBadge}
          requestDeletionUrl={siteConfig.requestDeletionUrl}
          exportDataUrl={siteConfig.exportDataUrl}
        />

        {/* 7. Cost and value calculator (Part 3.7 & 4.8) */}
        <CalculatorSection
          pricingConfig={pricingConfig}
          currenciesConfig={currenciesConfig}
          messages={messages.calculator}
          sampleLabel={messages.sampleBadge}
        />

        {/* 8. Pricing (Part 4.9) */}
        <PricingSection
          config={pricingConfig}
          currenciesConfig={currenciesConfig}
          messages={messages.pricing}
          sampleLabel={messages.sampleBadge}
        />

        {/* 9. Shipped this month (Part 4.10) */}
        <ChangelogSection
          config={changelogConfig}
          messages={messages.changelog}
          sampleLabel={messages.sampleBadge}
        />

        {/* 10. FAQ as a conversation (Part 4.11) */}
        <FaqSection
          items={faqItems}
          messages={messages.faq}
          sampleLabel={messages.sampleBadge}
        />

        {/* 11. Final call to action (Part 4.12) */}
        <CtaSection
          messages={messages.cta}
          formEndpoint={siteConfig.formEndpoint}
          contactEmail={siteConfig.contactEmail}
        />
      </main>

      {/* 12. Footer (Part 4.13) */}
      <Footer
        site={siteConfig}
        messages={messages.footer}
        sampleLabel={messages.sampleBadge}
      />
    </>
  );
}

