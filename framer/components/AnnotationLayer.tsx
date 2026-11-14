// framer/components/AnnotationLayer.tsx — Standalone Framer Code Component for Seeded Hand-Drawn Annotations (Part 5.6)
import React from 'react';
import { addPropertyControls, ControlType } from 'framer';
import {
  wobblyLine,
  arrow,
  circle,
  bracket,
  tick,
  cross,
} from '../../lib/annotations/paths';

export default function FramerAnnotationLayer({
  kind = 'arrow',
  seed = 42,
  width = 140,
  height = 44,
  strokeColor = '#1F4B99',
  caption = 'start here',
}: {
  kind?: 'wobbly-line' | 'arrow' | 'circle' | 'bracket' | 'tick' | 'cross';
  seed?: number;
  width?: number;
  height?: number;
  strokeColor?: string;
  caption?: string;
}) {
  let d = '';
  switch (kind) {
    case 'wobbly-line':
      d = wobblyLine({ x: 4, y: height / 2 }, { x: width - 4, y: height / 2 }, seed);
      break;
    case 'arrow':
      d = arrow({ x: 6, y: 6 }, { x: width - 8, y: height - 6 }, seed);
      break;
    case 'circle':
      d = circle({ x: 8, y: 6, width: width - 16, height: height - 12 }, seed);
      break;
    case 'bracket':
      d = bracket({ x: 6, y: 4, width: 12, height: height - 8 }, seed, 'left');
      break;
    case 'tick':
      d = tick({ x: 4, y: 4 }, seed, Math.min(width, height) - 8);
      break;
    case 'cross':
      d = cross({ x: 4, y: 4 }, seed, Math.min(width, height) - 8);
      break;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
      }}
    >
      {caption && (
        <span
          style={{
            fontFamily: '"Spline Sans Mono", monospace',
            fontSize: 12,
            color: strokeColor,
          }}
        >
          {caption}
        </span>
      )}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
        <path
          d={d}
          stroke={strokeColor}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

addPropertyControls(FramerAnnotationLayer, {
  kind: {
    type: ControlType.Enum,
    title: 'Mark Kind',
    options: ['wobbly-line', 'arrow', 'circle', 'bracket', 'tick', 'cross'],
    defaultValue: 'arrow',
  },
  seed: {
    type: ControlType.Number,
    title: 'PRNG Seed',
    defaultValue: 42,
  },
  width: {
    type: ControlType.Number,
    title: 'Width',
    defaultValue: 140,
  },
  height: {
    type: ControlType.Number,
    title: 'Height',
    defaultValue: 44,
  },
  strokeColor: {
    type: ControlType.Color,
    title: 'Ink Colour',
    defaultValue: '#1F4B99',
  },
  caption: {
    type: ControlType.String,
    title: 'Margin Note',
    defaultValue: 'start here',
  },
});

