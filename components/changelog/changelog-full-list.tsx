// components/changelog/changelog-full-list.tsx — Client filterable list for the full Changelog page with New, Improved, and Fixed filter chips (Part 4.14)
'use client';

import React, { useState } from 'react';
import type { ChangelogConfig } from '@/lib/config-schema';
import { SampleTag } from '../annotations/sample-tag';

export function ChangelogFullList({
  config,
  sampleLabel,
  filterAllLabel,
}: {
  config: ChangelogConfig;
  sampleLabel: string;
  filterAllLabel: string;
}) {
  const [activeFilter, setActiveFilter] = useState<
    'All' | 'New' | 'Improved' | 'Fixed'
  >('All');

  const entries =
    activeFilter === 'All'
      ? config.entries
      : config.entries.filter((e) => e.tag === activeFilter);

  return (
    <div className="space-y-8">
      <div
        role="group"
        aria-label="Filter changelog entries"
        className="flex flex-wrap items-center gap-2"
      >
        {(['All', 'New', 'Improved', 'Fixed'] as const).map((tag) => {
          const isSelected = activeFilter === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveFilter(tag)}
              aria-pressed={isSelected}
              className={`px-3 py-1 rounded-[2px] border font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                isSelected
                  ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue)] text-[var(--color-card)]'
                  : 'border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink)]'
              }`}
            >
              {tag === 'All' ? filterAllLabel : tag}
            </button>
          );
        })}
      </div>

      <div className="relative ps-4 sm:ps-8 border-s-2 border-dashed border-[var(--color-ink-blue)]/40 space-y-6">
        {entries.map((entry, idx) => (
          <article
            key={entry.id}
            id={entry.id}
            className="relative p-5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`#${entry.id}`}
                  className="font-mono text-xs tabular-nums text-[var(--color-ink-blue)] underline"
                >
                  {entry.date}
                </a>
                <span
                  style={{
                    transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
                  }}
                  className="inline-block px-2 py-0.5 rounded-[2px] border-2 border-double border-[var(--color-ink)] font-mono text-xs font-bold uppercase text-[var(--color-ink)]"
                >
                  {entry.version}
                </span>
                <span className="px-2 py-0.5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-[11px] uppercase">
                  {entry.tag}
                </span>
              </div>
              <SampleTag show={entry.sample} label={sampleLabel} />
            </div>

            <h2 className="font-serif font-semibold text-lg text-[var(--color-ink)]">
              {entry.title}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {entry.summary}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

