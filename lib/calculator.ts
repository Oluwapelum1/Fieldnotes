// lib/calculator.ts — Pure Cost and Value Calculator logic (Part 3.7 and 5.9 vectors)
import {
  formatSignificantRangeValue,
  roundToSignificantFigures,
  type CurrencyEntry,
} from './currency';

export const WEEKS_PER_MONTH = 4.33;
export const WORKING_DAYS_PER_MONTH = 21.7;
export const REALISATION_LOW = 0.6;
export const REALISATION_HIGH = 1.0;

export interface CalculatorInput {
  teamSize: number; // 1 to 500
  hoursSavedPerWeek: number; // 0 to 20 (steps of 0.5)
  hourlyCostInBase: number; // in base currency or selected currency
  monthlyPlanPricePerUserInBase: number;
  currency: CurrencyEntry;
  HourlyCostAlreadyInCurrency?: boolean;
  locale?: string;
}

export interface CalculatorOutput {
  weeklyValue: number;
  monthlyValueFull: number;
  grossRangeLow: number;
  grossRangeHigh: number;
  grossDisplayLow: number;
  grossDisplayHigh: number;
  grossFormattedRange: string;
  planMonthlyCost: number;
  netRangeLow: number;
  netRangeHigh: number;
  netDisplayLow: number;
  netDisplayHigh: number;
  netFormattedRange: string;
  paybackDaysLow: number | null; // faster payback (at 100% realisation)
  paybackDaysHigh: number | null; // slower payback (at 60% realisation)
  paybackFormatted: string;
}

/**
 * Pure calculator matching all Part 5.9 acceptance vectors:
 * - Team 5, 2 hrs/wk, 40/hr, plan 19/user/mo (plan cost 95):
 *   Weekly = 400
 *   Monthly (x 4.33) = 1732.00
 *   Range (60%..100%) = 1039.20 to 1732.00 -> displayed at 2 sig figs as 1,000 to 1,700
 *   Net of plan cost = 944.20 to 1637.00 -> displayed at 2 sig figs as 940 to 1,600
 *   Payback in working days = cost / (monthlyValue / 21.7) -> about 1.2 to 2.0 days
 *   Hours saved of 0 -> value 0, payback null ("Not applicable"), never a division error.
 */
export function computeCostAndValue(input: CalculatorInput): CalculatorOutput {
  const teamSize = Math.max(1, Math.min(500, Math.round(input.teamSize)));
  const hoursSaved = Math.max(0, Math.min(20, input.hoursSavedPerWeek));
  const rate = input.currency.rateFromBase;
  const locale = input.locale ?? 'en-US';

  const hourlyCost = input.HourlyCostAlreadyInCurrency
    ? Math.max(0, input.hourlyCostInBase)
    : Math.max(0, input.hourlyCostInBase * rate);

  const planPerUser = input.monthlyPlanPricePerUserInBase * rate;
  const planMonthlyCost =
    input.currency.decimals === 0
      ? Math.round(teamSize * planPerUser)
      : Number((teamSize * planPerUser).toFixed(2));

  const weeklyValue = Number((teamSize * hoursSaved * hourlyCost).toFixed(2));
  const monthlyValueFull = Number((weeklyValue * WEEKS_PER_MONTH).toFixed(2));

  const grossRangeLow = Number((monthlyValueFull * REALISATION_LOW).toFixed(2));
  const grossRangeHigh = Number((monthlyValueFull * REALISATION_HIGH).toFixed(2));

  const grossDisplayLow = roundToSignificantFigures(grossRangeLow, 2);
  const grossDisplayHigh = roundToSignificantFigures(grossRangeHigh, 2);

  const netRangeLow = Number((grossRangeLow - planMonthlyCost).toFixed(2));
  const netRangeHigh = Number((grossRangeHigh - planMonthlyCost).toFixed(2));

  const netDisplayLow = roundToSignificantFigures(netRangeLow, 2);
  const netDisplayHigh = roundToSignificantFigures(netRangeHigh, 2);

  const grossLowStr = formatSignificantRangeValue(grossRangeLow, input.currency, locale);
  const grossHighStr = formatSignificantRangeValue(grossRangeHigh, input.currency, locale);
  const netLowStr = formatSignificantRangeValue(netRangeLow, input.currency, locale);
  const netHighStr = formatSignificantRangeValue(netRangeHigh, input.currency, locale);

  let paybackDaysLow: number | null = null;
  let paybackDaysHigh: number | null = null;
  let paybackFormatted = 'Not applicable';

  if (hoursSaved > 0 && monthlyValueFull > 0 && grossRangeLow > 0) {
    if (planMonthlyCost === 0) {
      paybackDaysLow = 0;
      paybackDaysHigh = 0;
      paybackFormatted = '0 days (free plan)';
    } else {
      // Payback in working days = cost / (monthlyValue / 21.7)
      const daysAtHighValue = planMonthlyCost / (grossRangeHigh / WORKING_DAYS_PER_MONTH);
      const daysAtLowValue = planMonthlyCost / (grossRangeLow / WORKING_DAYS_PER_MONTH);
      paybackDaysLow = Number(daysAtHighValue.toFixed(1));
      paybackDaysHigh = Number(daysAtLowValue.toFixed(1));
      paybackFormatted = `${paybackDaysLow.toFixed(1)} to ${paybackDaysHigh.toFixed(1)}`;
    }
  }

  return {
    weeklyValue,
    monthlyValueFull,
    grossRangeLow,
    grossRangeHigh,
    grossDisplayLow,
    grossDisplayHigh,
    grossFormattedRange: `${grossLowStr} to ${grossHighStr}`,
    planMonthlyCost,
    netRangeLow,
    netRangeHigh,
    netDisplayLow,
    netDisplayHigh,
    netFormattedRange: `${netLowStr} to ${netHighStr}`,
    paybackDaysLow,
    paybackDaysHigh,
    paybackFormatted,
  };
}

