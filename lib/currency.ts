// lib/currency.ts — Currency conversion, two-significant-figure rounding, and Intl.NumberFormat helpers
import type { CurrencyEntrySchema } from './config-schema';
import type { z } from 'zod';

export type CurrencyEntry = z.infer<typeof CurrencyEntrySchema>;

/**
 * Rounds a number to `sigFigs` significant figures (default 2).
 * Example: 1039.20 -> 1000, 1732.00 -> 1700, 944.20 -> 940, 166272 -> 170000.
 */
export function roundToSignificantFigures(num: number, sigFigs = 2): number {
  if (num === 0 || !Number.isFinite(num)) return 0;
  const sign = num < 0 ? -1 : 1;
  const abs = Math.abs(num);
  const d = Math.ceil(Math.log10(abs));
  const power = sigFigs - d;
  const magnitude = Math.pow(10, power);
  const shifted = Math.round(abs * magnitude);
  return sign * (shifted / magnitude);
}

/**
 * Formats a numeric value using Intl.NumberFormat with exact decimal handling
 * (0 decimals for JPY, 2 or 0 for standard currencies depending on mode).
 */
export function formatCurrencyAmount(
  amount: number,
  currency: CurrencyEntry,
  options?: {
    locale?: string;
    forceWholeUnits?: boolean;
  }
): string {
  const locale = options?.locale ?? 'en-US';
  const isZeroDecimal = currency.decimals === 0;
  const useDecimals = isZeroDecimal ? 0 : options?.forceWholeUnits ? 0 : currency.decimals;
  const roundedAmount = isZeroDecimal ? Math.round(amount) : amount;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: useDecimals,
      maximumFractionDigits: useDecimals,
    }).format(roundedAmount);
  } catch {
    const fixed = roundedAmount.toFixed(useDecimals);
    return `${currency.symbol}${fixed}`;
  }
}

/**
 * Formats a number rounded to 2 significant figures with locale grouping and no decimals
 * (used for display ranges like "1,000 to 1,700" or "170,000 to 280,000").
 */
export function formatSignificantRangeValue(
  rawAmount: number,
  currency: CurrencyEntry,
  locale = 'en-US'
): string {
  const sig = roundToSignificantFigures(rawAmount, 2);
  const rounded = currency.decimals === 0 ? Math.round(sig) : Math.round(sig);
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(rounded);
}

