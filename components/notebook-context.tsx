// components/notebook-context.tsx — Global context for theme (Paper / Night), motion intensity (Full / Calm / Off), currency, and spotlight grid
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SupportedLocale } from '@/lib/config-schema';
import { currenciesConfig, siteConfig } from '@/lib/config-loader';
import type { CurrencyEntry } from '@/lib/currency';

export type NotebookTheme = 'paper' | 'night';
export type MotionIntensity = 'full' | 'calm' | 'off';

interface NotebookContextValue {
  locale: SupportedLocale;
  isRtl: boolean;
  theme: NotebookTheme;
  setTheme: (t: NotebookTheme) => void;
  motion: MotionIntensity;
  setMotion: (m: MotionIntensity) => void;
  currency: CurrencyEntry;
  setCurrencyByCode: (code: string) => void;
  currencies: CurrencyEntry[];
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  billingPeriod: 'monthly' | 'yearly';
  setBillingPeriod: (p: 'monthly' | 'yearly') => void;
}

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function NotebookProvider({
  locale,
  initialMotion,
  children,
}: {
  locale: SupportedLocale;
  initialMotion?: MotionIntensity;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<NotebookTheme>(siteConfig.defaultTheme);
  const [motion, setMotionState] = useState<MotionIntensity>(
    initialMotion ?? siteConfig.defaultMotion
  );
  const [hasExplicitMotionChoice, setHasExplicitMotionChoice] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<string>(currenciesConfig.baseCurrency);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('team');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    try {
      const savedTheme = sessionStorage.getItem('fieldnotes_theme') as NotebookTheme | null;
      if (savedTheme === 'paper' || savedTheme === 'night') {
        setThemeState(savedTheme);
      }
      const savedMotion = sessionStorage.getItem('fieldnotes_motion') as MotionIntensity | null;
      if (savedMotion === 'full' || savedMotion === 'calm' || savedMotion === 'off') {
        setMotionState(savedMotion);
        setHasExplicitMotionChoice(true);
      } else if (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        setMotionState('off');
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-motion', motion);
      if (hasExplicitMotionChoice) {
        document.documentElement.setAttribute('data-motion-override', 'true');
      }
    }
  }, [theme, motion, hasExplicitMotionChoice]);

  // Spotlight grid desktop pointer tracking (disabled on touch, Calm, and Off)
  useEffect(() => {
    if (motion !== 'full' || typeof window === 'undefined') return;
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [motion]);

  const setTheme = (t: NotebookTheme) => {
    setThemeState(t);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.style.colorScheme = t === 'night' ? 'dark' : 'light';
    }
    try {
      sessionStorage.setItem('fieldnotes_theme', t);
    } catch {
      // Ignore
    }
  };

  const setMotion = (m: MotionIntensity) => {
    setMotionState(m);
    setHasExplicitMotionChoice(true);
    try {
      sessionStorage.setItem('fieldnotes_motion', m);
    } catch {
      // Ignore
    }
  };

  const setCurrencyByCode = (code: string) => {
    setCurrencyCode(code);
  };

  const currency =
    currenciesConfig.currencies.find((c) => c.code === currencyCode) ??
    currenciesConfig.currencies[0];

  return (
    <NotebookContext.Provider
      value={{
        locale,
        isRtl: locale === 'ar',
        theme,
        setTheme,
        motion,
        setMotion,
        currency,
        setCurrencyByCode,
        currencies: currenciesConfig.currencies,
        selectedPlanId,
        setSelectedPlanId,
        billingPeriod,
        setBillingPeriod,
      }}
    >
      <div
        data-theme={theme}
        data-motion={motion}
        className="min-h-screen flex flex-col bg-[var(--color-page)] text-[var(--color-ink)] transition-colors duration-200 relative"
      >
        {/* 24px engineering graph-paper grid scoped to the active theme container */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-grid-major) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-grid-major) 1px, transparent 1px),
              linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)
            `,
            backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </div>
    </NotebookContext.Provider>
  );
}

export function useNotebook(): NotebookContextValue {
  const ctx = useContext(NotebookContext);
  if (!ctx) {
    return {
      locale: 'en',
      isRtl: false,
      theme: 'paper',
      setTheme: () => { },
      motion: 'full',
      setMotion: () => { },
      currency: currenciesConfig.currencies[0],
      setCurrencyByCode: () => { },
      currencies: currenciesConfig.currencies,
      selectedPlanId: 'team',
      setSelectedPlanId: () => { },
      billingPeriod: 'monthly',
      setBillingPeriod: () => { },
    };
  }
  return ctx;
}

