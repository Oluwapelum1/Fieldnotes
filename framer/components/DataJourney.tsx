// framer/components/DataJourney.tsx — Standalone Framer Code Component for the 5-node Data Journey diagram with Property Controls (Part 5.6)
import React, { useState } from 'react';
import { addPropertyControls, ControlType } from 'framer';

const STAGES = [
  {
    id: 'your-data',
    title: '1. Your data',
    statement: 'Only the text or rows you select for a task leave your browser.',
  },
  {
    id: 'in-transit',
    title: '2. In transit',
    statement: 'Sent over HTTPS (TLS 1.3) directly to our worker in {region}.',
  },
  {
    id: 'processing',
    title: '3. Processing',
    statement: 'Processed in {region}. Your inputs are not used to train shared models.',
  },
  {
    id: 'storage',
    title: '4. Storage',
    statement: 'Saved in {region} for {days} days so your team can check sources.',
  },
  {
    id: 'deletion',
    title: '5. Deletion',
    statement: 'Deleted automatically after {days} days, or within 24h on request.',
  },
];

export default function FramerDataJourney({
  regionName = 'Frankfurt, Germany',
  retentionDays = 30,
  showPlaceholderBadge = true,
}: {
  regionName?: string;
  retentionDays?: number;
  showPlaceholderBadge?: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#FBF8EF',
        border: '1px solid #DCD3BC',
        borderRadius: 2,
        color: '#1C1B18',
        fontFamily: '"Albert Sans", sans-serif',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
        }}
      >
        {STAGES.map((st, idx) => {
          const formatted = st.statement
            .replace('{region}', regionName)
            .replace('{days}', String(retentionDays));
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              style={{
                textAlign: 'left',
                padding: 12,
                backgroundColor: idx === activeIdx ? '#FFFDF7' : '#F5F0E3',
                border:
                  idx === activeIdx ? '2px solid #1F4B99' : '1px solid #DCD3BC',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: '"Literata", serif', fontWeight: 600, fontSize: 14 }}>
                {st.title}
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.5, margin: '6px 0' }}>{formatted}</p>
              {showPlaceholderBadge && (
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    color: '#C4321E',
                    border: '1px solid #C4321E',
                    padding: '1px 4px',
                  }}
                >
                  ✎ Fill me in [sample]
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

addPropertyControls(FramerDataJourney, {
  regionName: {
    type: ControlType.String,
    title: 'Region',
    defaultValue: 'Frankfurt, Germany',
  },
  retentionDays: {
    type: ControlType.Number,
    title: 'Retention (days)',
    defaultValue: 30,
    min: 0,
    max: 365,
  },
  showPlaceholderBadge: {
    type: ControlType.Boolean,
    title: 'Placeholder Tag',
    defaultValue: true,
  },
});

