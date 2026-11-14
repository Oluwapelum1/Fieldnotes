// components/header/header.tsx — 64px Notebook Header with scroll bookmark along the 72px vertical margin rule, language/theme/motion controls, and mobile sheet (Part 4.2)
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Messages } from '@/lib/config-loader';
import { LOCALE_METADATA, SUPPORTED_LOCALES } from '@/lib/i18n';
import { useNotebook, type MotionIntensity } from '../notebook-context';
import { FieldnotesLogo } from './fieldnotes-logo';

export interface HeaderProps {
  productName: string;
  messages: Messages['header'];
  skipToContentLabel: string;
}

export function Header({
  productName,
  messages,
  skipToContentLabel,
}: HeaderProps) {
  const { locale, isRtl, theme, setTheme, motion, setMotion } = useNotebook();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollFraction, setScrollFraction] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 40);
      const docH =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      setScrollFraction(Math.max(0, Math.min(1, y / docH)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${newLocale}/`;
    }
  };

  return (
    <>
      {/* Accessible Skip Link */}
      <a
        href="#demo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-[2px] focus:bg-[var(--color-ink-blue)] focus:text-[var(--color-card)] focus:font-mono focus:text-xs"
      >
        {skipToContentLabel}
      </a>

      {/* Desktop vertical margin rule (72 px from start edge) + scroll bookmark fill (Part 2.3 & 4.2) */}
      <div
        aria-hidden="true"
        className={`hidden lg:block fixed top-0 bottom-0 w-[1px] bg-[var(--color-ink-blue)]/25 pointer-events-none z-20 ${
          isRtl ? 'right-[72px]' : 'left-[72px]'
        }`}
      >
        <div
          style={{ height: `${Math.round(scrollFraction * 100)}%` }}
          className="w-[2px] bg-[var(--color-ink-blue)] transition-all duration-75"
        />
      </div>

      {/* Mobile top 2px progress line (Part 4.2) */}
      <div
        aria-hidden="true"
        className="lg:hidden fixed top-0 left-0 right-0 h-[2px] bg-transparent z-50 pointer-events-none"
      >
        <div
          style={{ width: `${Math.round(scrollFraction * 100)}%` }}
          className="h-full bg-[var(--color-ink-blue)]"
        />
      </div>

      <header
        className={`sticky top-0 z-40 h-16 transition-colors duration-200 ${
          scrolled
            ? 'bg-[var(--color-page)]/95 backdrop-blur-xs border-b border-[var(--color-border-warm)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[var(--container-max)] mx-auto h-full px-[var(--side-margin)] flex items-center justify-between gap-4">
          {/* Brand Logo + Wordmark */}
          <Link
            href={`/${locale}/`}
            className="focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] rounded-[2px]"
          >
            <FieldnotesLogo productName={productName} />
          </Link>

          {/* Centre navigation links */}
          <nav
            aria-label="Primary notebook sections"
            className="hidden md:flex items-center gap-6 font-sans text-sm text-[var(--color-ink-muted)]"
          >
            <a
              href="#demo"
              className="hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.navDemo}
            </a>
            <a
              href="#limits"
              className="hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.navLimits}
            </a>
            <a
              href="#data"
              className="hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.navData}
            </a>
            <a
              href="#pricing"
              className="hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.navPricing}
            </a>
            <a
              href="#changelog"
              className="hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.navChangelog}
            </a>
          </nav>

          {/* Right controls: Language, Motion, Theme (Paper / Night), Start free */}
          <div className="hidden md:flex items-center gap-2.5">
            <select
              aria-label={messages.languageLabel}
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
              className="px-2 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_METADATA[loc].nativeLabel}
                </option>
              ))}
            </select>

            <select
              aria-label={messages.motionLabel}
              value={motion}
              onChange={(e) => setMotion(e.target.value as MotionIntensity)}
              className="px-2 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              <option value="full">
                {messages.motionLabel}: {messages.motionFull}
              </option>
              <option value="calm">
                {messages.motionLabel}: {messages.motionCalm}
              </option>
              <option value="off">
                {messages.motionLabel}: {messages.motionOff}
              </option>
            </select>

            <button
              type="button"
              onClick={() => setTheme(theme === 'paper' ? 'night' : 'paper')}
              aria-label={
                theme === 'paper' ? messages.themeNight : messages.themePaper
              }
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink)] hover:border-[var(--color-ink-blue)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {theme === 'paper' ? `☾ ${messages.themeNight}` : `☀ ${messages.themePaper}`}
            </button>

            <a
              href="#start-free-cta"
              className="px-3.5 py-1.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-sans text-xs font-medium hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.startFree}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            className="md:hidden px-2.5 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink)]"
          >
            {mobileMenuOpen ? messages.closeMenu : messages.openMenu}
          </button>
        </div>

        {/* Mobile full-screen sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-50 bg-[var(--color-page)] p-6 flex flex-col justify-between border-t border-[var(--color-border-warm)]">
            <nav className="flex flex-col gap-4 font-serif text-2xl text-[var(--color-ink)]">
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>
                {messages.navDemo}
              </a>
              <a href="#limits" onClick={() => setMobileMenuOpen(false)}>
                {messages.navLimits}
              </a>
              <a href="#data" onClick={() => setMobileMenuOpen(false)}>
                {messages.navData}
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                {messages.navPricing}
              </a>
              <a href="#changelog" onClick={() => setMobileMenuOpen(false)}>
                {messages.navChangelog}
              </a>
            </nav>

            <div className="space-y-4 pt-6 border-t border-[var(--color-border-warm)]">
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label={messages.languageLabel}
                  value={locale}
                  onChange={(e) => handleLocaleChange(e.target.value)}
                  className="px-3 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs"
                >
                  {SUPPORTED_LOCALES.map((loc) => (
                    <option key={loc} value={loc}>
                      {LOCALE_METADATA[loc].nativeLabel}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setTheme(theme === 'paper' ? 'night' : 'paper')}
                  className="px-3 py-1.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-xs"
                >
                  {theme === 'paper' ? messages.themeNight : messages.themePaper}
                </button>
              </div>

              <a
                href="#start-free-cta"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-sans text-sm font-medium"
              >
                {messages.startFree}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

