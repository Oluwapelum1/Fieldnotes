// components/faq/faq-section.tsx — FAQ as a conversation with arrow-key navigation, hash links, typing animation, Show all answers toggle, and mobile accordion (Part 4.11)
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { FaqItemSchema } from '@/lib/config-schema';
import type { z } from 'zod';
import type { Messages } from '@/lib/config-loader';
import { useNotebook } from '../notebook-context';
import { SampleTag } from '../annotations/sample-tag';

type FaqItem = z.infer<typeof FaqItemSchema>;

export interface FaqSectionProps {
  items: FaqItem[];
  messages: Messages['faq'];
  sampleLabel: string;
}

export function FaqSection({ items, messages, sampleLabel }: FaqSectionProps) {
  const { motion } = useNotebook();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isTypingDots, setIsTypingDots] = useState<boolean>(false);
  const [displayedChars, setDisplayedChars] = useState<number>(9999);

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeItem = items[selectedIndex] ?? items[0];

  // Under reduced motion / Off, show all answers at once without animation (Part 4.11)
  const effectiveShowAll = showAll || motion === 'off';

  // Sync with URL hash if a visitor loads #faq-question-id
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#faq-', '');
    if (hash) {
      const idx = items.findIndex((i) => i.id === hash);
      if (idx >= 0) setSelectedIndex(idx);
    }
  }, [items]);

  // Typing animation when selecting a question in interactive mode
  useEffect(() => {
    if (effectiveShowAll || !activeItem || !hasInteracted) {
      setIsTypingDots(false);
      setDisplayedChars(9999);
      return;
    }

    setIsTypingDots(true);
    setDisplayedChars(0);

    let interval: ReturnType<typeof setInterval> | null = null;
    const dotsTimer = setTimeout(() => {
      setIsTypingDots(false);
      const totalLen = activeItem.answer.length;
      // 20 ms per character, capped at 1500 ms total (Part 4.11)
      const totalDurationMs = Math.min(1500, totalLen * 20);
      const stepMs = 30;
      const charsPerTick = Math.max(1, Math.ceil(totalLen / (totalDurationMs / stepMs)));

      interval = setInterval(() => {
        setDisplayedChars((prev) => {
          if (prev + charsPerTick >= totalLen) {
            if (interval) clearInterval(interval);
            return totalLen;
          }
          return prev + charsPerTick;
        });
      }, stepMs);
    }, 400);

    return () => {
      clearTimeout(dotsTimer);
      if (interval) clearInterval(interval);
    };
  }, [selectedIndex, effectiveShowAll, activeItem, hasInteracted]);

  const handleQuestionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % items.length;
      setHasInteracted(true);
      setSelectedIndex(next);
      buttonRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + items.length) % items.length;
      setHasInteracted(true);
      setSelectedIndex(prev);
      buttonRefs.current[prev]?.focus();
    }
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-16 sm:py-24 border-t border-[var(--color-border-warm)] max-w-[var(--container-max)] mx-auto px-[var(--side-margin)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h2
            id="faq-heading"
            className="font-serif text-[length:var(--text-h1)] leading-[var(--leading-h1)] text-[var(--color-ink)]"
          >
            <span>{messages.headlineBefore}</span>
            <em className="italic font-normal text-[var(--color-ink-blue)]">
              {messages.headlineItalic}
            </em>
            <span>{messages.headlineAfter}</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={effectiveShowAll}
          className="px-3 py-1.5 rounded-[2px] border border-[var(--color-ink-blue)] bg-[var(--color-card)] font-mono text-xs text-[var(--color-ink-blue)] hover:bg-[var(--color-ink-blue-soft)] focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
        >
          {effectiveShowAll ? messages.interactiveMode : messages.showAllAnswers}
        </button>
      </div>

      {effectiveShowAll ? (
        /* Show All Answers View (Instant & Accessible) */
        <div
          data-testid="faq-all-answers"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {items.map((item, idx) => (
            <article
              key={item.id}
              id={`faq-${item.id}`}
              className="p-5 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--color-ink-blue)] font-semibold">
                  Q0{idx + 1}
                </span>
                <SampleTag show={item.sample} label={sampleLabel} />
              </div>
              <h3 className="font-serif font-semibold text-base text-[var(--color-ink)]">
                {item.question}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {item.answer}
              </p>
              {item.isDataQuestion && item.dataJourneyNodeRef && (
                <p className="pt-1 font-mono text-[11px] text-[var(--color-ink-blue)]">
                  <a href="#data" className="underline">
                    {messages.linkedDataNodePrefix} {item.dataJourneyNodeRef}
                  </a>
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        /* Split Conversation View on Desktop + Accordion on Mobile */
        <div>
          {/* Desktop 2-column conversation layout */}
          <div className="hidden md:grid md:grid-cols-12 gap-8 items-start">
            <div
              role="tablist"
              aria-label="Frequently asked questions"
              className="md:col-span-5 space-y-2"
            >
              {items.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      buttonRefs.current[idx] = el;
                    }}
                    role="tab"
                    id={`faq-tab-${item.id}`}
                    aria-selected={isSelected}
                    aria-controls={`faq-panel-${item.id}`}
                    type="button"
                    onClick={() => {
                      setHasInteracted(true);
                      setSelectedIndex(idx);
                      if (typeof history !== 'undefined') {
                        history.replaceState(null, '', `#faq-${item.id}`);
                      }
                    }}
                    onKeyDown={(e) => handleQuestionKeyDown(e, idx)}
                    className={`w-full text-start px-4 py-3 rounded-[2px] border transition-colors flex items-center justify-between gap-2 focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)] ${
                      isSelected
                        ? 'border-2 border-[var(--color-ink-blue)] bg-[var(--color-card-elevated)] font-medium text-[var(--color-ink)]'
                        : 'border-[var(--color-border-warm)] bg-[var(--color-card)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    <span className="text-sm">{item.question}</span>
                    <span className="font-mono text-xs text-[var(--color-ink-blue)]">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right notebook answer sheet */}
            {activeItem && (
              <div
                role="tabpanel"
                id={`faq-panel-${activeItem.id}`}
                aria-labelledby={`faq-tab-${activeItem.id}`}
                aria-live={
                  !isTypingDots && displayedChars >= activeItem.answer.length
                    ? 'polite'
                    : 'off'
                }
                className="md:col-span-7 p-6 sm:p-8 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)] shadow-[var(--shadow-card)] min-h-[260px] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-dashed border-[var(--color-border-warm)]">
                    <span className="font-mono text-xs text-[var(--color-ink-blue)]">
                      {messages.marginQuestionPrefix} {activeItem.question}
                    </span>
                    <SampleTag show={activeItem.sample} label={sampleLabel} />
                  </div>

                  {isTypingDots ? (
                    <div
                      aria-label="Writing answer"
                      className="py-6 font-mono text-sm text-[var(--color-ink-blue)] tracking-widest"
                    >
                      • • •
                    </div>
                  ) : (
                    <p className="font-sans text-base text-[var(--color-ink)] leading-relaxed">
                      {activeItem.answer.slice(0, displayedChars)}
                    </p>
                  )}
                </div>

                {activeItem.isDataQuestion && activeItem.dataJourneyNodeRef && (
                  <div className="mt-6 pt-3 border-t border-[var(--color-border-warm)] flex items-center justify-between font-mono text-xs">
                    <a
                      href="#data"
                      className="text-[var(--color-ink-blue)] underline"
                    >
                      {messages.linkedDataNodePrefix}{' '}
                      {activeItem.dataJourneyNodeRef} →
                    </a>
                    <span className="text-[var(--color-ink-muted)]">
                      #faq-{activeItem.id}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden space-y-2.5">
            {items.map((item, idx) => {
              const isOpen = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className="rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card)]"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setSelectedIndex(idx)}
                    className="w-full text-start px-4 py-3 font-serif font-medium text-sm text-[var(--color-ink)] flex items-center justify-between"
                  >
                    <span>{item.question}</span>
                    <span className="font-mono text-xs text-[var(--color-ink-blue)]">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-[var(--color-ink-muted)] border-t border-dashed border-[var(--color-border-warm)]">
                      <p>{item.answer}</p>
                      <div className="mt-2">
                        <SampleTag show={item.sample} label={sampleLabel} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

