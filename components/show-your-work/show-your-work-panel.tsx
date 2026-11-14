// components/show-your-work/show-your-work-panel.tsx — Margin step panel, curved arrows (max 3), and bidirectional highlight linking (Part 3.2)
'use client';

import React, { useState } from 'react';
import type { Scenario } from '@/lib/config-schema';
import { AnnotationMark } from '../annotations/annotation-mark';
import { SampleTag } from '../annotations/sample-tag';

export interface ShowYourWorkPanelProps {
  scenario: Scenario;
  visibleStepIds: string[];
  activeStepId: string | null;
  onHoverStep: (stepId: string | null) => void;
  stepsHeading: string;
  leftOutHeading: string;
  stepProducedPrefix: string;
  sampleLabel: string;
  isRtl?: boolean;
}

export function ShowYourWorkPanel({
  scenario,
  visibleStepIds,
  activeStepId,
  onHoverStep,
  stepsHeading,
  leftOutHeading,
  stepProducedPrefix,
  sampleLabel,
  isRtl = false,
}: ShowYourWorkPanelProps) {
  const [initialSequenceDone, setInitialSequenceDone] = useState(false);

  // Count steps that produce output claims; cap visible arrows at 3 max (Part 3.2 rule)
  const producingSteps = scenario.steps.filter(
    (s) => s.produces.length > 0 && visibleStepIds.includes(s.id)
  );
  const maxThreeProducingIds = producingSteps.slice(0, 3).map((s) => s.id);

  // Map card IDs to titles for accessible text equivalent ("Step 2 produced: Decisions")
  const cardTitleById = Object.fromEntries(
    scenario.outputCards.map((c) => [c.id, c.title])
  );

  return (
    <aside
      aria-label={stepsHeading}
      onAnimationEnd={() => setInitialSequenceDone(true)}
      className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-s border-[var(--color-border-warm)] bg-[var(--color-page)] p-4 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-ink-blue)] font-semibold">
          {stepsHeading}
        </h3>
        <SampleTag show={scenario.sample} label={sampleLabel} />
      </div>

      <ol className="space-y-3" role="list">
        {scenario.steps.map((step, index) => {
          const isVisible = visibleStepIds.includes(step.id);
          const isFocusedOrHovered = activeStepId === step.id;
          const showArrow =
            step.produces.length > 0 &&
            (isFocusedOrHovered ||
              (!initialSequenceDone &&
                activeStepId === null &&
                maxThreeProducingIds.includes(step.id)));

          const producedTitles = step.produces
            .map((cid) => cardTitleById[cid] ?? cid)
            .join(', ');

          return (
            <li
              key={step.id}
              onMouseEnter={() => onHoverStep(step.id)}
              onMouseLeave={() => onHoverStep(null)}
              onFocus={() => onHoverStep(step.id)}
              onBlur={() => onHoverStep(null)}
              tabIndex={0}
              className={`relative p-2.5 rounded-[2px] border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                isFocusedOrHovered
                  ? 'border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)]'
                  : 'border-[var(--color-border-warm)] bg-[var(--color-card)]'
              } ${isVisible ? 'opacity-100' : 'opacity-40'}`}
            >
              {/* Curved ink-blue arrow pointing toward the Output pane on desktop (never more than 3 at once) */}
              {showArrow && (
                <div
                  aria-hidden="true"
                  data-step-arrow={step.id}
                  className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${
                    isRtl ? '-right-9' : '-left-9'
                  }`}
                >
                  <AnnotationMark
                    kind="arrow"
                    seed={400 + index * 17}
                    width={36}
                    height={22}
                    color="ink-blue"
                    flipRtl={!isRtl}
                  />
                </div>
              )}

              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)] font-mono text-[11px] font-bold">
                    {index + 1}
                  </span>
                  <span className="font-serif font-medium text-sm text-[var(--color-ink)]">
                    {step.label}
                  </span>
                </div>
                {step.durationLabel && (
                  <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular-nums">
                    {step.durationLabel}
                  </span>
                )}
              </div>

              <p className="mt-1 font-mono text-xs text-[var(--color-ink-muted)] leading-snug">
                {step.detail}
              </p>

              {/* Accessible text equivalent for linked highlights (Part 3.2) */}
              {producedTitles && (
                <p className="mt-1.5 font-mono text-[11px] text-[var(--color-ink-blue)]">
                  <span>
                    Step {index + 1} {stepProducedPrefix.toLowerCase()} {producedTitles}
                  </span>
                  {step.reads.length > 0 && (
                    <span className="text-[var(--color-ink-muted)]">
                      {' '}
                      (read: {step.reads.join(', ')})
                    </span>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {scenario.leftOut.length > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-[var(--color-border-warm)]">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
            {leftOutHeading}
          </h4>
          <ul className="space-y-1.5">
            {scenario.leftOut.map((item, idx) => (
              <li
                key={idx}
                className="font-mono text-xs text-[var(--color-ink-muted)] leading-relaxed"
              >
                <span className="line-through decoration-[var(--color-red-pencil)]">
                  {item.text}
                </span>{' '}
                — <span>{item.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

