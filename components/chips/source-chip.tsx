// components/chips/source-chip.tsx — Sourced, Inferred, and Unknown source chips with accessible keyboard popover (Part 3.3)
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnnotationMark } from '../annotations/annotation-mark';
import type { InputBlockSchema } from '@/lib/config-schema';
import type { z } from 'zod';

type InputBlock = z.infer<typeof InputBlockSchema>;

export interface SourceChipProps {
  claimType: 'sourced' | 'inferred' | 'unknown';
  sources: string[];
  inputBlocks: InputBlock[];
  inferredLabel: string;
  unknownLabel: string;
  popoverTitle: string;
  closeLabel: string;
  onHighlightBlocks: (blockIds: string[]) => void;
  seed?: number;
}

export function SourceChip({
  claimType,
  sources,
  inputBlocks,
  inferredLabel,
  unknownLabel,
  popoverTitle,
  closeLabel,
  onHighlightBlocks,
  seed = 17,
}: SourceChipProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverId = useId();

  const referencedBlocks = inputBlocks.filter((b) => sources.includes(b.id));

  // Build chip label (e.g., "msg 1, 5" or "inferred" or "check")
  let chipText = '';
  if (claimType === 'sourced' && sources.length > 0) {
    chipText = sources.join(', ');
  } else if (claimType === 'inferred') {
    chipText = sources.length > 0 ? `${inferredLabel} · ${sources.join(', ')}` : inferredLabel;
  } else {
    chipText = unknownLabel;
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && sources.length > 0) {
      onHighlightBlocks(sources);
      // Scroll first source block into view smoothly inside the input pane if present
      const firstEl = document.getElementById(`demo-input-block-${sources[0]}`);
      if (firstEl && typeof firstEl.scrollIntoView === 'function') {
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const badgeStyle =
    claimType === 'sourced'
      ? 'border-[var(--color-green-pen)] bg-[var(--color-green-pen-soft)] text-[var(--color-green-pen)]'
      : claimType === 'inferred'
      ? 'border-dashed border-[var(--color-ink-muted)] bg-[var(--color-page)] text-[var(--color-ink-muted)]'
      : 'border-[var(--color-red-pencil)] bg-[var(--color-red-pencil-soft)] text-[var(--color-red-pencil)]';

  return (
    <span className="relative inline-block align-baseline mx-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => sources.length > 0 && onHighlightBlocks(sources)}
        onMouseLeave={() => onHighlightBlocks([])}
        onFocus={() => sources.length > 0 && onHighlightBlocks(sources)}
        onBlur={() => onHighlightBlocks([])}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] rounded-[2px] border transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink-blue)] ${badgeStyle}`}
      >
        {claimType === 'sourced' && (
          <AnnotationMark
            kind="tick"
            seed={seed}
            width={11}
            height={11}
            color="green-pen"
            animate={false}
          />
        )}
        {claimType === 'inferred' && (
          <span aria-hidden="true" className="font-bold leading-none">
            ≈
          </span>
        )}
        {claimType === 'unknown' && (
          <AnnotationMark
            kind="question"
            seed={seed + 3}
            width={11}
            height={11}
            color="red-pencil"
            animate={false}
          />
        )}
        <span>{chipText}</span>
      </button>

      {open && (
        <div
          id={popoverId}
          ref={popoverRef}
          role="dialog"
          aria-label={popoverTitle}
          className="absolute z-30 left-0 mt-1.5 w-72 sm:w-80 p-3 rounded-[2px] border border-[var(--color-border-warm)] bg-[var(--color-card-elevated)] text-[var(--color-ink)] shadow-[var(--shadow-popover)] text-left"
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-[var(--color-border-warm)]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)]">
              {popoverTitle} ({chipText})
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className="font-mono text-[11px] text-[var(--color-ink-blue)] underline px-1 py-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-ink-blue)]"
            >
              {closeLabel}
            </button>
          </div>
          {referencedBlocks.length > 0 ? (
            <ul className="space-y-2 text-xs leading-relaxed">
              {referencedBlocks.map((b) => (
                <li
                  key={b.id}
                  className="p-2 rounded-[2px] bg-[var(--color-page)] border-l-2 border-[var(--color-ink-blue)]"
                >
                  <div className="font-mono text-[11px] font-semibold text-[var(--color-ink-muted)]">
                    [{b.id}] {b.author}
                  </div>
                  <blockquote className="mt-0.5 text-[var(--color-ink)]">
                    “{b.text}”
                  </blockquote>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[var(--color-red-pencil)]">
              Flagged for human verification: no direct line in the input states this value.
            </p>
          )}
        </div>
      )}
    </span>
  );
}

