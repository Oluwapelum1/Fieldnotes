// components/constellation/constellation-section.tsx — Interactive Elliptical Integration Constellation with animated spoke packets, clickable SVG nodes, and permissions ledger (Part 4.5)
'use client';

import React, { useState } from 'react';
import type { IntegrationsConfig } from '@/lib/config-schema';
import type { Messages } from '@/lib/config-loader';
import { wobblyLine } from '@/lib/annotations/paths';
import { useNotebook } from '../notebook-context';
import { SampleTag } from '../annotations/sample-tag';

export interface ConstellationSectionProps {
  config: IntegrationsConfig;
  messages: Messages['constellation'];
  sampleLabel: string;
}

function GeometricGlyph({ glyph }: { glyph: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-[var(--color-ink-blue)]"
    >
      {glyph.startsWith('envelope') ||
      glyph.startsWith('tray') ||
      glyph.startsWith('stamp') ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M3 7l9 6 9-6" />
        </>
      ) : glyph.startsWith('sheet') ||
        glyph.startsWith('binder') ||
        glyph.startsWith('ledger') ? (
        <>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      ) : glyph.startsWith('signal') ||
        glyph.startsWith('thread') ||
        glyph.startsWith('relay') ? (
        <>
          <circle cx="8" cy="10" r="3" />
          <circle cx="16" cy="14" r="3" />
          <path d="M10.5 11.5l3 1" />
        </>
      ) : glyph.startsWith('funnel') ||
        glyph.startsWith('contact') ||
        glyph.startsWith('deal') ? (
        <>
          <polygon points="4 5 20 5 14 13 14 19 10 19 10 13 4 5" />
        </>
      ) : (
        <>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </>
      )}
    </svg>
  );
}

