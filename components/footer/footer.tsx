// components/footer/footer.tsx — 4-column Notebook Footer with standing AI disclosure line, language/currency selectors, and wobbly wordmark underline (Part 4.13)
'use client';

import React from 'react';
import Link from 'next/link';
import type { SiteConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import { LOCALE_METADATA, SUPPORTED_LOCALES } from '@/lib/i18n';
import { useNotebook } from '../notebook-context';
import { AnnotationMark } from '../annotations/annotation-mark';
import { SampleTag } from '../annotations/sample-tag';
import { FieldnotesLogo } from '../header/fieldnotes-logo';

export interface FooterProps {
  site: SiteConfig;
  messages: Messages['footer'];
  sampleLabel: string;
}

export function Footer({ site, messages, sampleLabel }: FooterProps) {
  const { locale, currency, setCurrencyByCode, currencies } = useNotebook();

  return (
    <footer className="border-t border-[var(--color-border-warm)] bg-[var(--color-card)] py-14 sm:py-20">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--side-margin)] space-y-10">
        {/* Standing AI disclosure line (Honesty Rule 1.6 & Part 4.13) */}
        {site.standingAiDisclosure && (
          <div
            data-testid="standing-ai-disclosure"
            className="p-3.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--color-ink)]"
          >
            <span>✎ {site.standingAiDisclosure}</span>
            <span className="px-2 py-0.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink-muted)]">
              {messages.lastUpdatedPrefix} {site.lastUpdated}
            </span>
          </div>
        )}

        {/* Four columns: Product, Company, Legal & Trust, Status & Help */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
              {messages.colProduct}
            </h3>
            <ul className="space-y-2 text-[var(--color-ink)]">
              <li>
                <a href={`/${locale}/#demo`} className="hover:underline">
                  Live demo workspace
                </a>
              </li>
              <li>
                <a href={`/${locale}/#limits`} className="hover:underline">
                  Known limitations
                </a>
              </li>
              <li>
                <a href={`/${locale}/#pricing`} className="hover:underline">
                  Pricing & calculator
                </a>
              </li>
              <li>
                <Link
                  href={`/${locale}/changelog`}
                  className="hover:underline text-[var(--color-ink-blue)]"
                >
                  {messages.linkChangelog}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
              {messages.colCompany}
            </h3>
            <ul className="space-y-2 text-[var(--color-ink)]">
              <li>
                <span>{site.tagline}</span>
              </li>
              <li>
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="font-mono text-xs text-[var(--color-ink-blue)] underline"
                >
                  {site.contactEmail}
                </a>
              </li>
              <li>
                <SampleTag show={site.sampleFlag} label={sampleLabel} />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
              {messages.colLegal}
            </h3>
            <ul className="space-y-2 text-[var(--color-ink)]">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="hover:underline text-[var(--color-ink-blue)]"
                >
                  {messages.linkPrivacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy#subprocessors`}
                  className="hover:underline"
                >
                  Subprocessor list
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy#accessibility`}
                  className="hover:underline"
                >
                  {messages.linkAccessibility}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">
              {messages.colStatus}
            </h3>
            <ul className="space-y-2 text-[var(--color-ink)]">
              <li>
                <Link
                  href={`/${locale}/privacy#security-txt`}
                  className="hover:underline text-[var(--color-ink-blue)]"
                >
                  {messages.linkSecurityTxt}
                </Link>
              </li>
              <li>
                <a
                  href={site.requestDeletionUrl}
                  className="hover:underline font-mono text-xs"
                >
                  Request data deletion
                </a>
              </li>
              <li>
                <a
                  href={site.exportDataUrl}
                  className="hover:underline font-mono text-xs"
                >
                  Export workspace data
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row: Wordmark with hand-drawn wobbly underline + Language & Currency selectors */}
        <div className="pt-8 border-t border-[var(--color-border-warm)] flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-col gap-1">
            <FieldnotesLogo productName={site.productName} />
            <AnnotationMark
              kind="wobbly-line"
              seed={991}
              width={132}
              height={10}
              color="ink-blue"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Footer language selector"
              value={locale}
              onChange={(e) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/${e.target.value}/`;
                }
              }}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs text-[var(--color-ink)]"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_METADATA[loc].nativeLabel}
                </option>
              ))}
            </select>

            <select
              aria-label="Footer currency selector"
              value={currency.code}
              onChange={(e) => setCurrencyByCode(e.target.value)}
              className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs text-[var(--color-ink)]"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}

