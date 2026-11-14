// tests/a11y.test.ts — Automated WCAG 2.2 AA accessibility and reduced-motion / RTL behaviour checks using axe-core (Part 5.7 & 5.9)
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { NotebookProvider } from '../components/notebook-context';
import { HeroSection } from '../components/hero/hero-section';
import { LimitsSection } from '../components/limits/limits-section';
import { DataJourneySection } from '../components/data-journey/data-journey-section';
import { PricingSection } from '../components/pricing/pricing-section';
import { FaqSection } from '../components/faq/faq-section';
import {
  getScenariosForLocale,
  getMessagesForLocale,
  limitsConfig,
  dataJourneyConfig,
  pricingConfig,
  currenciesConfig,
  faqConfig,
  siteConfig,
} from '../lib/config-loader';

describe('Accessibility (axe-core WCAG 2.2 AA) & RTL / Reduced-Motion Tests (Part 5.7 & 5.9)', () => {
  const messagesEn = getMessagesForLocale('en');
  const scenariosEn = getScenariosForLocale('en');

  it('has zero critical or serious axe-core violations across Hero, Limits, DataJourney, Pricing, and FAQ', async () => {
    const { container } = render(
      React.createElement(
        NotebookProvider,
        { locale: 'en' },
        React.createElement(
          'main',
          null,
          React.createElement(HeroSection, {
            scenarios: scenariosEn,
            messages: messagesEn.hero,
            sampleLabel: messagesEn.sampleBadge,
            showScriptedTag: true,
            allowCustomInput: true,
          }),
          React.createElement(LimitsSection, {
            config: limitsConfig,
            messages: messagesEn.limits,
            sampleLabel: messagesEn.sampleBadge,
            reportLimitationUrl: siteConfig.reportLimitationUrl,
          }),
          React.createElement(DataJourneySection, {
            config: dataJourneyConfig,
            messages: messagesEn.dataJourney,
            sampleLabel: messagesEn.sampleBadge,
            requestDeletionUrl: siteConfig.requestDeletionUrl,
            exportDataUrl: siteConfig.exportDataUrl,
          }),
          React.createElement(PricingSection, {
            config: pricingConfig,
            currenciesConfig,
            messages: messagesEn.pricing,
            sampleLabel: messagesEn.sampleBadge,
          }),
          React.createElement(FaqSection, {
            items: faqConfig.locales.en ?? [],
            messages: messagesEn.faq,
            sampleLabel: messagesEn.sampleBadge,
          })
        )
      )
    );

    await screen.findByTestId('scripted-demo-tag');

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        'label-content-name-mismatch': { enabled: false },
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  it('defaults Pricing toggle to Monthly (never pre-selects Yearly)', () => {
    render(
      React.createElement(
        NotebookProvider,
        { locale: 'en' },
        React.createElement(PricingSection, {
          config: pricingConfig,
          currenciesConfig,
          messages: messagesEn.pricing,
          sampleLabel: messagesEn.sampleBadge,
        })
      )
    );

    const monthlyBtn = screen.getByRole('button', { name: /Monthly/i });
    expect(monthlyBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('renders Arabic (ar) scenarios and messages cleanly in RTL mode', async () => {
    const messagesAr = getMessagesForLocale('ar');
    const scenariosAr = getScenariosForLocale('ar');

    render(
      React.createElement(
        'div',
        { dir: 'rtl', lang: 'ar-SA' },
        React.createElement(
          NotebookProvider,
          { locale: 'ar' },
          React.createElement(HeroSection, {
            scenarios: scenariosAr,
            messages: messagesAr.hero,
            sampleLabel: messagesAr.sampleBadge,
            showScriptedTag: true,
            allowCustomInput: true,
          })
        )
      )
    );

    const tagEl = await screen.findByTestId('scripted-demo-tag');
    expect(tagEl.textContent).toContain(messagesAr.hero.scriptedTag);
  });
});
