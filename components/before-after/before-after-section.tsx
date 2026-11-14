// components/before-after/before-after-section.tsx — Interactive Chaos-to-Calm 24 paper slips section with on-demand Play animation, scrub slider, clickable slips, and scroll sync (Part 3.4 & 4.4)
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Messages } from '@/lib/config-loader';
import { mulberry32 } from '@/lib/annotations/prng';
import { useNotebook } from '../notebook-context';
import { AnnotationMark } from '../annotations/annotation-mark';
import { SampleTag } from '../annotations/sample-tag';

type GroupKey = 'Billing' | 'Bugs' | 'Questions' | 'Other';

interface SlipItem {
  id: string;
  sender: string;
  subject: string;
  group: GroupKey;
  colIndex: number;
  rowInCol: number;
  chaosX: number; // px offset from column target
  chaosY: number; // px offset from row target
  chaosDeg: number; // -6 to +6 deg
}

const SLIP_DATA: Array<{ sender: string; subject: string; group: GroupKey }> = [
  // Billing (9)
  { sender: 'Maya Lin', subject: 'Invoice #1042 shows 4 seats instead of 3', group: 'Billing' },
  { sender: 'Priya Nair', subject: 'Audit log: seat added 9 March by j.ortiz', group: 'Billing' },
  { sender: 'L. Bergström', subject: 'VAT number missing on April receipt PDF', group: 'Billing' },
  { sender: 'K. Takahashi', subject: 'Switch workspace from monthly to annual billing', group: 'Billing' },
  { sender: 'R. Morales', subject: 'Refund request for unused March trial seat', group: 'Billing' },
  { sender: 'H. Al-Mansoor', subject: 'PO #8841 attached for Q4 renewal', group: 'Billing' },
  { sender: 'S. Lindqvist', subject: 'Duplicate €118.40 DB rail charge in row 15', group: 'Billing' },
  { sender: 'C. Dubois', subject: 'Card expiring before the 14th renewal date', group: 'Billing' },
  { sender: 'T. Okafor', subject: 'Client dinner 195 — missing currency code', group: 'Billing' },
  // Bugs (6)
  { sender: 'Maya Lin', subject: 'CSV export button stalls on Firefox 132', group: 'Bugs' },
  { sender: 'D. Vance', subject: 'EU webhook queue delayed 40 mins (18 slips)', group: 'Bugs' },
  { sender: 'J. Kováč', subject: 'Daylight-saving timestamp off by 1h in March', group: 'Bugs' },
  { sender: 'A. Novak', subject: 'Filename truncated when space is in title', group: 'Bugs' },
  { sender: 'M. Rossi', subject: 'Keyboard focus jumps on Escape in modal', group: 'Bugs' },
  { sender: 'E. Chen', subject: 'Status page threshold was set to 60 min', group: 'Bugs' },
  // Questions (5)
  { sender: 'N. Becker', subject: 'Where is our Frankfurt data stored and deleted?', group: 'Questions' },
  { sender: 'F. Silva', subject: 'Can we set retention to 0 days (stateless)?', group: 'Questions' },
  { sender: 'Y. Sato', subject: 'Does the model ever train on our support threads?', group: 'Questions' },
  { sender: 'O. Ibrahim', subject: 'How does right-to-left Arabic margin export work?', group: 'Questions' },
  { sender: 'G. Miller', subject: 'Can 12 support agents share one Team folder?', group: 'Questions' },
  // Other (4)
  { sender: 'Tom (Support)', subject: 'Sorry Maya! Checking with billing now.', group: 'Other' },
  { sender: 'System Bot', subject: '--- legacy macro subtotal separator ---', group: 'Other' },
  { sender: 'Auto-Responder', subject: 'Out of office until Monday 18 Nov', group: 'Other' },
  { sender: 'P. Hoffman', subject: 'Thanks! Talk to you next Tuesday.', group: 'Other' },
];

const GROUP_ORDER: GroupKey[] = ['Billing', 'Bugs', 'Questions', 'Other'];
const GROUP_COUNTS: Record<GroupKey, number> = {
  Billing: 9,
  Bugs: 6,
  Questions: 5,
  Other: 4,
};

export interface BeforeAfterSectionProps {
  messages: Messages['beforeAfter'];
  sampleLabel: string;
}

