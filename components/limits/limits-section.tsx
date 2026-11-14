// components/limits/limits-section.tsx — Honest Limits table with red-pencil bracket, wobbly row underline, status marks, and filters (Part 3.5 & 4.6)
'use client';

import React, { useState } from 'react';
import type { LimitsConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import { useNotebook } from '../notebook-context';
import { AnnotationMark } from '../annotations/annotation-mark';
import { SampleTag } from '../annotations/sample-tag';

export interface LimitsSectionProps {
  config: LimitsConfig;
  messages: Messages['limits'];
  sampleLabel: string;
  reportLimitationUrl: string;
}

export function LimitsSection({
  config,
  messages,
  sampleLabel,
  reportLimitationUrl,
}: LimitsSectionProps) {
  const { isRtl } = useNotebook();
  const [showPlanned, setShowPlanned] = useState<boolean>(true);
  const [showFixed, setShowFixed] = useState<boolean>(true);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(
    config.entries[0]?.id ?? null
  );
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [reportFormOpen, setReportFormOpen] = useState<boolean>(false);
  const [reportNote, setReportNote] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  const filteredEntries = config.entries.filter((entry) => {
    if (entry.status === 'Planned' && !showPlanned) return false;
    if (entry.status === 'Fixed' && !showFixed) return false;
    return true;
  });

  return (
    <section
      id="limits"
      aria-labelledby="limits-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Margin column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative inline-flex items-start gap-2">
            {/* Red-pencil bracket around the heading (Part 3.5) */}
            <AnnotationMark
              kind="bracket-left"
              seed={501}
              width={16}
              height={54}
              color="red-pencil"
              flipRtl={isRtl}
            />
            <div>
              <h2
                id="limits-heading"
                className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
              >
                <span>{messages.headlineBefore}</span>
                <em className="italic font-normal text-[var(--color-red-pencil)]">
                  {messages.headlineItalic}
                </em>
                <span>{messages.headlineAfter}</span>
              </h2>
              <p className="mt-2 font-sans text-sm text-[var(--color-ink-muted)]">
                {messages.subline}
              </p>
            </div>
          </div>

          <p className="font-mono text-xs text-[var(--color-ink-muted)] leading-relaxed">
            {messages.marginIntro.replace('{date}', config.lastReviewedDate)}{' '}
            <SampleTag show={config.sample} label={sampleLabel} />
          </p>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                setReportFormOpen((v) => !v);
                setReportSubmitted(false);
              }}
              aria-expanded={reportFormOpen}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--color-ink-blue)] underline hover:opacity-80 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              <span>{messages.reportLink}</span>
              <span aria-hidden="true">→</span>
            </button>

            {reportFormOpen && (
              <div className="p-3 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] space-y-2 font-mono text-xs">
                {reportSubmitted ? (
                  <p className="text-[var(--color-green-pen)]">
                    ✓ Logged to sample engineering triage queue.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!reportNote.trim()) return;
                      setReportSubmitted(true);
                      setReportNote('');
                    }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="limit-report-input"
                      className="block text-[11px] text-[var(--color-ink)]"
                    >
                      Describe the edge case you spotted:
                    </label>
                    <textarea
                      id="limit-report-input"
                      rows={2}
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      placeholder="e.g. Rotated PDF table header..."
                      className="w-full p-2 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-sans text-xs text-[var(--color-ink)]"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] text-xs cursor-pointer"
                    >
                      Submit note
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Full-width table card in 9-column content area */}
        <div className="lg:col-span-9 p-4 sm:p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)]">
          {/* Filter controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--color-border-warm)]">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPlanned}
                  onChange={(e) => setShowPlanned(e.target.checked)}
                  className="accent-[var(--color-ink-blue)] w-4 h-4"
                />
                <span>{messages.showPlanned}</span>
              </label>

              <label className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFixed}
                  onChange={(e) => setShowFixed(e.target.checked)}
                  className="accent-[var(--color-ink-blue)] w-4 h-4"
                />
                <span>{messages.showFixed}</span>
              </label>
            </div>

            <SampleTag show={config.sample} label={sampleLabel} />
          </div>

          {/* Accessible table of limitations */}
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-warm)] font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)]">
                  <th scope="col" className="py-2.5 pe-4 text-start">
                    {messages.colLimitation}
                  </th>
                  <th scope="col" className="py-2.5 px-4 text-start">
                    {messages.colCheckWhen}
                  </th>
                  <th scope="col" className="py-2.5 px-4 text-start">
                    {messages.colStatus}
                  </th>
                  <th scope="col" className="py-2.5 ps-4 text-start">
                    {messages.colReviewed}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-warm)] text-sm">
                {filteredEntries.map((row, idx) => {
                  const isExpanded = expandedRowId === row.id;
                  const isHovered = hoveredRowId === row.id;

                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        tabIndex={0}
                        role="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedRowId(isExpanded ? null : row.id)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setExpandedRowId(isExpanded ? null : row.id);
                          }
                        }}
                        onMouseEnter={() => setHoveredRowId(row.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        onFocus={() => setHoveredRowId(row.id)}
                        onBlur={() => setHoveredRowId(null)}
                        className="group cursor-pointer hover:bg-[var(--color-page)]/60 focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
                      >
                        <td className="py-3.5 pe-4 align-top font-medium text-[var(--color-ink)]">
                          <div>{row.limitation}</div>
                          {/* Wobbly underline under first column on hover/focus (Part 3.5) */}
                          <div className="h-2 mt-0.5">
                            {isHovered && (
                              <AnnotationMark
                                kind="wobbly-line"
                                seed={520 + idx}
                                width={160}
                                height={8}
                                color="red-pencil"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top text-[var(--color-ink-muted)]">
                          {row.checkWhen}
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border font-mono text-xs ${
                              row.status === 'Limitation'
                                ? 'border-[var(--color-red-pencil)] bg-[var(--color-red-pencil-soft)] text-[var(--color-red-pencil)]'
                                : row.status === 'Planned'
                                ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)]'
                                : 'border-[var(--color-green-pen)] bg-[var(--color-green-pen-soft)] text-[var(--color-green-pen)]'
                            }`}
                          >
                            {row.status === 'Limitation' && (
                              <AnnotationMark
                                kind="cross"
                                seed={540 + idx}
                                width={11}
                                height={11}
                                color="red-pencil"
                                animate={false}
                              />
                            )}
                            {row.status === 'Planned' && (
                              <AnnotationMark
                                kind="asterisk"
                                seed={540 + idx}
                                width={11}
                                height={11}
                                color="ink-blue"
                                animate={false}
                              />
                            )}
                            {row.status === 'Fixed' && (
                              <AnnotationMark
                                kind="tick"
                                seed={540 + idx}
                                width={11}
                                height={11}
                                color="green-pen"
                                animate={false}
                              />
                            )}
                            <span>
                              {row.status === 'Limitation'
                                ? 'Check · Limitation'
                                : row.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 ps-4 align-top whitespace-nowrap font-mono text-xs text-[var(--color-ink-muted)]">
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-border-warm)]">
                            {row.lastReviewed}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[var(--color-page)]/80">
                          <td colSpan={4} className="px-4 py-3 text-xs sm:text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-semibold text-[var(--color-ink-blue)] me-2">
                                  {messages.workaroundLabel}
                                </span>
                                <span className="text-[var(--color-ink)]">
                                  {row.workaround}
                                </span>
                              </div>
                              <SampleTag show={row.sample} label={sampleLabel} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

