// components/calculator/calculator-section.tsx — Cost & Value Calculator with pencil-drawn range bar, formula notes, and copy summary (Part 3.7 & 4.8)
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CurrenciesConfig, PricingConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import {
  computeCostAndValue,
  WEEKS_PER_MONTH,
  WORKING_DAYS_PER_MONTH,
} from '@/lib/calculator';
import { formatCurrencyAmount } from '@/lib/currency';
import { useNotebook } from '../notebook-context';
import { AnnotationMark } from '../annotations/annotation-mark';
import { SampleTag } from '../annotations/sample-tag';

function useOdometerNumber(target: number, durationMs: number): number {
  const [display, setDisplay] = useState<number>(target);
  const prevRef = useRef<number>(target);

  useEffect(() => {
    if (durationMs <= 0 || prevRef.current === target) {
      setDisplay(target);
      prevRef.current = target;
      return;
    }
    const startVal = prevRef.current;
    const diff = target - startVal;
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      // ease-out-quint: 1 - (1 - t)^5
      const eased = 1 - Math.pow(1 - t, 5);
      setDisplay(Math.round(startVal + diff * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplay(target);
        prevRef.current = target;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return display;
}

export interface CalculatorSectionProps {
  pricingConfig: PricingConfig;
  currenciesConfig: CurrenciesConfig;
  messages: Messages['calculator'];
  sampleLabel: string;
}

export function CalculatorSection({
  pricingConfig,
  currenciesConfig,
  messages,
  sampleLabel,
}: CalculatorSectionProps) {
  const { currency, setCurrencyByCode, locale, motion } = useNotebook();

  // Default to the Part 5.9 vector values: Team 5, 2 hrs/wk, 40/hr, Team plan ($19)
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hoursSaved, setHoursSaved] = useState<number>(2);
  const [hourlyCostBase, setHourlyCostBase] = useState<number>(40);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('team');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedPlan =
    pricingConfig.plans.find((p) => p.id === selectedPlanId) ??
    pricingConfig.plans[1] ??
    pricingConfig.plans[0];

  const calc = useMemo(
    () =>
      computeCostAndValue({
        teamSize,
        hoursSavedPerWeek: hoursSaved,
        hourlyCostInBase: hourlyCostBase,
        monthlyPlanPricePerUserInBase: selectedPlan.monthlyPricePerUser,
        currency,
        locale,
      }),
    [teamSize, hoursSaved, hourlyCostBase, selectedPlan, currency, locale]
  );

  const odometerDuration = motion === 'off' ? 0 : motion === 'calm' ? 360 : 600;
  const animatedGrossLow = useOdometerNumber(calc.grossDisplayLow, odometerDuration);
  const animatedGrossHigh = useOdometerNumber(calc.grossDisplayHigh, odometerDuration);
  const animatedNetLow = useOdometerNumber(calc.netDisplayLow, odometerDuration);
  const animatedNetHigh = useOdometerNumber(calc.netDisplayHigh, odometerDuration);
  const animatedGrossRangeStr = `${animatedGrossLow.toLocaleString('en-US')} to ${animatedGrossHigh.toLocaleString('en-US')}`;
  const animatedNetRangeStr = `${animatedNetLow.toLocaleString('en-US')} to ${animatedNetHigh.toLocaleString('en-US')}`;

  const formattedPlanCost = formatCurrencyAmount(calc.planMonthlyCost, currency, {
    locale,
    forceWholeUnits: Number.isInteger(calc.planMonthlyCost),
  });

  const handleCopySummary = async () => {
    const summaryText = [
      `Fieldnotes Value Estimate (${currency.code})`,
      `- Team size: ${teamSize}`,
      `- Hours saved / person / week: ${hoursSaved}`,
      `- Hourly cost (base): ${hourlyCostBase}`,
      `- Plan: ${selectedPlan.name} (${formattedPlanCost}/mo)`,
      `- Monthly value range (60%-100%): ${currency.symbol}${calc.grossFormattedRange}`,
      `- Net monthly range: ${currency.symbol}${calc.netFormattedRange}`,
      `- Payback in working days: ${calc.paybackFormatted}`,
      `Note: ${messages.disclaimer}`,
    ].join('\n');

    try {
      await navigator.clipboard?.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  return (
    <section
      aria-labelledby="calculator-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 columns: Formula and assumptions written as margin notes with leader lines (Part 4.8) */}
        <div className="lg:col-span-4 space-y-4">
          <h2
            id="calculator-heading"
            className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
          >
            <span>{messages.headlineBefore}</span>
            <em className="italic font-normal text-[var(--color-ink-blue)]">
              {messages.headlineItalic}
            </em>
            <span>{messages.headlineAfter}</span>
          </h2>

          <p className="p-3 rounded-[2px] bg-[var(--color-ink-blue-soft)] border-s-2 border-[var(--color-ink-blue)] font-mono text-xs text-[var(--color-ink)] leading-relaxed">
            {messages.leverNote}
          </p>

          <div className="p-4 rounded-[2px] border border-dashed border-[var(--color-border-warm)] bg-[var(--color-card)] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wider text-[var(--color-ink-blue)] font-semibold">
                {messages.formulaHeading}
              </span>
              <SampleTag show={pricingConfig.sample} label={sampleLabel} />
            </div>

            <ul className="space-y-2 text-[var(--color-ink-muted)]">
              <li className="flex items-center justify-between gap-2">
                <span>• {messages.assumptionWeeks}</span>
                <span className="tabular-nums text-[var(--color-ink)]">
                  ×{WEEKS_PER_MONTH}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span>• {messages.assumptionDays}</span>
                <span className="tabular-nums text-[var(--color-ink)]">
                  ÷{WORKING_DAYS_PER_MONTH}
                </span>
              </li>
              <li>• {messages.assumptionRealisation}</li>
            </ul>

            <AnnotationMark
              kind="wobbly-line"
              seed={611}
              width={200}
              height={10}
              color="ink-blue"
            />

            <p className="text-[11px] text-[var(--color-ink-muted)]">
              Monthly gross = Team × Hours/wk × Rate × 4.33 × [0.60 .. 1.00]
            </p>
          </div>
        </div>

        {/* Right 8 columns: Inputs card and Results card with pencil-drawn range bar */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 sm:p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Team Size Slider + Number Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="calc-team-size"
                    className="font-mono text-xs text-[var(--color-ink)] font-medium"
                  >
                    {messages.inputTeamSize}
                  </label>
                  <input
                    id="calc-team-size-num"
                    type="number"
                    min={1}
                    max={500}
                    aria-label={messages.inputTeamSize}
                    value={teamSize}
                    onChange={(e) =>
                      setTeamSize(
                        Math.max(1, Math.min(500, Number(e.target.value) || 1))
                      )
                    }
                    className="w-20 px-2 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs tabular-nums text-end"
                  />
                </div>
                <input
                  id="calc-team-size"
                  type="range"
                  min={1}
                  max={500}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-[var(--color-ink-blue)]"
                />
              </div>

              {/* Hours saved per person per week (0 to 20 in steps of 0.5) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="calc-hours-saved"
                    className="font-mono text-xs text-[var(--color-ink)] font-medium"
                  >
                    {messages.inputHoursSaved}
                  </label>
                  <input
                    id="calc-hours-saved-num"
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    aria-label={messages.inputHoursSaved}
                    value={hoursSaved}
                    onChange={(e) =>
                      setHoursSaved(
                        Math.max(0, Math.min(20, Number(e.target.value) || 0))
                      )
                    }
                    className="w-20 px-2 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs tabular-nums text-end"
                  />
                </div>
                <input
                  id="calc-hours-saved"
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={hoursSaved}
                  onChange={(e) => setHoursSaved(Number(e.target.value))}
                  className="w-full accent-[var(--color-ink-blue)]"
                />
              </div>

              {/* Average hourly cost in base currency */}
              <div>
                <label
                  htmlFor="calc-hourly-cost"
                  className="block font-mono text-xs text-[var(--color-ink)] font-medium mb-1.5"
                >
                  {messages.inputHourlyCost} ({pricingConfig.baseCurrency})
                </label>
                <input
                  id="calc-hourly-cost"
                  type="number"
                  min={1}
                  max={1000}
                  value={hourlyCostBase}
                  onChange={(e) =>
                    setHourlyCostBase(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full px-3 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-sm tabular-nums"
                />
              </div>

              {/* Plan Select + Currency Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="calc-plan-select"
                    className="block font-mono text-xs text-[var(--color-ink)] font-medium mb-1.5"
                  >
                    {messages.inputPlan}
                  </label>
                  <select
                    id="calc-plan-select"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs"
                  >
                    {pricingConfig.plans.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} (${pl.monthlyPricePerUser}/u)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calc-currency-select"
                    className="block font-mono text-xs text-[var(--color-ink)] font-medium mb-1.5"
                  >
                    {messages.inputCurrency.replace(
                      '{date}',
                      currenciesConfig.asOfDate
                    )}
                  </label>
                  <select
                    id="calc-currency-select"
                    value={currency.code}
                    onChange={(e) => setCurrencyByCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs"
                  >
                    {currenciesConfig.currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div
              aria-live="polite"
              className="mt-6 pt-5 border-t border-[var(--color-border-warm)] space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-border-warm)]">
                  <div className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                    {messages.outGrossRange}
                  </div>
                  <div
                    data-testid="calc-gross-range"
                    className="mt-1 font-mono text-base font-bold tabular-nums text-[var(--color-ink)]"
                  >
                    {currency.symbol}
                    {animatedGrossRangeStr}
                  </div>
                </div>

                <div className="p-3 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-border-warm)]">
                  <div className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                    {messages.outPlanCost}
                  </div>
                  <div
                    data-testid="calc-plan-cost"
                    className="mt-1 font-mono text-base font-bold tabular-nums text-[var(--color-ink)]"
                  >
                    {formattedPlanCost}
                  </div>
                </div>

                <div className="p-3 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-ink-blue)]">
                  <div className="font-mono text-[11px] text-[var(--color-ink-blue)]">
                    {messages.outNetRange}
                  </div>
                  <div
                    data-testid="calc-net-range"
                    className="mt-1 font-mono text-base font-bold tabular-nums text-[var(--color-ink-blue)]"
                  >
                    {currency.symbol}
                    {animatedNetRangeStr}
                  </div>
                </div>

                <div className="p-3 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-border-warm)]">
                  <div className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                    {messages.outPayback}
                  </div>
                  <div
                    data-testid="calc-payback"
                    className="mt-1 font-mono text-base font-bold tabular-nums text-[var(--color-green-pen)]"
                  >
                    {calc.paybackDaysLow !== null
                      ? `${calc.paybackFormatted} ${messages.outPaybackUnit}`
                      : calc.paybackFormatted}
                  </div>
                </div>
              </div>

              {/* Hand-drawn pencil range bar between 60% and 100% realisation */}
              <div className="p-3 rounded-[2px] bg-[var(--color-page)]/60 border border-dashed border-[var(--color-border-warm)]">
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--color-ink-muted)] mb-1">
                  <span>
                    60% realisation ({currency.symbol}
                    {calc.grossDisplayLow.toLocaleString()})
                  </span>
                  <span>
                    100% realisation ({currency.symbol}
                    {calc.grossDisplayHigh.toLocaleString()})
                  </span>
                </div>
                <AnnotationMark
                  kind="wobbly-line"
                  seed={650 + teamSize + Math.round(hoursSaved * 10)}
                  width={480}
                  height={14}
                  color="ink-blue"
                  className="w-full"
                />
              </div>

              {/* Mandatory disclaimer & Copy Summary button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="font-mono text-xs text-[var(--color-ink-muted)]">
                  {messages.disclaimer}{' '}
                  <SampleTag show={pricingConfig.sample} label={sampleLabel} />
                </p>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink-blue)] hover:bg-[var(--color-ink-blue-soft)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
                >
                  {copied ? messages.copied : messages.copySummary}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

