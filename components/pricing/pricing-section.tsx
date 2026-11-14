// components/pricing/pricing-section.tsx — Interactive unequal-height pricing cards (clickable Free / Team / Business selection), Monthly default toggle, instant trial checkout drawer, and comparison matrix (Part 4.9)
'use client';

import React, { useState } from 'react';
import type { CurrenciesConfig, PricingConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import { computePlanPricing } from '@/lib/pricing';
import { useNotebook } from '../notebook-context';
import { SampleTag } from '../annotations/sample-tag';

export interface PricingSectionProps {
  config: PricingConfig;
  currenciesConfig: CurrenciesConfig;
  messages: Messages['pricing'];
  sampleLabel: string;
}

export function PricingSection({
  config,
  currenciesConfig,
  messages,
  sampleLabel,
}: PricingSectionProps) {
  const {
    currency,
    setCurrencyByCode,
    locale,
    selectedPlanId,
    setSelectedPlanId,
    billingPeriod,
    setBillingPeriod,
  } = useNotebook();

  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState<boolean>(false);
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [quickSubmitted, setQuickSubmitted] = useState<boolean>(false);

  // Deliberately different heights aligned along the bottom (Part 4.9)
  const cardMinHeights = ['min-h-[370px]', 'min-h-[420px]', 'min-h-[465px]'];

  const activePlan =
    config.plans.find((p) => p.id === selectedPlanId) ?? config.plans[1] ?? config.plans[0];

  const activePlanPricing = activePlan
    ? computePlanPricing({
        monthlyPriceInBase: activePlan.monthlyPricePerUser,
        yearlyDiscountPercent: config.yearlyDiscountPercent,
        currency,
        locale,
      })
    : null;

  const handlePlanCardClick = (planId: string) => {
    setSelectedPlanId(planId);
    setQuickSubmitted(false);
  };

  const handlePlanCtaClick = (planId: string) => {
    setSelectedPlanId(planId);
    setCheckoutDrawerOpen(true);
    setQuickSubmitted(false);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail.includes('@')) return;
    setQuickSubmitted(true);
  };

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2
            id="pricing-heading"
            className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
          >
            <span>{messages.headlineBefore}</span>
            <em className="italic font-normal text-[var(--color-ink-blue)]">
              {messages.headlineItalic}
            </em>
            <span>{messages.headlineAfter}</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-[var(--color-ink-muted)]">
            {config.taxNotice}{' '}
            <SampleTag show={config.sample} label={sampleLabel} />
          </p>
        </div>

        {/* Monthly / Yearly toggle (defaults to Monthly) + Currency selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Billing frequency"
            className="inline-flex rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] p-0.5"
          >
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              aria-pressed={billingPeriod === 'monthly'}
              className={`px-3 py-1.5 rounded-[2px] font-mono text-xs cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                billingPeriod === 'monthly'
                  ? 'bg-[var(--color-ink-blue)] text-[var(--color-card)] font-medium'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {messages.billingMonthly}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              aria-pressed={billingPeriod === 'yearly'}
              className={`px-3 py-1.5 rounded-[2px] font-mono text-xs cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                billingPeriod === 'yearly'
                  ? 'bg-[var(--color-ink-blue)] text-[var(--color-card)] font-medium'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {messages.billingYearly.replace(
                '{discount}',
                String(config.yearlyDiscountPercent)
              )}
            </button>
          </div>

          <select
            aria-label="Pricing currency"
            value={currency.code}
            onChange={(e) => setCurrencyByCode(e.target.value)}
            className="px-2.5 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink)] cursor-pointer"
          >
            {currenciesConfig.currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Three interactive plan cards of deliberately different heights aligned along the bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {config.plans.map((plan, idx) => {
          const isSelected = selectedPlanId === plan.id;
          const priceCalc = computePlanPricing({
            monthlyPriceInBase: plan.monthlyPricePerUser,
            yearlyDiscountPercent: config.yearlyDiscountPercent,
            currency,
            locale,
          });

          const displayedPrice =
            billingPeriod === 'yearly' && plan.monthlyPricePerUser > 0
              ? priceCalc.formattedEffectiveMonthly
              : priceCalc.formattedMonthly;

          return (
            <div
              key={plan.id}
              onClick={() => handlePlanCardClick(plan.id)}
              className={`group flex flex-col justify-between p-6 rounded-[2px] cursor-pointer transition-all duration-200 ${
                cardMinHeights[idx] ?? 'min-h-[400px]'
              } ${
                isSelected
                  ? 'border-2 border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)] shadow-[var(--shadow-popover)] -translate-y-1'
                  : 'border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)] hover:border-[var(--color-ink-blue)]/60 hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-semibold text-[var(--color-ink)]">
                      {plan.name}
                    </h3>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--color-green-pen-soft)] border border-[var(--color-green-pen)] text-[var(--color-green-pen)] font-mono text-[10px] uppercase font-semibold">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.mostTeamsStartHere && plan.mostTeamsEvidenceUrl && (
                      <span className="px-2 py-0.5 rounded-[2px] bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)] font-mono text-[11px]">
                        {messages.mostTeamsBadge}
                      </span>
                    )}
                    <SampleTag show={plan.sample} label={sampleLabel} />
                  </div>
                </div>

                <div className="my-4">
                  <div className="flex items-baseline gap-2">
                    <span
                      data-testid={`plan-price-${plan.id}`}
                      className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-[var(--color-ink)]"
                    >
                      {displayedPrice}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                      {messages.perUserMonth}
                    </span>
                  </div>

                  {billingPeriod === 'yearly' && plan.monthlyPricePerUser > 0 && (
                    <p
                      data-testid={`plan-yearly-note-${plan.id}`}
                      className="mt-1.5 font-mono text-xs text-[var(--color-green-pen)]"
                    >
                      {messages.billedYearlyNote
                        .replace('{total}', priceCalc.formattedYearlyTotal)
                        .replace('{saving}', priceCalc.formattedYearlySaving)}
                    </p>
                  )}
                </div>

                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4">
                  {plan.whoItsFor}
                </p>

                <ul className="space-y-2 border-t border-[var(--color-border-warm)] pt-4 text-xs sm:text-sm">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[var(--color-ink-blue)] font-bold"
                      >
                        ·
                      </span>
                      <span className="text-[var(--color-ink)]">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanCtaClick(plan.id);
                  }}
                  aria-pressed={isSelected}
                  className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-[2px] font-mono text-xs font-medium cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)] ${
                    isSelected
                      ? 'bg-[var(--color-ink-blue)] text-[var(--color-card)] hover:opacity-95'
                      : 'border border-[var(--color-ink-blue)] text-[var(--color-ink-blue)] bg-[var(--color-page)] hover:bg-[var(--color-ink-blue)] hover:text-[var(--color-card)]'
                  }`}
                >
                  {plan.ctaLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Selected Plan Action / Trial Drawer */}
      {checkoutDrawerOpen && activePlan && activePlanPricing && (
        <div
          role="region"
          aria-label="Selected plan activation"
          className="mt-6 p-5 rounded-[2px] border-2 border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)] shadow-[var(--shadow-popover)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-semibold">
                ACTIVE PLAN: {activePlan.name.toUpperCase()}
              </span>
              <span className="text-[var(--color-ink)] font-semibold">
                {billingPeriod === 'yearly' && activePlan.monthlyPricePerUser > 0
                  ? `${activePlanPricing.formattedEffectiveMonthly} ${messages.perUserMonth} (Yearly)`
                  : `${activePlanPricing.formattedMonthly} ${messages.perUserMonth} (Monthly)`}
              </span>
              <SampleTag show={activePlan.sample} label={sampleLabel} />
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
              {activePlan.whoItsFor} No credit card required to open a sample workspace.
            </p>
          </div>

          {quickSubmitted ? (
            <div className="flex items-center gap-3 p-2.5 rounded-[2px] border border-[var(--color-green-pen)] bg-[var(--color-green-pen-soft)] font-mono text-xs text-[var(--color-green-pen)]">
              <span>
                ✓ Sample {activePlan.name} invite prepared for{' '}
                <strong>{quickEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCheckoutDrawerOpen(false)}
                className="underline text-[var(--color-ink)] cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleQuickSubmit}
              className="flex flex-wrap items-center gap-2"
            >
              <label htmlFor="pricing-quick-email" className="sr-only">
                Work email for {activePlan.name} plan
              </label>
              <input
                id="pricing-quick-email"
                type="email"
                required
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                placeholder="you@company.com"
                className="px-3 py-2 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-mono text-xs font-medium cursor-pointer hover:opacity-95"
              >
                {activePlan.ctaLabel} →
              </button>
              <button
                type="button"
                onClick={() => setCheckoutDrawerOpen(false)}
                className="px-2.5 py-2 rounded-[2px] border border-[var(--color-border-warm)] font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
              >
                ✕
              </button>
            </form>
          )}
        </div>
      )}

      {/* Honest policy blocks below cards: Free plan limits, 2-click cancellation, 14-day refund */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-[2px] border border-dashed border-[var(--color-border-warm)] bg-[var(--color-card)] text-xs leading-relaxed">
        <div>
          <h4 className="font-mono font-semibold text-[var(--color-ink)] mb-1">
            {messages.freeLimitsHeading}
          </h4>
          <ul className="space-y-1 text-[var(--color-ink-muted)]">
            {config.freePlanLimits.map((lim) => (
              <li key={lim}>• {lim}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-mono font-semibold text-[var(--color-ink)] mb-1">
            {messages.cancellationHeading}
          </h4>
          <p className="text-[var(--color-ink-muted)]">
            {config.cancellationPolicy}
          </p>
        </div>
        <div>
          <h4 className="font-mono font-semibold text-[var(--color-ink)] mb-1">
            {messages.refundHeading}
          </h4>
          <p className="text-[var(--color-ink-muted)]">{config.refundPolicy}</p>
        </div>
      </div>

      {/* Plain comparison table with words instead of ticks (Part 4.9) */}
      <div className="mt-8 p-4 sm:p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
            {messages.comparisonHeading}
          </h3>
          <span className="font-mono text-xs text-[var(--color-ink-blue)]">
            Click any plan column or card above to compare (Active:{' '}
            <strong>{activePlan?.name}</strong>)
          </span>
        </div>
        <table className="w-full text-start border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-warm)] font-mono text-[11px] uppercase text-[var(--color-ink-muted)]">
              <th scope="col" className="py-2.5 pe-4 text-start">
                Capability
              </th>
              {config.plans.map((p) => {
                const isColSelected = p.id === selectedPlanId;
                return (
                  <th
                    key={p.id}
                    scope="col"
                    onClick={() => handlePlanCardClick(p.id)}
                    className={`py-2.5 px-4 text-start cursor-pointer transition-colors ${
                      isColSelected
                        ? 'text-[var(--color-ink-blue)] bg-[var(--color-ink-blue-soft)]/50 font-bold'
                        : 'hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {p.name} {isColSelected ? '✓' : ''}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-warm)]">
            {config.comparisonRows.map((row) => (
              <tr key={row.feature}>
                <td className="py-3 pe-4 font-medium text-[var(--color-ink)]">
                  {row.feature}
                </td>
                {config.plans.map((p) => {
                  const val = row.values[p.id] ?? 'Not included';
                  const isColSelected = p.id === selectedPlanId;
                  return (
                    <td
                      key={p.id}
                      onClick={() => handlePlanCardClick(p.id)}
                      className={`py-3 px-4 font-mono text-xs cursor-pointer transition-colors ${
                        isColSelected ? 'bg-[var(--color-ink-blue-soft)]/30 ' : ''
                      }${
                        val === 'Not included'
                          ? 'text-[var(--color-ink-muted)]'
                          : 'text-[var(--color-ink)] font-medium'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