export function ConstellationSection({
  config,
  messages,
  sampleLabel,
}: ConstellationSectionProps) {
  const { motion } = useNotebook();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    config.items[0]?.id ?? 'int-postbox'
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [flowPaused, setFlowPaused] = useState<boolean>(false);
  const [syncTestStatus, setSyncTestStatus] = useState<
    'idle' | 'testing' | 'verified'
  >('idle');
  const [tableExpandedDesktop, setTableExpandedDesktop] = useState<boolean>(true);

  const filteredItems = activeCategory
    ? config.items.filter((i) => i.category === activeCategory)
    : config.items;

  const selectedItem =
    config.items.find((i) => i.id === selectedNodeId) ?? config.items[0];

  const handleSelectNode = (id: string) => {
    setSelectedNodeId(id);
    setSyncTestStatus('idle');
  };

  const handleTestHandshake = () => {
    setSyncTestStatus('testing');
    setTimeout(() => {
      setSyncTestStatus('verified');
    }, 380);
  };

  // Collision-free elliptical coordinates on an 880x440 SVG canvas
  const centerX = 440;
  const centerY = 220;
  const animatePackets = motion === 'full' && !flowPaused;

  return (
    <section
      id="integrations"
      aria-labelledby="constellation-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Margin column */}
        <div className="lg:col-span-3 space-y-4">
          <h2
            id="constellation-heading"
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

          <SampleTag show={config.sample} label={sampleLabel} />

          {/* Category filter pills */}
          <div
            role="group"
            aria-label="Integration categories"
            className="flex flex-wrap gap-2 pt-2"
          >
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              aria-pressed={activeCategory === null}
              className={`px-2.5 py-1.5 rounded-[2px] border font-mono text-xs cursor-pointer transition-colors ${
                activeCategory === null
                  ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-medium'
                  : 'border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink)] hover:border-[var(--color-ink-blue)]'
              }`}
            >
              All ({config.items.length})
            </button>
            {config.categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const nextCat = isSelected ? null : cat;
                    setActiveCategory(nextCat);
                    if (nextCat) {
                      const firstInCat = config.items.find(
                        (i) => i.category === nextCat
                      );
                      if (firstInCat) handleSelectNode(firstInCat.id);
                    }
                  }}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1.5 rounded-[2px] border font-mono text-xs cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                    isSelected
                      ? 'border-[var(--color-ink-blue)] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-semibold'
                      : 'border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-blue)]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {motion === 'full' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setFlowPaused((p) => !p)}
                className="px-2.5 py-1 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] font-mono text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
              >
                {flowPaused ? '▶ Resume signal pulses' : '⏸ Pause signal pulses'}
              </button>
            </div>
          )}
        </div>

        {/* 9-column constellation stage + inspector + factual permissions ledger */}
        <div className="lg:col-span-9 space-y-5">
          {/* Desktop Elliptical Orbit SVG Stage */}
          <div className="hidden md:block p-5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs text-[var(--color-ink-muted)]">
              <span>
                Click any integration node in the orbit to inspect its exact read/write scope
              </span>
              <span className="text-[var(--color-ink-blue)]">
                Selected: <strong>{selectedItem?.name}</strong> ({selectedItem?.category})
              </span>
            </div>

            <svg
              viewBox="0 0 880 440"
              className="w-full h-auto overflow-visible select-none"
              aria-label="Integration constellation diagram"
            >
              {/* Outer & Inner Elliptical Orbit Guides */}
              <ellipse
                cx={centerX}
                cy={centerY}
                rx={338}
                ry={170}
                fill="none"
                stroke="var(--color-border-warm)"
                strokeDasharray="4 6"
              />
              <ellipse
                cx={centerX}
                cy={centerY}
                rx={232}
                ry={115}
                fill="none"
                stroke="var(--color-border-warm)"
                strokeDasharray="2 5"
              />

              {/* 15 integration nodes arranged evenly with alternating inner/outer rings so zero boxes overlap */}
              {config.items.map((item, idx) => {
                const total = config.items.length;
                const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;

                const isCategoryMatch =
                  activeCategory === null || activeCategory === item.category;
                const isSelected = selectedNodeId === item.id;
                const isHovered = hoveredNodeId === item.id;

                // Alternating outer (338x170) and inner (232x115) orbits prevent adjacent label collisions
                const isOuterRing = idx % 2 === 0;
                const pullFactor =
                  activeCategory === item.category
                    ? 0.88
                    : isSelected
                    ? 0.94
                    : 1.0;

                const rx = (isOuterRing ? 338 : 232) * pullFactor;
                const ry = (isOuterRing ? 170 : 115) * pullFactor;

                const nx = Math.round(centerX + Math.cos(angle) * rx);
                const ny = Math.round(centerY + Math.sin(angle) * ry);

                const linePath = wobblyLine(
                  { x: centerX, y: centerY },
                  { x: nx, y: ny },
                  item.seed
                );

                const boxW = 118;
                const boxH = 30;
                const durationSec = (2.6 + (idx % 5) * 0.45).toFixed(2);

                return (
                  <g
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.name} (${item.category}) — Reads: ${item.reads}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectNode(item.id)}
                    onMouseEnter={() => setHoveredNodeId(item.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectNode(item.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                    style={{
                      opacity: isCategoryMatch || isSelected ? 1 : 0.3,
                      transition: 'opacity 220ms ease',
                    }}
                  >
                    {/* Spoke line */}
                    <path
                      d={linePath}
                      stroke={
                        isSelected
                          ? 'var(--color-green-pen)'
                          : 'var(--color-ink-blue)'
                      }
                      strokeWidth={isSelected || isHovered ? '2.2' : '1.25'}
                      strokeOpacity={isSelected || isHovered ? '0.95' : '0.45'}
                      fill="none"
                    />

                    {/* Animated data packet travelling along the spoke */}
                    {animatePackets && (isCategoryMatch || isSelected) && (
                      <circle
                        r={isSelected ? '4.2' : '2.8'}
                        fill={
                          isSelected
                            ? 'var(--color-green-pen)'
                            : 'var(--color-ink-blue)'
                        }
                      >
                        <animateMotion
                          dur={`${durationSec}s`}
                          repeatCount="indefinite"
                          path={linePath}
                        />
                      </circle>
                    )}

                    {/* Node box */}
                    <g
                      transform={`translate(${nx - boxW / 2}, ${ny - boxH / 2})`}
                    >
                      {isSelected && (
                        <rect
                          x="-3"
                          y="-3"
                          width={boxW + 6}
                          height={boxH + 6}
                          rx="3"
                          fill="none"
                          stroke="var(--color-ink-blue)"
                          strokeWidth="1.2"
                          strokeDasharray="3 2"
                        />
                      )}
                      <rect
                        width={boxW}
                        height={boxH}
                        rx="2"
                        fill={
                          isSelected
                            ? 'var(--color-card-elevated)'
                            : 'var(--color-page)'
                        }
                        stroke={
                          isSelected || isHovered
                            ? 'var(--color-ink-blue)'
                            : 'var(--color-border-warm)'
                        }
                        strokeWidth={isSelected || isHovered ? '2' : '1.2'}
                      />
                      {/* Status dot */}
                      <circle
                        cx="10"
                        cy={boxH / 2}
                        r="3"
                        fill={
                          isSelected
                            ? 'var(--color-green-pen)'
                            : 'var(--color-ink-blue)'
                        }
                      />
                      <text
                        x={boxW / 2 + 4}
                        y="19"
                        textAnchor="middle"
                        fill="var(--color-ink)"
                        fontSize="11"
                        fontWeight={isSelected ? '600' : '400'}
                        fontFamily="var(--font-mono)"
                      >
                        {item.name}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Central Hub: Your workspace */}
              <g
                transform={`translate(${centerX - 74}, ${centerY - 24})`}
                className="pointer-events-none"
              >
                <rect
                  x="-4"
                  y="-4"
                  width="156"
                  height="56"
                  rx="4"
                  fill="none"
                  stroke="var(--color-ink-blue)"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <rect
                  width="148"
                  height="48"
                  rx="2"
                  fill="var(--color-card-elevated)"
                  stroke="var(--color-ink-blue)"
                  strokeWidth="2.2"
                />
                <text
                  x="74"
                  y="28"
                  textAnchor="middle"
                  fill="var(--color-ink)"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {messages.centerLabel}
                </text>
              </g>
            </svg>

            {/* Interactive Inspector Panel for the Clicked Constellation Node */}
            {selectedItem && (
              <div
                aria-live="polite"
                className="mt-4 p-4 rounded-[2px] border-2 border-[var(--color-ink-blue)] bg-[var(--color-page)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <GeometricGlyph glyph={selectedItem.glyph} />
                    <span className="font-serif font-semibold text-base text-[var(--color-ink)]">
                      {selectedItem.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-[2px] bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)] font-mono text-xs">
                      {selectedItem.category}
                    </span>
                    <SampleTag show={selectedItem.sample} label={sampleLabel} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                    <div>
                      <span className="text-[var(--color-ink-muted)]">
                        {messages.colReads}:{' '}
                      </span>
                      <strong className="text-[var(--color-ink)]">
                        {selectedItem.reads}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-muted)]">
                        {messages.colWrites}:{' '}
                      </span>
                      <strong className="text-[var(--color-ink)]">
                        {selectedItem.writes}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-muted)]">
                        {messages.colNeeds}:{' '}
                      </span>
                      <strong className="text-[var(--color-ink)]">
                        {selectedItem.needs}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestHandshake}
                    className="px-3 py-1.5 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink-blue)] hover:bg-[var(--color-ink-blue)] hover:text-[var(--color-card)] cursor-pointer transition-colors"
                  >
                    {syncTestStatus === 'testing'
                      ? 'Checking scope...'
                      : syncTestStatus === 'verified'
                      ? '✓ Read-only scope verified (sample)'
                      : 'Test sample scope'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Factual permissions list: always visible on mobile, collapsible on desktop */}
          <div className="p-4 sm:p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)]">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--color-border-warm)]">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                  Permissions & data access ledger ({filteredItems.length})
                </h3>
                <SampleTag show={config.sample} label={sampleLabel} />
              </div>
              <button
                type="button"
                onClick={() => setTableExpandedDesktop((v) => !v)}
                aria-expanded={tableExpandedDesktop}
                className="hidden md:inline-flex font-mono text-xs text-[var(--color-ink-blue)] underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
              >
                {tableExpandedDesktop
                  ? messages.toggleTableHide
                  : messages.toggleTableShow}
              </button>
            </div>

            <div
              className={`${
                tableExpandedDesktop ? 'block' : 'block md:hidden'
              } overflow-x-auto`}
            >
              <table className="w-full text-start border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-warm)] font-mono text-[11px] uppercase text-[var(--color-ink-muted)]">
                    <th scope="col" className="py-2 pe-3 text-start">
                      {messages.colIntegration}
                    </th>
                    <th scope="col" className="py-2 px-3 text-start">
                      {messages.colCategory}
                    </th>
                    <th scope="col" className="py-2 px-3 text-start">
                      {messages.colReads}
                    </th>
                    <th scope="col" className="py-2 px-3 text-start">
                      {messages.colWrites}
                    </th>
                    <th scope="col" className="py-2 ps-3 text-start">
                      {messages.colNeeds}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-warm)]">
                  {filteredItems.map((item) => {
                    const isRowSelected = item.id === selectedNodeId;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectNode(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isRowSelected
                            ? 'bg-[var(--color-ink-blue-soft)]/50'
                            : 'hover:bg-[var(--color-page)]/60'
                        }`}
                      >
                        <td className="py-2.5 pe-3 font-medium text-[var(--color-ink)] whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <GeometricGlyph glyph={item.glyph} />
                            <span>{item.name}</span>
                            <SampleTag show={item.sample} label={sampleLabel} />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-[var(--color-ink-blue)]">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--color-ink)]">
                          {item.reads}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--color-ink)]">
                          {item.writes}
                        </td>
                        <td className="py-2.5 ps-3 text-[var(--color-ink-muted)]">
                          {item.needs}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
