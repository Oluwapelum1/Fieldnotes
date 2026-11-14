// tests/pricing.test.ts — Unit tests for Pricing vectors (Part 5.9)
import { describe, it, expect } from 'vitest';
import { computePlanPricing } from '../lib/pricing';
import type { CurrencyEntry } from '../lib/currency';

const USD: CurrencyEntry = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  rateFromBase: 1,
  decimals: 2,
};

const JPY_150: CurrencyEntry = {
  code: 'JPY',
  symbol: '¥',
  name: 'Japanese Yen',
  rateFromBase: 150, // 19 * 150 = 2,850 yen
  decimals: 0,
};

describe('Pricing Vectors (Part 5.9)', () => {
  it('computes Team 19/user/month with 20% yearly discount accurately in USD', () => {
    const res = computePlanPricing({
      monthlyPriceInBase: 19,
      yearlyDiscountPercent: 20,
      currency: USD,
      locale: 'en-US',
    });

    // Yearly per person: 19 * 12 * 0.8 = 182.40
    expect(res.yearlyTotalPerUser).toBe(182.4);
    // Effective monthly: 15.20
    expect(res.effectiveMonthlyYearly).toBe(15.2);
    // Saving: 45.60 per person per year
    expect(res.yearlySavingPerUser).toBe(45.6);
  });

  it('computes JPY at 2,850 monthly -> 27,360 yearly, 2,280 effective monthly, with no decimals', () => {
    const res = computePlanPricing({
      monthlyPriceInBase: 19,
      yearlyDiscountPercent: 20,
      currency: JPY_150,
      locale: 'en-US',
    });

    expect(res.monthlyPrice).toBe(2850);
    expect(res.yearlyTotalPerUser).toBe(27360);
    expect(res.effectiveMonthlyYearly).toBe(2280);
    expect(res.formattedYearlyTotal).not.toContain('.');
    expect(res.formattedEffectiveMonthly).not.toContain('.');
  });
});

