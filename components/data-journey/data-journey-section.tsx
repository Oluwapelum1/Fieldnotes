// components/data-journey/data-journey-section.tsx — 5-node SVG Data Journey pipeline with region selector, side inspector, interactive export/deletion preview drawer, "Fill me in" tags, and subprocessors (Part 3.6 & 4.7)
'use client';

import React, { useState } from 'react';
import type { DataJourneyConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import { useNotebook } from '../notebook-context';
import { SampleTag } from '../annotations/sample-tag';

export interface DataJourneySectionProps {
  config: DataJourneyConfig;
  messages: Messages['dataJourney'];
  sampleLabel: string;
  requestDeletionUrl: string;
  exportDataUrl: string;
}

export function DataJourneySection({
  config,
  messages,
  sampleLabel,
}: DataJourneySectionProps) {
  const { motion, isRtl } = useNotebook();
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    config.regions[0]?.id ?? 'eu-frankfurt'
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    config.nodes[0]?.id ?? 'your-data'
  );
  const [dotPaused, setDotPaused] = useState<boolean>(false);
  const [activeActionDrawer, setActiveActionDrawer] = useState<
    'none' | 'delete' | 'export'
  >('none');

  const activeRegion =
    config.regions.find((r) => r.id === selectedRegionId) ?? config.regions[0];
  const activeNode =
    config.nodes.find((n) => n.id === selectedNodeId) ?? config.nodes[0];

  const formatNodeStatement = (template: string): string => {
    return template
      .replace(/\{location\}/g, activeRegion.location)
      .replace(/\{retentionDays\}/g, String(activeRegion.retentionDays));
  };

  const animateDot = motion === 'full' && !dotPaused;

  return (
    <section
      id="data"
      aria-labelledby="data-journey-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Margin column */}
        <div className="lg:col-span-3 space-y-4">
          <h2
            id="data-journey-heading"
            className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
          >
            <span>{messages.headlineBefore}</span>
            <em className="italic font-normal text-[var(--color-ink-blue)]">
              {messages.headlineItalic}
            </em>
            <span>{messages.headlineAfter}</span>
          </h2>

          <p className="font-sans text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {messages.subline}
          </p>

          {/* Candid founder warning note in margin (Part 4.7) */}
          <div className="p-3 rounded-[2px] border-s-2 border-[var(--color-red-pencil)] bg-[var(--color-red-pencil-soft)] font-mono text-xs text-[var(--color-ink)] leading-relaxed">
            <p>“{messages.marginWarning}”</p>
            <div className="mt-1.5">
              <SampleTag show={config.sample} label={sampleLabel} />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() =>
                setActiveActionDrawer(
                  activeActionDrawer === 'delete' ? 'none' : 'delete'
                )
              }
              aria-expanded={activeActionDrawer === 'delete'}
              className="text-start font-mono text-xs text-[var(--color-ink-blue)] underline hover:opacity-80 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.requestDeletion} →
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveActionDrawer(
                  activeActionDrawer === 'export' ? 'none' : 'export'
                )
              }
              aria-expanded={activeActionDrawer === 'export'}
              className="text-start font-mono text-xs text-[var(--color-ink-blue)] underline hover:opacity-80 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {messages.exportMyData} →
            </button>
          </div>

          {activeActionDrawer !== 'none' && (
            <div className="p-3.5 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-[var(--color-ink-blue)] uppercase">
                  {activeActionDrawer === 'delete'
                    ? '2-Click Deletion Preview'
                    : 'Workspace Export Preview'}
                </strong>
                <button
                  type="button"
                  onClick={() => setActiveActionDrawer('none')}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {activeActionDrawer === 'delete' ? (
                <p className="text-[11px] text-[var(--color-ink)] leading-relaxed">
                  ✓ Sample purge receipt <code>#DEL-2026-094</code> queued for{' '}
                  <strong>{activeRegion.label}</strong>. Primary rows clear
                  immediately; encrypted backups roll off in 7 days.
                </p>
              ) : (
                <p className="text-[11px] text-[var(--color-ink)] leading-relaxed">
                  ✓ Sample archive <code>fieldnotes-export-{activeRegion.id}.json</code>{' '}
                  (14.2 KB) ready with all runs, source chips, and step logs.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 9-column diagram + inspector + subprocessors */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top toolbar: Region selector & Pause flow button */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)]">
            {config.regions.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="data-region-select"
                  className="font-mono text-xs text-[var(--color-ink-muted)]"
                >
                  {messages.regionLabel}
                </label>
                <select
                  id="data-region-select"
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs text-[var(--color-ink)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
                >
                  {config.regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.label} — {reg.retentionDays}d
                    </option>
                  ))}
                </select>
              </div>
            )}

            {motion === 'full' && (
              <button
                type="button"
                onClick={() => setDotPaused((p) => !p)}
                className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-page)] font-mono text-xs text-[var(--color-ink)] hover:border-[var(--color-ink-blue)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
              >
                {dotPaused ? messages.resumeFlow : messages.pauseFlow}
              </button>
            )}
          </div>

          {/* 5-node SVG schematic + interactive node buttons */}
          <div className="p-4 sm:p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)]">
            {/* SVG Pipeline Line & Travelling Ink-Blue Packet Dot */}
            <div className="hidden md:block mb-4">
              <svg
                viewBox="0 0 800 44"
                className="w-full h-11 overflow-visible"
                aria-hidden="true"
              >
                <path
                  id="fn-data-journey-path"
                  d={isRtl ? 'M 730 22 L 70 22' : 'M 70 22 L 730 22'}
                  stroke="var(--color-border-warm)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  fill="none"
                />
                {[70, 235, 400, 565, 730].map((cx, idx) => {
                  const nodeForDot = config.nodes[idx];
                  const isDotSelected = selectedNodeId === nodeForDot?.id;
                  return (
                    <circle
                      key={cx}
                      cx={cx}
                      cy={22}
                      r={isDotSelected ? 9 : 6}
                      onClick={() => {
                        if (nodeForDot) setSelectedNodeId(nodeForDot.id);
                      }}
                      className="cursor-pointer transition-all"
                      fill={
                        isDotSelected
                          ? 'var(--color-ink-blue)'
                          : 'var(--color-card)'
                      }
                      stroke="var(--color-ink-blue)"
                      strokeWidth="2"
                    />
                  );
                })}
                {animateDot && (
                  <circle r="5" fill="var(--color-ink-blue)">
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      path={isRtl ? 'M 730 22 L 70 22' : 'M 70 22 L 730 22'}
                    />
                  </circle>
                )}
              </svg>
            </div>

            {/* 5 Node Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {config.nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    aria-pressed={isSelected}
                    className={`text-start p-3 rounded-[2px] border cursor-pointer transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                      isSelected
                        ? 'border-2 border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)] -translate-y-0.5 shadow-2xs'
                        : 'border-[var(--color-border-warm)] bg-[var(--color-page)]/60 hover:bg-[var(--color-page)] hover:border-[var(--color-ink-blue)]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-serif font-semibold text-sm text-[var(--color-ink)]">
                          {node.title}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[var(--color-ink)] leading-relaxed">
                        {formatNodeStatement(node.statementTemplate)}
                      </p>
                    </div>

                    {/* Red-pencil "Fill me in" placeholder tag when node.placeholder is true (Part 3.6) */}
                    {node.placeholder && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-[var(--color-red-pencil)]/40 flex items-center justify-between gap-1">
                        <span
                          data-testid={`placeholder-tag-${node.id}`}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-[var(--color-red-pencil-soft)] border border-[var(--color-red-pencil)] font-mono text-[10px] uppercase text-[var(--color-red-pencil)] font-semibold"
                        >
                          ✎ {messages.fillMeInTag}
                        </span>
                        <SampleTag show={node.sample} label={sampleLabel} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Side / Lower Details Inspector Panel for the active node */}
            {activeNode && (
              <div
                aria-live="polite"
                className="mt-5 p-4 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-page)] grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
              >
                <div className="md:col-span-8 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-blue)] font-semibold">
                      {messages.inspectorHeading}: {activeNode.title}
                    </span>
                    {activeNode.placeholder && (
                      <span className="font-mono text-[11px] text-[var(--color-red-pencil)]">
                        [{messages.fillMeInTag}]
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-ink)] leading-relaxed">
                    {formatNodeStatement(activeNode.statementTemplate)}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    {activeNode.detail}
                  </p>
                </div>

                <div className="md:col-span-4 border-t md:border-t-0 md:border-s border-[var(--color-border-warm)] pt-3 md:pt-0 md:ps-4 font-mono text-xs space-y-1">
                  <div className="text-[11px] uppercase text-[var(--color-ink-muted)]">
                    Active parameters
                  </div>
                  <div>
                    Region:{' '}
                    <strong className="text-[var(--color-ink)]">
                      {activeRegion.label}
                    </strong>
                  </div>
                  <div>
                    Retention:{' '}
                    <strong className="text-[var(--color-ink)]">
                      {activeRegion.retentionDays} days
                    </strong>
                  </div>
                  {activeNode.subprocessors.length > 0 && (
                    <div>
                      Subprocessors: {activeNode.subprocessors.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subprocessors Table */}
          <div className="p-4 sm:p-5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                {messages.subprocessorsHeading}
              </h3>
              <SampleTag show={config.sample} label={sampleLabel} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-warm)] font-mono text-[11px] uppercase text-[var(--color-ink-muted)]">
                    <th scope="col" className="py-2 pe-4 text-start">
                      {messages.colSubprocessor}
                    </th>
                    <th scope="col" className="py-2 px-4 text-start">
                      {messages.colPurpose}
                    </th>
                    <th scope="col" className="py-2 ps-4 text-start">
                      {messages.colRegion}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-warm)]">
                  {config.subprocessors.map((sub) => (
                    <tr key={sub.name}>
                      <td className="py-2.5 pe-4 font-medium text-[var(--color-ink)]">
                        {sub.name}{' '}
                        <SampleTag show={sub.sample} label={sampleLabel} />
                      </td>
                      <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">
                        {sub.purpose}
                      </td>
                      <td className="py-2.5 ps-4 font-mono text-xs text-[var(--color-ink-muted)]">
                        {sub.region}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
