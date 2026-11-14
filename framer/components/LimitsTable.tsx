// framer/components/LimitsTable.tsx — Standalone Framer Code Component for the Honest Limits table with Property Controls (Part 5.6)
import React, { useState } from 'react';
import { addPropertyControls, ControlType } from 'framer';

export interface FramerLimitRow {
  limitation: string;
  checkWhen: string;
  status: 'Limitation' | 'Planned' | 'Fixed';
  reviewed: string;
  workaround: string;
}

const DEFAULT_ROWS: FramerLimitRow[] = [
  {
    limitation: 'Cannot read scanned PDFs or photos of handwritten receipts.',
    checkWhen: 'A thread or expense batch includes camera scans.',
    status: 'Limitation',
    reviewed: '2026-11-04',
    workaround: 'Run OCR before pasting, or attach plain-text exports.',
  },
  {
    limitation: 'Assumes bare numbers share the same currency unless a symbol is written.',
    checkWhen: 'Customers from two countries quote prices without currency codes.',
    status: 'Limitation',
    reviewed: '2026-11-04',
    workaround: 'Write the three-letter currency code (USD, EUR, JPY) in the first line.',
  },
  {
    limitation: 'Truncates threads longer than 80 messages.',
    checkWhen: 'Summarising multi-month enterprise tickets.',
    status: 'Planned',
    reviewed: '2026-11-04',
    workaround: 'Split the ticket by quarter.',
  },
];

export default function FramerLimitsTable({
  heading = "What it can't do yet [sample]",
  rows = DEFAULT_ROWS,
}: {
  heading?: string;
  rows?: FramerLimitRow[];
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

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
      <h3 style={{ fontFamily: '"Literata", serif', fontSize: 24, margin: '0 0 16px' }}>
        {heading}
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr
            style={{
              borderBottom: '1px solid #DCD3BC',
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#5C574D',
              textAlign: 'left',
            }}
          >
            <th style={{ padding: '8px' }}>LIMITATION</th>
            <th style={{ padding: '8px' }}>CHECK IT YOURSELF WHEN</th>
            <th style={{ padding: '8px' }}>STATUS</th>
            <th style={{ padding: '8px' }}>LAST REVIEWED</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <React.Fragment key={r.limitation}>
              <tr
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                style={{ borderBottom: '1px solid #DCD3BC', cursor: 'pointer' }}
              >
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{r.limitation}</td>
                <td style={{ padding: '12px 8px', color: '#5C574D' }}>{r.checkWhen}</td>
                <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 12 }}>
                  {r.status === 'Limitation' ? '✗ Check · Limitation' : r.status}
                </td>
                <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 12 }}>
                  {r.reviewed}
                </td>
              </tr>
              {selectedIdx === i && (
                <tr style={{ backgroundColor: '#F5F0E3' }}>
                  <td colSpan={4} style={{ padding: '10px 12px', fontSize: 13 }}>
                    <strong>Workaround:</strong> {r.workaround}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

addPropertyControls(FramerLimitsTable, {
  heading: {
    type: ControlType.String,
    title: 'Heading',
    defaultValue: "What it can't do yet [sample]",
  },
});