export function BeforeAfterSection({
  messages,
  sampleLabel,
}: BeforeAfterSectionProps) {
  const { motion, isRtl } = useNotebook();
  const sectionRef = useRef<HTMLElement | null>(null);
  const animRafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState<number>(1);
  const [manualOverride, setManualOverride] = useState<number | null>(null);
  const [isAnimatingPlay, setIsAnimatingPlay] = useState<boolean>(false);
  const [selectedSlipId, setSelectedSlipId] = useState<string>('slip-1');

  const slips = useMemo<SlipItem[]>(() => {
    const rng = mulberry32(202611);
    const counters: Record<GroupKey, number> = {
      Billing: 0,
      Bugs: 0,
      Questions: 0,
      Other: 0,
    };

    return SLIP_DATA.map((item, idx) => {
      const colIndex = GROUP_ORDER.indexOf(item.group);
      const rowInCol = counters[item.group]++;
      const chaosX = (rng() * 2 - 1) * 165 + (1.5 - colIndex) * 85;
      const chaosY = (rng() * 2 - 1) * 85 + (2 - rowInCol) * 22;
      const chaosDeg = Number(((rng() * 2 - 1) * 6).toFixed(2));
      return {
        id: `slip-${idx + 1}`,
        sender: item.sender,
        subject: item.subject,
        group: item.group,
        colIndex,
        rowInCol,
        chaosX: Math.round(chaosX),
        chaosY: Math.round(chaosY),
        chaosDeg,
      };
    });
  }, []);

  useEffect(() => {
    if (motion === 'off' || manualOverride !== null || isAnimatingPlay) {
      return;
    }

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight || 800;
      const totalScrollable = Math.max(1, rect.height - viewH);
      const scrolled = -rect.top;
      const raw = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setProgress(raw);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [motion, manualOverride, isAnimatingPlay]);

  useEffect(() => {
    return () => {
      if (animRafRef.current !== null) cancelAnimationFrame(animRafRef.current);
    };
  }, []);

  const playChaosToCalmAnimation = () => {
    if (animRafRef.current !== null) cancelAnimationFrame(animRafRef.current);
    setIsAnimatingPlay(true);
    setManualOverride(0);

    const startTime = performance.now();
    const duration = motion === 'off' ? 50 : 1250;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      setManualOverride(p);
      if (p < 1) {
        animRafRef.current = requestAnimationFrame(tick);
      } else {
        setIsAnimatingPlay(false);
      }
    };

    animRafRef.current = requestAnimationFrame(tick);
  };

  const toggleMessOrTidy = () => {
    if (animRafRef.current !== null) cancelAnimationFrame(animRafRef.current);
    setIsAnimatingPlay(false);
    const current = manualOverride !== null ? manualOverride : progress;
    setManualOverride(current > 0.5 ? 0 : 1);
  };

  const effectiveProgress =
    manualOverride !== null
      ? manualOverride
      : motion === 'off'
      ? 1
      : progress;

  // Map 0.15..0.75 progress into 0..1 interpolation factor t
  const rawT =
    effectiveProgress <= 0.15
      ? 0
      : effectiveProgress >= 0.75
      ? 1
      : (effectiveProgress - 0.15) / 0.6;
  const t = 1 - Math.pow(1 - rawT, 3);
  const headersVisible = t >= 0.65;
  const endNoteVisible = t >= 0.9;

  const selectedSlip = slips.find((s) => s.id === selectedSlipId) ?? slips[0];

  return (
    <section
      id="before-after"
      ref={sectionRef}
      aria-labelledby="before-after-heading"
      className={`relative border-t border-[var(--color-border-warm)] ${
        motion === 'off' ? 'py-16 sm:py-24' : 'min-h-[140vh] lg:min-h-[175vh] py-16'
      }`}
    >
      <div
        className={`${
          motion === 'off' ? '' : 'lg:sticky lg:top-16'
        } max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Narrow 3-column margin column */}
          <div className="lg:col-span-3 space-y-4">
            <h2
              id="before-after-heading"
              className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
            >
              <span>{messages.headlineBefore}</span>
              <em className="italic font-normal text-[var(--color-ink-blue)]">
                {messages.headlineItalic}
              </em>
              <span>{messages.headlineAfter}</span>
            </h2>

            <p className="font-sans text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {messages.marginExplanation}
            </p>

            <div className="p-3 rounded-[2px] border border-dashed border-[var(--color-border-warm)] bg-[var(--color-card)] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--color-ink-blue)]">
                  {messages.marginNote}
                </span>
                <SampleTag show={true} label={sampleLabel} />
              </div>
              <AnnotationMark
                kind="arrow"
                seed={304}
                width={64}
                height={22}
                color="ink-blue"
                flipRtl={isRtl}
              />
            </div>

            {/* Interactive Controls: Toggle Mess/Tidy + Replay Sweep */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleMessOrTidy}
                aria-pressed={t < 0.5}
                className="px-3 py-1.5 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink-blue)] hover:bg-[var(--color-ink-blue-soft)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
              >
                {t < 0.5 ? messages.showTidyStacks : messages.showTheMess}
              </button>

              <button
                type="button"
                onClick={playChaosToCalmAnimation}
                className="px-3 py-1.5 rounded-[2px] bg-[var(--color-ink-blue)] text-[var(--color-card)] font-mono text-xs font-medium hover:opacity-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
              >
                ▶ Replay sorting sweep
              </button>
            </div>

            {/* Interactive scrub slider */}
            <div className="p-3 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px] text-[var(--color-ink-muted)]">
                <label htmlFor="chaos-calm-slider">Chaos ↔ Calm scrub</label>
                <span className="font-semibold text-[var(--color-ink-blue)]">
                  {Math.round(t * 100)}% sorted
                </span>
              </div>
              <input
                id="chaos-calm-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(t * 100)}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  setIsAnimatingPlay(false);
                  setManualOverride(0.15 + val * 0.6);
                }}
                className="w-full accent-[var(--color-ink-blue)] cursor-pointer"
              />
            </div>

            {/* Screen-reader and plain-text equivalent with sample flag (Part 3.4) */}
            <p
              data-testid="before-after-text-equivalent"
              className="font-mono text-xs text-[var(--color-ink-muted)] leading-relaxed"
            >
              {messages.textEquivalent} <SampleTag show={true} label={sampleLabel} />
            </p>

            {/* 0.9 to 1.0 completion hand-drawn arrow and note */}
            <div
              className={`transition-opacity duration-300 flex items-center gap-2 pt-2 ${
                endNoteVisible ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <AnnotationMark
                kind="tick"
                seed={309}
                width={18}
                height={18}
                color="green-pen"
              />
              <span className="font-mono text-xs font-semibold text-[var(--color-green-pen)]">
                {messages.endNote}
              </span>
            </div>
          </div>

          {/* Wide 9-column stage for the 24 paper slips */}
          <div className="lg:col-span-9 p-4 sm:p-6 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)] overflow-hidden space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {GROUP_ORDER.map((groupKey) => {
                const groupSlips = slips.filter((s) => s.group === groupKey);
                const localizedGroupTitle = messages.groups[groupKey] ?? groupKey;
                const count = GROUP_COUNTS[groupKey];

                return (
                  <div key={groupKey} className="flex flex-col">
                    {/* Column header + count with highlighter sweep */}
                    <div
                      className={`mb-3 pb-2 border-b border-[var(--color-border-warm)] flex items-center justify-between transition-opacity duration-300 ${
                        headersVisible ? 'opacity-100' : 'opacity-35'
                      }`}
                    >
                      <span
                        className={`font-serif font-semibold text-sm text-[var(--color-ink)] fn-highlighter ${
                          headersVisible ? 'is-active' : ''
                        }`}
                      >
                        {localizedGroupTitle}
                      </span>
                      <span className="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded-[2px] bg-[var(--color-page)] border border-[var(--color-border-warm)] text-[var(--color-ink-muted)]">
                        {count}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {groupSlips.map((slip) => {
                        const dx = Math.round(slip.chaosX * (1 - t));
                        const dy = Math.round(slip.chaosY * (1 - t));
                        const deg = Number((slip.chaosDeg * (1 - t)).toFixed(2));
                        const isSlipSelected = slip.id === selectedSlipId;

                        return (
                          <button
                            key={slip.id}
                            type="button"
                            onClick={() => setSelectedSlipId(slip.id)}
                            style={{
                              transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${deg}deg)`,
                            }}
                            className={`w-full text-start p-2 rounded-[2px] border bg-[var(--color-page)] shadow-2xs cursor-pointer transition-colors will-change-transform ${
                              isSlipSelected
                                ? 'border-2 border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)] z-10 relative'
                                : 'border-[var(--color-border-warm)] hover:border-[var(--color-ink-blue)]/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] font-semibold text-[var(--color-ink-muted)] truncate">
                                {slip.sender}
                              </span>
                              <span className="font-mono text-[9px] uppercase text-[var(--color-ink-blue)]">
                                {localizedGroupTitle}
                              </span>
                            </div>
                            <p className="mt-0.5 font-sans text-xs text-[var(--color-ink)] leading-snug line-clamp-2">
                              {slip.subject}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Slip Inspector Bar */}
            {selectedSlip && (
              <div className="pt-3 border-t border-dashed border-[var(--color-border-warm)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <div>
                  <span className="text-[var(--color-ink-blue)] font-semibold">
                    [{selectedSlip.id.toUpperCase()}]
                  </span>{' '}
                  <strong className="text-[var(--color-ink)]">
                    {selectedSlip.sender}:
                  </strong>{' '}
                  <span className="text-[var(--color-ink)]">
                    “{selectedSlip.subject}”
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-[2px] bg-[var(--color-green-pen-soft)] border border-[var(--color-green-pen)] text-[var(--color-green-pen)]">
                  Routed → {messages.groups[selectedSlip.group] ?? selectedSlip.group}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
