// components/changelog/changelog-section.tsx — Shipped This Month vertical timeline with rubber-stamp version badges (Part 4.10)
'use client';

import React from 'react';
import Link from 'next/link';
import type { ChangelogConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import { useNotebook } from '../notebook-context';
import { SampleTag } from '../annotations/sample-tag';

export interface ChangelogSectionProps {
  config: ChangelogConfig;
  messages: Messages['changelog'];
  sampleLabel: string;
}

export function ChangelogSection({
  config,
  messages,
  sampleLabel,
}: ChangelogSectionProps) {
  const { locale } = useNotebook();
  // Show six sample entries on the main landing page (Part 4.10)
  const sixEntries = config.entries.slice(0, 6);

  return (
    <section
      id="changelog"
      aria-labelledby="changelog-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Margin column */}
        <div className="lg:col-span-3 space-y-4">
          <h2
            id="changelog-heading"
            className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
          >
            <span>{messages.headlineBefore}</span>
            <em className="italic font-normal text-[var(--color-ink-blue)]">
              {messages.headlineItalic}
            </em>
            <span>{messages.headlineAfter}</span>
          </h2>

          <p className="font-sans text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {messages.marginNote}
          </p>

          <div>
            <SampleTag show={config.sample} label={sampleLabel} />
          </div>

          <div className="pt-2">
            <Link
              href={`/${locale}/changelog`}
              className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-ink-blue)] underline hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.fullChangelogLink}
            </Link>
          </div>
        </div>

        {/* 9-column vertical timeline with mono dates in left margin and stamped cards on right */}
        <div className="lg:col-span-9 relative ps-4 sm:ps-8 border-s-2 border-dashed border-[var(--color-ink-blue)]/40 space-y-6">
          {sixEntries.map((entry, idx) => {
            const tagColor =
              entry.tag === 'New'
                ? 'border-[var(--color-ink-blue)] text-[var(--color-ink-blue)] bg-[var(--color-ink-blue-soft)]'
                : entry.tag === 'Improved'
                ? 'border-[var(--color-green-pen)] text-[var(--color-green-pen)] bg-[var(--color-green-pen-soft)]'
                : 'border-[var(--color-red-pencil)] text-[var(--color-red-pencil)] bg-[var(--color-red-pencil-soft)]';

            return (
              <article
                key={entry.id}
                id={entry.id}
                className="relative p-4 sm:p-5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-2xs"
              >
                {/* Timeline node dot on the vertical spine */}
                <span
                  aria-hidden="true"
                  className="absolute -start-[23px] sm:-start-[39px] top-6 w-3 h-3 rounded-full bg-[var(--color-card)] border-2 border-[var(--color-ink-blue)]"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <time
                      dateTime={entry.date}
                      className="font-mono text-xs tabular-nums text-[var(--color-ink-muted)]"
                    >
                      {entry.date}
                    </time>

                    {/* Rubber-stamp version badge */}
                    <span
                      style={{
                        transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
                      }}
                      className="inline-block px-2 py-0.5 rounded-[2px] border-2 border-double border-[var(--color-ink)] font-mono text-xs font-bold tracking-wider uppercase text-[var(--color-ink)]"
                    >
                      {entry.version}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-[2px] border font-mono text-[11px] uppercase ${tagColor}`}
                    >
                      {entry.tag}
                    </span>
                  </div>

                  <SampleTag show={entry.sample} label={sampleLabel} />
                </div>

                <h3 className="font-serif font-semibold text-base text-[var(--color-ink)]">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {entry.summary}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

