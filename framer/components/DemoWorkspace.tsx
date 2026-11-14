// framer/components/DemoWorkspace.tsx — Standalone Framer Code Component for the Hero Demo Workspace with Property Controls (Part 5.6)
import React, { useState } from 'react';
import { addPropertyControls, ControlType } from 'framer';

export interface FramerScenarioItem {
  chipLabel: string;
  title: string;
  inputLines: string;
  summaryText: string;
  decisionsText: string;
  caveatText: string;
  sampleSeconds: number;
}

export interface FramerDemoWorkspaceProps {
  scenarios: FramerScenarioItem[];
  speed: 1 | 2;
  autoplay: boolean;
  scriptedTagText: string;
  themeMode: 'paper' | 'night';
}

const DEFAULT_SCENARIOS: FramerScenarioItem[] = [
  {
    chipLabel: 'Summarise a customer thread',
    title: 'A customer thread about an extra seat charge',
    inputLines:
      '[m1] Maya: Our invoice shows 4 seats but we only bought 3.\n[m4] Tom: Billing says 4 seats is correct.\n[m5] Maya: Check the audit log please. Also Firefox export is broken.\n[m6] Priya: Found it: j.ortiz added 1 seat on 9 March. Refunding March–May.',
    summaryText:
      'The customer disputed a 4th seat charge [m1, m5]. Billing found j.ortiz added a seat on 9 March and agreed to refund 3 months [m6].',
    decisionsText:
      'Refund 1 seat for March to May [m6]; ship the Firefox export fix this week [m5, m6].',
    caveatText: 'Check: the refund amount is not stated anywhere in the thread.',
    sampleSeconds: 3.1,
  },
  {
    chipLabel: 'Clean an expense sheet',
    title: 'Six messy rows from a Q3 team travel spreadsheet',
    inputLines:
      '[e1] Row 14: 2026-09-12 | Bahn Ticket | €118.40\n[e2] Row 15: 12/09/26 | DB Fernverkehr | €118.40 (Duplicate)\n[e3] Row 16: Hotel Viktoria | €340.00\n[e4] Row 17: Client dinner | 195 (No currency symbol)',
    summaryText:
      'Approved €458.40 across verified rail and hotel items [e1, e3]; merged duplicate Row 15 [e2].',
    decisionsText: 'Hold Row 17 (195) until traveller supplies currency code and VAT slip [e4].',
    caveatText: 'Check: Row 17 writes 195 without a currency symbol or tax receipt.',
    sampleSeconds: 2.8,
  },
];

export default function FramerDemoWorkspace({
  scenarios = DEFAULT_SCENARIOS,
  speed = 1,
  scriptedTagText = 'Sample run, scripted for this demo',
  themeMode = 'paper',
}: FramerDemoWorkspaceProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showWork, setShowWork] = useState(false);
  const current = scenarios[selectedIdx] ?? DEFAULT_SCENARIOS[0];
  const isNight = themeMode === 'night';

  const bgCard = isNight ? '#1D2027' : '#FBF8EF';
  const bgPage = isNight ? '#15171C' : '#F5F0E3';
  const ink = isNight ? '#EDE7D6' : '#1C1B18';
  const muted = isNight ? '#A8A395' : '#5C574D';
  const blue = isNight ? '#8DB0FF' : '#1F4B99';
  const red = isNight ? '#FF8A75' : '#C4321E';
  const border = isNight ? '#323746' : '#DCD3BC';

  return (
    <div
      style={{
        backgroundColor: bgCard,
        color: ink,
        border: `1px solid ${border}`,
        borderRadius: 2,
        fontFamily: '"Albert Sans", sans-serif',
        maxWidth: 1100,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${border}`,
          backgroundColor: bgPage,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>
            Done. Sample run in {current.sampleSeconds} s ({speed}x) [sample]
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: blue,
              marginTop: 2,
            }}
          >
            {scriptedTagText}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWork((v) => !v)}
          style={{
            padding: '6px 12px',
            border: `1px solid ${blue}`,
            backgroundColor: showWork ? blue : bgCard,
            color: showWork ? bgCard : blue,
            fontFamily: 'monospace',
            fontSize: 12,
            borderRadius: 2,
            cursor: 'pointer',
          }}
        >
          {showWork ? 'Hide steps' : 'Show your work'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 0 }}>
        <div style={{ padding: 14, borderRight: `1px solid ${border}` }}>
          {scenarios.map((s, idx) => (
            <button
              key={s.chipLabel}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                marginBottom: 8,
                borderRadius: 2,
                border: idx === selectedIdx ? `2px solid ${blue}` : `1px solid ${border}`,
                backgroundColor: bgPage,
                color: ink,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {s.chipLabel}
            </button>
          ))}
        </div>

        <div style={{ padding: 14, borderRight: `1px solid ${border}` }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: muted, marginBottom: 8 }}>
            INPUT — {current.title}
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {current.inputLines}
          </pre>
        </div>

        <div style={{ padding: 14 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: muted, marginBottom: 8 }}>
            OUTPUT CARDS [sample]
          </div>
          <div
            style={{
              padding: 10,
              marginBottom: 10,
              border: `1px solid ${border}`,
              backgroundColor: bgPage,
            }}
          >
            <strong style={{ fontSize: 13 }}>Summary:</strong>
            <p style={{ fontSize: 13, margin: '4px 0 0' }}>{current.summaryText}</p>
          </div>
          <div
            style={{
              padding: 10,
              marginBottom: 10,
              border: `1px solid ${border}`,
              backgroundColor: bgPage,
            }}
          >
            <strong style={{ fontSize: 13 }}>Decisions:</strong>
            <p style={{ fontSize: 13, margin: '4px 0 0' }}>{current.decisionsText}</p>
          </div>
          <div
            style={{
              padding: 10,
              borderLeft: `3px solid ${red}`,
              backgroundColor: bgPage,
              color: red,
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {current.caveatText}
          </div>
          {showWork && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: `1px dashed ${border}`,
                fontFamily: 'monospace',
                fontSize: 11,
                color: muted,
              }}
            >
              Steps: 1. Read lines → 2. Grouped topics → 3. Extracted decisions → 4. Checked gaps
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

addPropertyControls(FramerDemoWorkspace, {
  scriptedTagText: {
    type: ControlType.String,
    title: 'Scripted Tag',
    defaultValue: 'Sample run, scripted for this demo',
  },
  speed: {
    type: ControlType.Enum,
    title: 'Speed',
    options: [1, 2],
    optionTitles: ['1x', '2x'],
    defaultValue: 1,
  },
  autoplay: {
    type: ControlType.Boolean,
    title: 'Autoplay',
    defaultValue: true,
  },
  themeMode: {
    type: ControlType.Enum,
    title: 'Notebook',
    options: ['paper', 'night'],
    optionTitles: ['Paper', 'Night'],
    defaultValue: 'paper',
  },
});

