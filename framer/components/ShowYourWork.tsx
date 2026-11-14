// framer/components/ShowYourWork.tsx — Standalone Framer Code Component for the Show-your-work step drawer with Property Controls (Part 5.6)
import React from 'react';
import { addPropertyControls, ControlType } from 'framer';

export interface FramerStepItem {
  label: string;
  detail: string;
  duration: string;
}

export interface FramerShowYourWorkProps {
  heading: string;
  steps: FramerStepItem[];
  leftOutNote: string;
}

const DEFAULT_STEPS: FramerStepItem[] = [
  { label: 'Read', detail: '6 messages from 3 people', duration: '0.6s' },
  { label: 'Grouped by topic', detail: 'Billing seat dispute + Firefox export bug', duration: '0.5s' },
  { label: 'Extracted 2 decisions', detail: 'Refund 1 seat (Mar–May); fix export this week', duration: '0.7s' },
  { label: 'Checked dates & gaps', detail: 'Flagged missing dollar refund amount', duration: '0.8s' },
];

export default function FramerShowYourWork({
  heading = 'Steps taken [sample]',
  steps = DEFAULT_STEPS,
  leftOutNote = 'Left out: Greetings and thanks — No decisions or facts',
}: FramerShowYourWorkProps) {
  return (
    <aside
      style={{
        width: 320,
        padding: 16,
        backgroundColor: '#F5F0E3',
        border: '1px solid #DCD3BC',
        borderRadius: 2,
        color: '#1C1B18',
        fontFamily: '"Spline Sans Mono", monospace',
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          color: '#1F4B99',
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {heading}
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {steps.map((s, idx) => (
          <li
            key={s.label}
            style={{
              padding: 10,
              marginBottom: 8,
              backgroundColor: '#FBF8EF',
              border: '1px solid #DCD3BC',
              borderRadius: 2,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <strong>
                {idx + 1}. {s.label}
              </strong>
              <span style={{ color: '#5C574D' }}>{s.duration}</span>
            </div>
            <div style={{ fontSize: 11, color: '#5C574D', marginTop: 4 }}>{s.detail}</div>
          </li>
        ))}
      </ol>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px dashed #DCD3BC',
          fontSize: 11,
          color: '#5C574D',
        }}
      >
        {leftOutNote}
      </div>
    </aside>
  );
}

addPropertyControls(FramerShowYourWork, {
  heading: {
    type: ControlType.String,
    title: 'Heading',
    defaultValue: 'Steps taken [sample]',
  },
  leftOutNote: {
    type: ControlType.String,
    title: 'Left Out Note',
    defaultValue: 'Left out: Greetings and thanks — No decisions or facts',
  },
});

