// components/header/fieldnotes-logo.tsx — Bespoke SVG lab-notebook emblem and editorial wordmark for Fieldnotes
'use client';

import React from 'react';

export interface FieldnotesLogoProps {
  productName: string;
  size?: 'sm' | 'md';
}

export function FieldnotesLogo({
  productName,
  size = 'md',
}: FieldnotesLogoProps) {
  const isSm = size === 'sm';

  return (
    <span className="group inline-flex items-center gap-2.5 select-none">
      {/* Architectural Lab-Notebook + Fountain Nib SVG Emblem */}
      <span
        aria-hidden="true"
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 ${
          isSm ? 'w-7 h-7' : 'w-9 h-9'
        }`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Offset hard notebook shadow */}
          <rect
            x="7"
            y="6"
            width="27"
            height="31"
            rx="2"
            fill="var(--color-ink)"
            fillOpacity="0.18"
          />

          {/* Main notebook sheet */}
          <path
            d="M5 4.5C5 3.67157 5.67157 3 6.5 3H25.5L32 9.5V33.5C32 34.3284 31.3284 35 30.5 35H6.5C5.67157 35 5 34.3284 5 33.5V4.5Z"
            fill="var(--color-card)"
            stroke="var(--color-ink)"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Internal graph-paper grid hairlines */}
          <line
            x1="6"
            y1="13"
            x2="31"
            y2="13"
            stroke="var(--color-border-warm)"
            strokeWidth="0.9"
          />
          <line
            x1="6"
            y1="19.5"
            x2="31"
            y2="19.5"
            stroke="var(--color-border-warm)"
            strokeWidth="0.9"
          />
          <line
            x1="6"
            y1="26"
            x2="31"
            y2="26"
            stroke="var(--color-border-warm)"
            strokeWidth="0.9"
          />
          <line
            x1="18.5"
            y1="4"
            x2="18.5"
            y2="34"
            stroke="var(--color-border-warm)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />

          {/* Red-pencil vertical margin line */}
          <line
            x1="11.5"
            y1="4"
            x2="11.5"
            y2="34"
            stroke="var(--color-red-pencil)"
            strokeWidth="1.35"
          />

          {/* Folded dog-ear corner */}
          <path
            d="M25.2 3.2V9.8H31.8"
            fill="var(--color-page)"
            stroke="var(--color-ink)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Skewed yellow marker highlight bar */}
          <rect
            x="13.5"
            y="22"
            width="14.5"
            height="5.2"
            rx="1"
            transform="rotate(-2.5 13.5 22)"
            fill="var(--color-marker)"
          />

          {/* Hand-drawn cobalt ink proof trajectory */}
          <path
            d="M14 25.5C16.4 22.2 18.4 26.8 21.2 21.2C22.9 17.8 25.1 15.2 27.6 12.6"
            stroke="var(--color-ink-blue)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Verified source node (green pen) */}
          <circle
            cx="27.6"
            cy="12.6"
            r="2.5"
            fill="var(--color-green-pen)"
            stroke="var(--color-card)"
            strokeWidth="1"
          />

          {/* Three binding rings along left spine */}
          <rect
            x="2.6"
            y="9"
            width="4.2"
            height="2.2"
            rx="1"
            fill="var(--color-ink-blue)"
          />
          <rect
            x="2.6"
            y="18"
            width="4.2"
            height="2.2"
            rx="1"
            fill="var(--color-ink-blue)"
          />
          <rect
            x="2.6"
            y="27"
            width="4.2"
            height="2.2"
            rx="1"
            fill="var(--color-ink-blue)"
          />
        </svg>
      </span>

      {/* Editorial Wordmark + Specimen Stamp */}
      <span className="inline-flex flex-col leading-none">
        <span className="inline-flex items-baseline gap-1.5">
          <span
            className={`font-serif font-semibold tracking-tight text-[var(--color-ink)] ${
              isSm ? 'text-base' : 'text-lg'
            }`}
          >
            {productName}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider px-1 py-0.5 rounded-[2px] border border-[var(--color-ink-blue)]/35 bg-[var(--color-ink-blue-soft)] text-[var(--color-ink-blue)]">
            LAB.01
          </span>
        </span>
        {/* Hand-drawn ink underline under wordmark */}
        <svg
          aria-hidden="true"
          viewBox="0 0 96 5"
          fill="none"
          className="w-20 h-[4px] mt-0.5 text-[var(--color-ink-blue)] opacity-75 group-hover:opacity-100 transition-opacity"
        >
          <path
            d="M1 3.2C24 1.4 58 4.2 95 1.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}

