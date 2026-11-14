// tests/calculator.test.ts — Unit tests for Cost and Value Calculator acceptance vectors (Part 5.9)
import { describe, it, expect } from 'vitest';
import { computeCostAndValue } from '../lib/calculator';
import type { CurrencyEntry } from '../lib/currency';

const USD: CurrencyEntry = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  rateFromBase: 1,
  decimals: 2,
};

const JPY_160: CurrencyEntry = {
  code: 'JPY',
  symbol: '¥',
  name: 'Japanese Yen',
  rateFromBase: 160,
  decimals: 0,
};

describe('Cost and Value Calculator Vectors (Part 5.9)', () => {
  it('matches all USD acceptance vectors for team 5, 2 hrs/wk, $40/hr, Team plan $19', () => {
    const res = computeCostAndValue({
      teamSize: 5,
      hoursSavedPerWeek: 2,
      hourlyCostInBase: 40,
      monthlyPlanPricePerUserInBase: 19,
      currency: USD,
      locale: 'en-US',
    });

    // Weekly value: 5 * 2 * 40 = 400
    expect(res.weeklyValue).toBe(400);
    // Monthly value (x 4.33) = 1,732.00
    expect(res.monthlyValueFull).toBe(1732.0);
    // Range at 60% and 100%: 1,039.20 to 1,732.00
    expect(res.grossRangeLow).toBe(1039.2);
    expect(res.grossRangeHigh).toBe(1732.0);
    // Displayed at 2 significant figures as 1,000 to 1,700
    expect(res.grossDisplayLow).toBe(1000);
    expect(res.grossDisplayHigh).toBe(1700);
    expect(res.grossFormattedRange).toBe('1,000 to 1,700');

    // Plan cost: 5 * 19 = 95
    expect(res.planMonthlyCost).toBe(95);
    // Net of plan cost: 944.20 to 1,637.00, displayed as 940 to 1,600
    expect(res.netRangeLow).toBe(944.2);
    expect(res.netRangeHigh).toBe(1637.0);
    expect(res.netDisplayLow).toBe(940);
    expect(res.netDisplayHigh).toBe(1600);
    expect(res.netFormattedRange).toBe('940 to 1,600');

    // Payback in working days (cost / (monthly value / 21.7)): about 1.2 to 2.0
    expect(res.paybackDaysLow).toBe(1.2);
    expect(res.paybackDaysHigh).toBe(2.0);
    expect(res.paybackFormatted).toBe('1.2 to 2.0');
  });

  it('matches JPY vector at 160 yen per unit (166,272 to 277,120 -> 170,000 to 280,000 with no decimals)', () => {
    const res = computeCostAndValue({
      teamSize: 5,
      hoursSavedPerWeek: 2,
      hourlyCostInBase: 40,
      monthlyPlanPricePerUserInBase: 19,
      currency: JPY_160,
      locale: 'en-US',
    });

    expect(res.grossRangeLow).toBe(166272);
    expect(res.grossRangeHigh).toBe(277120);
    expect(res.grossFormattedRange).toBe('170,000 to 280,000');
    expect(res.grossFormattedRange).not.toContain('.');
  });

  it('handles hours saved of 0 safely with value 0 and payback Not applicable (never a division error)', () => {
    const res = computeCostAndValue({
      teamSize: 5,
      hoursSavedPerWeek: 0,
      hourlyCostInBase: 40,
      monthlyPlanPricePerUserInBase: 19,
      currency: USD,
    });

    expect(res.weeklyValue).toBe(0);
    expect(res.monthlyValueFull).toBe(0);
    expect(res.paybackDaysLow).toBeNull();
    expect(res.paybackDaysHigh).toBeNull();
    expect(res.paybackFormatted).toBe('Not applicable');
  });
});

