// lib/pricing.ts — Pure pricing calculations for monthly/yearly billing and multi-currency rates (Part 4.9 & 5.9)
import { formatCurrencyAmount, type CurrencyEntry } from './currency';

export interface PlanPricingInput {
  monthlyPriceInBase: number;
  yearlyDiscountPercent: number; // e.g., 20 for 20%
  currency: CurrencyEntry;
  locale?: string;
}

export interface PlanPricingResult {
  monthlyPrice: number;
  effectiveMonthlyYearly: number;
  yearlyTotalPerUser: number;
  yearlySavingPerUser: number;
  formattedMonthly: string;
  formattedEffectiveMonthly: string;
  formattedYearlyTotal: string;
  formattedYearlySaving: string;
}

/**
 * Pure pricing function matching Part 5.9 pricing vectors:
 * - Team 19/user/month, 20% discount:
 *   Yearly per person = 19 * 12 * 0.8 = 182.40
 *   Effective monthly = 15.20
 *   Saving = 45.60 per person per year
 * - At a rate that makes monthly price 2,850 JPY (19 * 150 = 2850):
 *   Yearly = 27,360 JPY, effective monthly = 2,280 JPY, no decimals.
 */
export function computePlanPricing(input: PlanPricingInput): PlanPricingResult {
  const { monthlyPriceInBase, yearlyDiscountPercent, currency, locale = 'en-US' } = input;
  const discountFactor = 1 - yearlyDiscountPercent / 100;
  const isZeroDec = currency.decimals === 0;

  const rawMonthly = monthlyPriceInBase * currency.rateFromBase;
  const monthlyPrice = isZeroDec ? Math.round(rawMonthly) : Number(rawMonthly.toFixed(2));

  const rawYearlyUnrounded = monthlyPrice * 12 * discountFactor;
  const yearlyTotalPerUser = isZeroDec
    ? Math.round(rawYearlyUnrounded)
    : Number(rawYearlyUnrounded.toFixed(2));

  const rawEffectiveMonthly = monthlyPrice * discountFactor;
  const effectiveMonthlyYearly = isZeroDec
    ? Math.round(rawEffectiveMonthly)
    : Number(rawEffectiveMonthly.toFixed(2));

  const rawFullYear = monthlyPrice * 12;
  const rawSaving = rawFullYear - yearlyTotalPerUser;
  const yearlySavingPerUser = isZeroDec
    ? Math.round(rawSaving)
    : Number(rawSaving.toFixed(2));

  return {
    monthlyPrice,
    effectiveMonthlyYearly,
    yearlyTotalPerUser,
    yearlySavingPerUser,
    formattedMonthly: formatCurrencyAmount(monthlyPrice, currency, {
      locale,
      forceWholeUnits: Number.isInteger(monthlyPrice),
    }),
    formattedEffectiveMonthly: formatCurrencyAmount(effectiveMonthlyYearly, currency, {
      locale,
      forceWholeUnits: isZeroDec || Number.isInteger(effectiveMonthlyYearly),
    }),
    formattedYearlyTotal: formatCurrencyAmount(yearlyTotalPerUser, currency, {
      locale,
      forceWholeUnits: isZeroDec || Number.isInteger(yearlyTotalPerUser),
    }),
    formattedYearlySaving: formatCurrencyAmount(yearlySavingPerUser, currency, {
      locale,
      forceWholeUnits: isZeroDec || Number.isInteger(yearlySavingPerUser),
    }),
  };
}

