// components/annotations/annotation-mark.tsx — Decorative hand-drawn SVG mark with stroke-dashoffset draw-on (Part 2.4)
'use client';

import React, { useMemo } from 'react';
import {
  wobblyLine,
  arrow,
  circle,
  bracket,
  tick,
  cross,
  asterisk,
  questionMark,
  computeStrokeDurationMs,
} from '@/lib/annotations/paths';

export type AnnotationMarkKind =
  | 'wobbly-line'
  | 'arrow'
  | 'circle'
  | 'bracket-left'
  | 'bracket-right'
  | 'tick'
  | 'cross'
  | 'asterisk'
  | 'question';

export interface AnnotationMarkProps {
  kind: AnnotationMarkKind;
  seed: number;
  width?: number;
  height?: number;
  color?: 'ink-blue' | 'red-pencil' | 'green-pen' | 'ink-muted';
  flipRtl?: boolean;
  animate?: boolean;
  className?: string;
}

const COLOR_MAP: Record<NonNullable<AnnotationMarkProps['color']>, string> = {
  'ink-blue': 'var(--color-ink-blue)',
  'red-pencil': 'var(--color-red-pencil)',
  'green-pen': 'var(--color-green-pen)',
  'ink-muted': 'var(--color-ink-muted)',
};

export function AnnotationMark({
  kind,
  seed,
  width = 120,
  height = 36,
  color = 'ink-blue',
  flipRtl = false,
  animate = true,
  className = '',
}: AnnotationMarkProps) {
  const pathData = useMemo(() => {
    switch (kind) {
      case 'wobbly-line':
        return wobblyLine(
          { x: 2, y: height / 2 },
          { x: width - 2, y: height / 2 },
          seed
        );
      case 'arrow':
        return flipRtl
          ? arrow(
              { x: width - 6, y: 6 },
              { x: 8, y: height - 6 },
              seed,
              { flipBend: true }
            )
          : arrow({ x: 6, y: 6 }, { x: width - 8, y: height - 6 }, seed);
      case 'circle':
        return circle(
          { x: 8, y: 6, width: Math.max(16, width - 16), height: Math.max(12, height - 12) },
          seed
        );
      case 'bracket-left':
        return bracket(
          { x: 4, y: 3, width: 10, height: Math.max(12, height - 6) },
          seed,
          flipRtl ? 'right' : 'left'
        );
      case 'bracket-right':
        return bracket(
          { x: 2, y: 3, width: 10, height: Math.max(12, height - 6) },
          seed,
          flipRtl ? 'left' : 'right'
        );
      case 'tick':
        return tick({ x: 1, y: 1 }, seed, Math.min(width, height));
      case 'cross':
        return cross({ x: 1, y: 1 }, seed, Math.min(width, height));
      case 'asterisk':
        return asterisk({ x: 1, y: 1 }, seed, Math.min(width, height));
      case 'question':
        return questionMark({ x: 1, y: 1 }, seed, Math.min(width, height));
    }
  }, [kind, seed, width, height, flipRtl]);

  const approxLen = Math.hypot(width, height) * 2.4;
  const durationMs = computeStrokeDurationMs(approxLen);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none select-none overflow-visible ${className}`}
    >
      <path
        d={pathData}
        stroke={COLOR_MAP[color]}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate
            ? {
                strokeDasharray: approxLen,
                strokeDashoffset: 0,
                animation: `fn-draw-stroke ${durationMs}ms var(--ease-ink) both`,
              }
            : undefined
        }
      />
    </svg>
  );
}

